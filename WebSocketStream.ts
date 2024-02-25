export class WebSocketStream {
    public socket: WebSocket; // WebSocket对象
    public readable: ReadableStream<Uint8Array>; // 可读流对象
    public writable: WritableStream<Uint8Array>; // 可写流对象

    constructor(socket: WebSocket) {
        this.socket = socket; // 初始化WebSocket对象
        this.readable = new ReadableStream({
            start(controller) {
                socket.onmessage = function ({ data }) {
                    // console.log(data);
                    return controller.enqueue(new Uint8Array(data)); // 将接收到的数据转换为Uint8Array并加入队列
                };
                socket.onerror = (e) => controller.error(e); // 捕获WebSocket的错误事件
                socket.onclose = (e) => {
                    console.log("socket closed", e);
                    // return controller.close(/* e */)}
                    try {
                        controller.close(); /* e */
                    } catch (error) {
                        console.error(error);
                    }
                };
            },
            cancel(/* reason */) {
                socket.close(); // 取消可读流
            },
        });
        this.writable = new WritableStream({
            start(controller) {
                socket.onerror = (e) => controller.error(e); // 捕获WebSocket的错误事件
            },
            write(chunk) {
                // console.log(chunk);
                socket.send(chunk); // 将可写流的数据发送给WebSocket
            },
            close() {
                socket.close(); // 关闭可写流
            },
            abort(e) {
                console.error(e);
                socket.close(); // 中止可写流
            },
        });
    }
}
