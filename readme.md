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

```json
{
    //服务端websocket的url链接
    "websocket_proxy_url": "ws://localhost:8000",
    //服务端websocket的监听端口
    "proxy_server_port": 8000,
    //本地socks服务器的端口
    "proxy_client_port": 9000,
    //本地socks服务器的地址
    "proxy_client_hostname": "0.0.0.0",
    //远程服务器的用户名,可以为null
    "server_username": "hello",
    //远程服务器的用户名,可以为null
    "server_password": "world"
}
```

也可以使用 websocket-proxy-client-socks-node 作为客户端
