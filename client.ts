const listener = Deno.listen({ port: 9000, transport: "tcp" });

try {
    for await (const conn of listener) {
        (async () => {
            const ws = new WebSocketStream("ws://loca99999999999lhost:8000", {
                headers: {
                    "x-Protocol": "Transmission Control",
                    "X-Destination-Address": "www.ba99999999999idu.com",
                    "X-Destination-Port": "80",
                },
            });
            // console.log(ws);
            try {
                const webConn = await ws.opened; //.catch(console.error);
                // console.log(webConn);
                conn.readable.pipeTo(webConn.writable).catch(function (e) {
                    try {
                        ws.close();
                        conn.close();
                    } catch (e) {
                        console.error(e);
                    }

                    return console.error(e);
                });
                webConn.readable.pipeTo(conn.writable).catch(function (e) {
                    try {
                        ws.close();
                        conn.close();
                    } catch (e) {
                        console.error(e);
                    }
                    return console.error(e);
                });
            } catch (error) {
                console.error(error);
                try {
                    ws.close();
                    conn.close();
                } catch (e) {
                    console.error(e);
                }
            }
        })().catch(console.error);
    }
} catch (error) {
    console.error(error);
}
