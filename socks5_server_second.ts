import { proxy_tcp_over_websocket } from "./proxy_tcp_over_websocket.ts";
import { readBytesWithBYOBReader } from "./readBytesWithBYOBReader.ts";

/**
 *https://www.rfc-editor.org/rfc/rfc1928
 */
export async function socks5_server_second(conn: Deno.Conn) {
    const writer = conn.writable.getWriter();

    //Requests
    const [VER, CMD, RSV, ATYP] = await readBytesWithBYOBReader(
        conn.readable,
        4
    );

    writer.releaseLock();
    await proxy_tcp_over_websocket(conn);
}
