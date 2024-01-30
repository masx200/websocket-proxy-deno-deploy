export function get_proxy_server_port(): number | undefined {
    return config["proxy_server_port"] ?? 8000;
}
import config from "./config.json" with { type: "json" };
