import { readBytesWithBYOBReader } from "./readBytesWithBYOBReader.ts";
/**
 * https://www.rfc-editor.org/rfc/rfc1928
 */
export async function socks5_server_first(conn: Deno.Conn) {
    const writer = conn.writable.getWriter();
    //Procedure for TCP-based clients
    const VER = (await readBytesWithBYOBReader(conn.readable, 1))[0];
    const NMETHODS = (await readBytesWithBYOBReader(conn.readable, 1))[0];
    const METHODS: Uint8Array = await readBytesWithBYOBReader(
        conn.readable,
        NMETHODS,
    );
    // +----+----------+----------+
    // |VER | NMETHODS | METHODS  |
    // +----+----------+----------+
    // | 1  |    1     | 1 to 255 |
    // +----+----------+----------+

    // +----+--------+
    // |VER | METHOD |
    // +----+--------+
    // | 1  |   1    |
    // +----+--------+

    // o  X'00' NO AUTHENTICATION REQUIRED
    // o  X'01' GSSAPI
    // o  X'02' USERNAME/PASSWORD
    // o  X'03' to X'7F' IANA ASSIGNED
    // o  X'80' to X'FE' RESERVED FOR PRIVATE METHODS
    // o  X'FF' NO ACCEPTABLE METHODS
    if (VER === 5 && [...METHODS].includes(0)) {
        await writer.write(new Uint8Array([5, 0]));
    } else {
        await writer.write(new Uint8Array([5, 255]));

        conn.close();
        return false;
    }

    writer.releaseLock();
    return true;
    // await proxy_tcp_over_websocket(conn);
}
