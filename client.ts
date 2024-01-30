import { get_proxy_client_port } from "./get_proxy_client_port.ts";
import { socks5_server } from "./socks5_server.ts";

const listener = Deno.listen({
    port: get_proxy_client_port(),
    transport: "tcp",
});

try {
    for await (const conn of listener) {
        (async () => {
            await socks5_server(conn);
        })().catch(console.error);
    }
} catch (error) {
    console.error(error);
}
