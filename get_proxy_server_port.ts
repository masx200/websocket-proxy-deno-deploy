/**
 * 获取代理服务器端口
 * @returns {number | undefined} 代理服务器端口，如果未配置则返回undefined
 */
export function get_proxy_server_port(): number | undefined {
    return config["proxy_server_port"] ?? 8000;
}

/**
 * 导入配置文件
 * @param {string} path - 配置文件路径
 * @returns {object} 配置文件内容
 */
import config from "./config.json" with { type: "json" };
