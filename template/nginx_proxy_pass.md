## Nginx 配置反向代理

```

# server list
upstream act_servers {
  server 192.168.1.100:80;
  server 192.168.1.101:80;
}

server {

  # 所有以/abc/开头的请求
  location ^~/abc/ {
    
    # http://act_servers/abc/  ==>  proxy_pass http://act_servers
    # http://act_servers/  ==> proxy_pass http://act_servers/
    proxy_pass http://act_servers/;

  }
  
}
     
```