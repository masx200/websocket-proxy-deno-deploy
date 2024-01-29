export function formatIPv4(buffer: Uint8Array): string {
    // buffer.length == 4
    return buffer[0] + "." + buffer[1] + "." + buffer[2] + "." + buffer[3];
}
