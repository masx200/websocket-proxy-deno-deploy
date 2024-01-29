export async function proxy_tcp_over_websocket(conn: Deno.Conn) {
    const ws = new WebSocketStream("ws://localhost:8000", {
        headers: {
            "x-Protocol": "Transmission Control",
            "X-Destination-Address": "www.baidu.com",
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
            await ws.closed;
        } catch (e) {
            console.error(e);
        }
    }
}
