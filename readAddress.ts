import { formatIPv4 } from "./formatIPv4.ts";
import { formatIPv6 } from "./formatIPv6.ts";

/**
Returns an object with three properties designed to look like the address
returned from socket.address(), e.g.:

    { family: 'IPv4', address: '127.0.0.1', port: 12346 }
    { family: 'IPv6', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }
    { family: 'domain', address: '1404:abf0:c984:ed7d:110e:ea59:69b6:4490', port: 8090 }

The given `type` should be either 1, 3, or 4, and the `buffer` should be
formatted according to the SOCKS5 specification.
*/
export function readAddress(
    type: number,
    buffer: Uint8Array
):
    | {
          family: string;
          address: string;
          port: number;
      }
    | undefined {
    if (type == 1) {
        // IPv4 address
        return {
            family: "IPv4",
            address: formatIPv4(buffer),
            port: buffer.readUInt16BE(4),
        };
    } else if (type == 3) {
        // Domain name
        const length = buffer[0];
        return {
            family: "domain",
            address: buffer.slice(1, length + 1).toString(),
            port: buffer.readUInt16BE(length + 1),
        };
    } else if (type == 4) {
        // IPv6 address
        return {
            family: "IPv6",
            address: formatIPv6(buffer),
            port: buffer.readUInt16BE(16),
        };
    }
}
