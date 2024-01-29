import { socks5_server } from "./socks5_server.ts";

const listener = Deno.listen({ port: 9000, transport: "tcp" });

try {
    for await (const conn of listener) {
        (async () => {
            await socks5_server(conn);
        })().catch(console.error);
    }
} catch (error) {
    console.error(error);
}
