import { WebSocketStream } from "./WebSocketStream.ts";
import { get_proxy_server_port } from "./get_proxy_server_port.ts";

Deno.serve(
    { port: get_proxy_server_port() },
    async (request): Promise<Response> => {
        // console.log(request);
        const upgradeHeader = request.headers.get("Upgrade");
        if (
            upgradeHeader !== "websocket" &&
            request.headers.get("connection") !== "Upgrade"
        ) {
            return new Response("not found", { status: 404 });
        }

        // const Source_Address = request.headers.get("X-Source-Address");
        const Destination_Address = request.headers.get(
            "X-Destination-Address",
        );
        // const Source_Port = request.headers.get("X-Source-Port");
        const Destination_Port = request.headers.get("X-Destination-Port");
        const Protocol = request.headers.get("x-Protocol");
        if (
            "Transmission Control" === Protocol &&
            Destination_Address &&
            Destination_Port
        ) {
            console.log({ Protocol, Destination_Address, Destination_Port });
            try {
                const tcp = await Deno.connect({
                    port: Number(Destination_Port),
                    hostname: Destination_Address,
                    transport: "tcp",
                });

                const { response, socket } = Deno.upgradeWebSocket(request);
                const tcpReadableStream = tcp.readable;
                const tcpWritableStream = tcp.writable;
                const webSocketStream = new WebSocketStream(socket);
                const webReadableStream = webSocketStream.readable;
                const webWritableStream = webSocketStream.writable;

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
        //接受websocket连接
    },
);
