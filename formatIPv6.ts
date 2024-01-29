import { readUInt16BE } from "./readUInt16BE.ts";

export function formatIPv6(buffer: Uint8Array): string {
    // buffer.length == 16
    const parts = [];
    for (let i = 0; i < 16; i += 2) {
        parts.push(readUInt16BE(buffer, i).toString(16));
    }
    return parts.join(":");
}
