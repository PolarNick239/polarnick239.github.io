---
layout: 239post
title:  "Задание 41. Чат"
date:   2017-02-14 12:00:00 +0300
categories: 239 lesson school java socket
---

Это задание является последней частью мультиплеерного Paint.

Как более простой вариант мультипользовательского приложения в рамках этого задания будет подробно описано как сделать чат.

Вы на примере этого чата должны будете самостоятельно сделать мультиплеерный Paint.

Дедлайн:
--------

 - 9-1: когда-нибудь не скоро
 - 10-1: ведь еще не задано
 - 11-1: так что можете игнорировать это задание

0) Про задание
--------------

В этом задании рассматриваются две программы: сервер и клиент.

В помощь вам предложена простая библиотечка, которая возьмет на себя задачу создания потока на каждого подключенного клиент, и получение/отправку сообщений от этого/этому клиенту.

```Задача клиента:``` подключиться к серверу и отправлять ему сообщения которые вводит пользователь в консоли. При получении сообщения от сервера - печатать его в консоль.
 
```Задача сервера:``` ожидать подключений новых клиентов. С помощью библиотеки обрабатывать поступающие от клиентов сообщения - т.е. пересылать эти сообщения всем клиентам.

1) Библиотечка
--------------

Класс ```StreamWorker```, который будет заниматься тем, чтобы получать новые сообщения от клиента, начиная с момента его подключения:

```java 
import java.io.*;

public class StreamWorker implements Runnable, Closeable {

    private final BufferedReader in;    // Входной поток данных
    private final PrintWriter out;      // Выходной поток данных
    // private  - означает, что до этого поля нельзя дотянуться извне, ведь напрямую с ним никто другой кроме данного класса работать не должен
    // final    - означает, что этот объект всегда будет один и тот же (почти то же самое, что и const), т.е. что это финальный объект

    private final MessageListener listener; // Обработчик входящих собщений

    public StreamWorker(InputStream input, OutputStream output, MessageListener listener) {
        this.listener = listener;
        this.in = new BufferedReader(new InputStreamReader(input));
        this.out = new PrintWriter(output, true); // true - флаг autoFlush, он приводит к тому, что буфер будет отправляться сразу - на каждое сообщение
    }

    // Это метод, который StreamWorker обязался реализовать в связи с реализацией интерфейса Runnable (т.к. выше написано StreamWorker implements Runnable)
    // В этом методе StreamWorker ждет поступления новых сообщений, и каждое новое сообщение передает обработчику входящих сообщений
    @Override
    public void run() {
        try {
            String s;
            // Пока входящее сообщение не отсутствует - читаем сообщения одно за другим
            while ((s = in.readLine()) != null) {
                // Отдаем полученное сообщение на обработку
                this.listener.messageReceived(s);
            }
        } catch (IOException e) {
            // Провоцируем обработку случившейся исключительной ситуации (например клиент разорвал соединение)
            this.listener.onException(e);
        }
    }

    // Этот метод запускает цикл в методе run(), который будет считывать входящие сообщения и отдавать их на обработку в listener
    public void start() {
        Thread thread = new Thread(this, "StreamWorker");
        thread.start();
    }

    // Это метод отправки сообщения
    public void sendMessage(String text) {
        out.println(text);
    }

    // Это метод, реализовать который StreamWorker обязуется в связи с реализацией интерфейса Closeable (т.к. выше написано StreamWorker implements Closeable)
    // Общая идея что Closeable = "закрываемый" как например файл. В нашем случае StreamWorker просто закрывает оба потока данных
    @Override
    public void close() throws IOException {
        in.close();  // Закрываем входной поток
        out.close(); // Закрываем выходной поток
    }
}
```

В нем используется абстрактный класс ```MessageListener```:

```java
public abstract class MessageListener {

    abstract void messageReceived(String text);

    void onException(Exception e) {
        e.printStackTrace();
    }

}
```

Соответственно простейший сервер похожий на сервер из ```Задания 39```, но поддерживающий множественных клиентов выглядит примерно так:

```java
ServerSocket socket = new ServerSocket(port);
while (true) {
    Socket client = socket.accept();
    StreamWorker worker = new StreamWorker(client.getInputStream(), client.getOutputStream(), new MyMessageListener());
    worker.start(); // Запускаем в отдельном потоке обработку для этого клиента (т.е. ожидаение и получение новых сообщений)
}
```

Где ```MyMessageListener``` - ваш класс обработки входящих сообщений. Т.е. он наследуется от ```MessageListener```, и тем самым берет на себя обязательство реализовать метод ```messageReceived```.

Тривиальнейший пример:

```java
public class MyMessageListener extends MessageListener {
    @Override
    void messageReceived(String text) {
        System.out.println("Message received: " + text);
    }
}
```
