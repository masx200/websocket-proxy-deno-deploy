export async function readBytesWithBYOBReader(
    stream: ReadableStream,
    numBytes: number,
): Promise<Uint8Array> {
    const reader = stream.getReader({ mode: "byob" });
    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (receivedBytes < numBytes) {
        // 创建一个新的视图来存储接下来要读取的字节
        const view = new Uint8Array(numBytes - receivedBytes);
        const { done, value } = await reader.read(view);

        if (done) {
            break; // 没有更多的数据可以读取
        }

        // 将读取到的数据添加到chunks数组中
        chunks.push(value.subarray(0, value.length));
        receivedBytes += value.length;
    }

    // 合并所有chunks到一个Uint8Array中
    const result: Uint8Array = new Uint8Array(receivedBytes);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    reader.releaseLock();
    return result;
}
