websocket-proxy-deno-deploy

启动服务端,在 websocket 协议上传输 tcp 代理数据,启动 websocket 服务端

修改配置文件 config.json 中设置服务端监听的端口

```
deno task server
```

启动客户端,在 websocket 协议上传输 tcp 代理数据,启动 websocket
客户端,并在本地启动 socks5 代理服务端

修改配置文件 config.json 中设置客户端监听的端口,和远程服务器的 websocket 地址

```
deno task client
```
