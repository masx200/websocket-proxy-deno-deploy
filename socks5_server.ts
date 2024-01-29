import { proxy_tcp_over_websocket } from "./proxy_tcp_over_websocket.ts";
import { readBytesWithBYOBReader } from "./readBytesWithBYOBReader.ts";
/**
 https://www.rfc-editor.org/rfc/rfc1928 */
export async function socks5_server(conn: Deno.Conn) {
    const writer = conn.writable.getWriter();
    const VER = (await readBytesWithBYOBReader(conn.readable, 1))[0];
    const NMETHODS = (await readBytesWithBYOBReader(conn.readable, 1))[0];
    const METHODS: Uint8Array = await readBytesWithBYOBReader(
        conn.readable,
        NMETHODS
    );
    if (VER === 0x05 && [...METHODS].includes(0x00)) {
        await writer.write(new Uint8Array([0x05, 0x0]));
    } else {
        await writer.write(new Uint8Array([0x05, 0xff]));

        conn.close();
        return;
    }
    writer.releaseLock();
    await proxy_tcp_over_websocket(conn);
}
