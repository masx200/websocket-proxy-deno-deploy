import config from "./config.json" with { type: "json" };
export function get_websocket_proxy_url(): string {
    return config["websocket_proxy_url"] ?? "ws://localhost:8000";
}
