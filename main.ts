import { WebSocketStream } from "./WebSocketStream.ts";
import { get_proxy_server_port } from "./get_proxy_server_port.ts";
import config from "./config.json" with { type: "json" };
Deno.serve(
    { port: get_proxy_server_port() },
    async (request): Promise<Response> => {
        console.log(request);

        //使用http基本身份验证
        const username = config.server_username;
        const password = config.server_password;
        if (
            username && password &&
            request.headers.get("authorization") !==
                `Basic ${btoa(`${username}:${password}`)}`
        ) {
            return new Response("Unauthorized", {
                status: 401,
                headers: {
                    "WWW-Authenticate":
                        `Basic realm="Access to the staging site", charset="UTF-8"
`,
                },
            });
        }

        // 获取Upgrade头
        const upgradeHeader = request.headers.get("Upgrade");
        // 如果Upgrade头不是websocket并且Connection头不是Upgrade，则返回404
        if (
            upgradeHeader !== "websocket" &&
            request.headers.get("connection") !== "Upgrade"
        ) {
            return new Response("not found", { status: 404 });
        }

        // 获取Source_Address头
        const Destination_Address = request.headers.get(
            "X-Destination-Address",
        );
        // 获取Source_Port头
        const Destination_Port = request.headers.get("X-Destination-Port");
        const Protocol = request.headers.get("x-Protocol");
        // 如果Protocol是CONNECT并且Destination_Address和Destination_Port存在，则执行以下逻辑
        if (
            "CONNECT" === Protocol &&
            Destination_Address &&
            Destination_Port
        ) {
            console.log({ Protocol, Destination_Address, Destination_Port });
            try {
                // 连接目标地址的TCP服务
                const tcp = await Deno.connect({
                    port: Number(Destination_Port),
                    hostname: Destination_Address,
                    transport: "tcp",
                });

                // 升级WebSocket连接
                const { response, socket } = Deno.upgradeWebSocket(request);
                const tcpReadableStream = tcp.readable;
                const tcpWritableStream = tcp.writable;
                const webSocketStream = new WebSocketStream(socket);
                const webReadableStream = webSocketStream.readable;
                const webWritableStream = webSocketStream.writable;

                // 将TCP流和WebSocket流进行数据传输
                tcpReadableStream.pipeTo(webWritableStream).catch(function (e) {
                    try {
                        tcp.close();
                        socket.close();
                    } catch (error) {
                        console.error(error);
                    }

                    return console.error(e);
                });
                webReadableStream.pipeTo(tcpWritableStream).catch(function (e) {
                    try {
                        tcp.close();
                        socket.close();
                    } catch (error) {
                        console.error(error);
                    }
                    return console.error(e);
                });
                return response;
            } catch (error) {
                console.error(error);
                return new Response("bad gateway" + "\n" + String(error), {
                    status: 502,
                });
            }
        } else {
            return new Response("bad request", { status: 400 });
        }
    },
);
