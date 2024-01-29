import { socks5_server_first } from "./socks5_server_first.ts";
import { socks5_server_second } from "./socks5_server_second.ts";
/**
 * https://www.rfc-editor.org/rfc/rfc1928
 */
export async function socks5_server(conn: Deno.Conn) {
    const result = await socks5_server_first(conn);
    if (result) await socks5_server_second(conn);
}
