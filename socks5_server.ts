import { socks5_server_first } from "./socks5_server_first.ts";
import { socks5_server_second } from "./socks5_server_second.ts";
export async function socks5_server(conn: Deno.Conn) {
    await socks5_server_first(conn);
    await socks5_server_second(conn);
}
