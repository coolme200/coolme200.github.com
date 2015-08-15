---
layout: post
title: Start with Git
cover:
date: 2015-08-15 20:00:00
categories: posts
---

## Step 0

> 下载客户端 https://help.github.com/articles/set-up-git

> windows 下需要安装 Git Bash命令行工具 安装完后操作同 linux


## Step 1


> 安装完成后设置账号，邮箱,提交的时候显示的名称。

```
$ git config --global user.name "tangyao"
$ git config --global user.email "tangyao@taobao.com"
```

> 查看设置情况

```
$ git config --get user.name
$ git config --get user.email
```

## Step 2

> 创建 sshkey用于连接服务器的时候认证

```
$ cd .ssh
```

> 保证. ssh目录下名称为id_rsa, id_rsa.pub的文件是唯一的，如果已经存在的话先备份一下。

```bash
$ mkdir back_rsa
$ cp id_rsa* back_rsa
$ rm id_rsa*
$ ssh-keygen -t rsa -C "tangyao@taobao.com"
```

> 复制id_rsa.pub中的内容添加到 github中

> 登陆 github系统。点击右上角的 Account Settings--->SSH Public keys ---> add another public keys

> 把你本地生成的密钥复制到里面（key文本框中）， 点击 add key 就ok了

> 测试是否连接成功

> 复制的key里面带空行的样子 （vi取到的可能有问题）

```
$ ssh﻿ git@github.com  

echo: Hi coolme200/top! You've successfully authenticated, but GitHub does not provide shell access.
```

## Step 3

> 创建工作目录

```
$ mkdir helloworld
$ cd helloworld (到workspace的项目目录下执行)
```

> 初始化，否则这不会被认为是一个 git项目

$ git init

> 设置项目远程版本库地址

> 例1（适用 github）

```
$ git remote add origin master http://github.com/coolme200/hello
```

> 例2（适用 gitlab）

```
$ git remote add origin master git@gitlab.taobao.ali.com:varworld.git
```

> 错误提示：

> `fatal: remote origin already exists.`

> 解决办法：

```
$ git remote rm origin
```
__注意__

> 1、先输入  `$ git remote rm origin`

> 2、再输入  `$ git remote add origin git@github.com:djqiang/gitdemo.git` 就不会报错了！

> 3、如果输入 `$ git remote rm origin` 还是报错的话，`error: Could not remove config section 'remote.origin'`. 我们需要修改gitconfig文件的内容

> 4、找到你的github的安装路径，我的是`C:\Users\ASUS\AppData\Local\GitHub\PortableGit_ca477551eeb4aea0e4ae9fcd3358bd96720bb5c8\etc`

> 5、找到一个名为`gitconfig`的文件，打开它把里面的`[remote "origin"]`那一行删掉就好了！


## Step 4

> 获取代码

```
$ git pull origin master

```

## Step 5


> 修改代码

> 提交代码至本地版本库

```
$ git add test.js
$ git commit -m 'commit'
```

## Step 6

> 提交至服务器

```
$ git push origin master
```

> 错误提示：

> `error: failed to push som refs to ........`

> 解决办法,先pull 下来 再push 上去

```
$ git pull origin master
 ex:1
$ git push origin
default to pushing only the current branch to <code> origin </code> use <code> git config remote.origin.push HEAD </code>.
```

## Setp 7


>  切换到master

```
$ git checkout master
```
> fetch最新代码

```
$ git fetch origin master
```

> 显示分支列表，包括远程。

```
$ git branch -a
$ git fetch -p origin
```

> 创建分支new1

```
$ git branch new1
```

> 提交修改内容到分支new1

```
$ git push origin new1
```

> 切换到主干master

```
$ git checkout master
```

> 将主干master-new1合并

```
$ git merge master new1
```

> 将变更提交到主干master

```
$ git push origin master
```

> 切换到主干master

```
$ git checkout master
```

> 删除分支

```
$ git branch -d new1
```

> 删除服务器分支

```
$ git push origin :new1
```