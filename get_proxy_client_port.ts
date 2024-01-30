export function get_proxy_client_port(): number {
    return config.proxy_client_port ?? 9000;
}
import config from "./config.json" with { type: "json" };
