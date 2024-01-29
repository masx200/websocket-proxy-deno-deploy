export function readUInt16BE(buffer: Uint8Array, offset = 0) {
    if (offset + 2 > buffer.length) {
        throw new Error("Offset out of bounds");
    }

    const highByte = buffer[offset];
    const lowByte = buffer[offset + 1];

    return (highByte << 8) | lowByte;
}
