export async function proxy_tcp_over_websocket(
    conn: Deno.Conn,
    address: string,
    port: number
): Promise<boolean> {
    const ws = new WebSocketStream("ws://localhost:8000", {
        headers: {
            "x-Protocol": "Transmission Control",
            "X-Destination-Address": address,
            "X-Destination-Port": String(port),
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
        return true;
    } catch (error) {
        console.error(error);
        try {
            ws.close();
            conn.close();
            await ws.closed;
        } catch (e) {
            console.error(e);
        }
        return false;
    }
}
