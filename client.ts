import { get_proxy_client_port } from "./get_proxy_client_port.ts";
import { socks5_server } from "./socks5_server.ts";
import config from "./config.json" with { type: "json" };

const listener = Deno.listen({
    port: get_proxy_client_port(),
    transport: "tcp",
    hostname: config["proxy_client_hostname"] ?? "0.0.0.0",
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
