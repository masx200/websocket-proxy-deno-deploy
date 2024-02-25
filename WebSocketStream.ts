export class WebSocketStream {
    public socket: WebSocket;
    public readable: ReadableStream<Uint8Array>;
    public writable: WritableStream<Uint8Array>;

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.readable = new ReadableStream({
            start(controller) {
                socket.onmessage = function ({ data }) {
                    // console.log(data);
                    return controller.enqueue(new Uint8Array(data));
                };
                socket.onerror = (e) => controller.error(e);
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
                socket.close();
            },
        });
        this.writable = new WritableStream({
            start(controller) {
                socket.onerror = (e) => controller.error(e);
            },
            write(chunk) {
                // console.log(chunk);
                socket.send(chunk);
            },
            close() {
                socket.close();
            },
            abort(e) {
                console.error(e);
                socket.close();
            },
        });
    }
}
