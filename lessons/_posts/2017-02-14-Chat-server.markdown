---
layout: 239post
title:  "Задание 41. Многопользовательские чат и рисовалка"
date:   2017-02-14 12:00:00 +0300
categories: 239 lesson school java socket
---

Это задание является последней частью мультиплеерного Paint.

Как более простой вариант многопользовательского приложения ниже описано как сделать чат.

Сделав чат по предложенной инструкции, вы по аналогии должны будете самостоятельно сделать мультиплеерный Paint.

Обратите внимание, что несмотря на то, что клиент и сервер - являются двумя разными программами, удобно их реализовывать в рамках одного проекта. Например можно это сделать в двух разных классах (это могут быть классы ```MainClient``` и ```MainServer```) с двумя ```main```-функциями.

```P.S.``` игнорируйте строчки вроде ```synchronized (lock) { ...someCode... }``` внутри ```StreamWorker```. Считайте что это то же самое, что и просто ```{ ...someCode... }```.

Дедлайн:
--------

 - 9-1: когда-нибудь не скоро
 - 10-1: ведь еще не задано
 - 11-1: так что можете игнорировать это задание (или не можете, если я явно так скажу)

0) Про чат
----------

В этом задании рассматриваются две программы: сервер и клиент.

В помощь вам предложена простая библиотечка, которая возьмет на себя задачу создания потока на каждого подключенного клиента, и задачу получения/отправки сообщений от этого/этому клиенту. Аналогично эту библиотечку удобно использовать для клиента, чтобы получать оповещения о входящих сообщениях со стороны сервера. Ниже подробно изложено, как на основе этого сделать чат. После чата аналогично, но уже самостоятельно, вам надо будет сделать мультиплеерную рисовалку.

```Задача клиента:``` подключиться к серверу и отправлять ему сообщения которые вводит пользователь в консоли. При получении сообщения от сервера - печатать его в консоль.
 
```Задача сервера:``` ожидать подключений новых клиентов. С помощью библиотеки обрабатывать поступающие от клиентов сообщения - т.е. пересылать эти сообщения всем клиентам.

1) Библиотечка
--------------

Обрабатывающий потоки данных класс должен как-то оповещать о событиях (новых сообщениях). Раньше мы уже использовали ```KeyListener``` и ```MouseListener``` для обработки событий нажатия кнопок и мышки. В данном случае используется аналогичный механизм, но абстрактный класс ```MessageListener``` подходящий под наши нужды выглядит например так:

```java
public abstract class MessageListener {

    abstract void onMessage(String text);

    abstract void onDisconnect();

    void onException(Exception e) {
        e.printStackTrace();
    }

}
```

Класс ```StreamWorker```, который будет заниматься тем, чтобы получать новые сообщения из входного потока данных (поток может быть как от клиента, так и от сервера):

```java 
import java.io.*;
import java.net.SocketException;

public class StreamWorker implements Runnable, Closeable {

    private final BufferedReader in;    // Входной поток данных
    private final PrintWriter out;      // Выходной поток данных
    // private  - означает, что до этого поля нельзя дотянуться извне, ведь напрямую с ним никто другой кроме данного класса работать не должен
    // final    - означает, что этот объект всегда будет один и тот же (почти то же самое, что и const), т.е. что это финальный объект

    private final Object outputLock = new Object();
    private final Object listenerLock = new Object();

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
                synchronized (listenerLock) {
                    this.listener.onMessage(s);
                }
            }
        } catch (SocketException e) {
            if (e.getMessage().equals("Connection reset")) {
                // Если случившаяся исключительная ситуация - разрыв соединения, то вызываем соответствующую обработку события
                synchronized (listenerLock) {
                    this.listener.onDisconnect();
                }
            } else {
                // Иначе - просто обрабатываем ошибку
                synchronized (listenerLock) {
                    this.listener.onException(e);
                }
            }
        } catch (IOException e) {
            // Провоцируем обработку случившейся исключительной ситуации (например клиент разорвал соединение)
            synchronized (listenerLock) {
                this.listener.onException(e);
            }
        }
    }

    // Этот метод запускает цикл в методе run(), который будет считывать входящие сообщения и отдавать их на обработку в listener
    public void start() {
        Thread thread = new Thread(this, "StreamWorker");
        thread.start();
    }

    // Это метод отправки сообщения
    public void sendMessage(String text) {
        synchronized (outputLock) {
            out.println(text);
        }
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

2) Пример использования библиотеки для реализации чата
------------------------------------------------------

2.1) Клиент чата
----------------

Соответственно простейший клиент похожий на клиент из [Задания 40](/lessons/239/lesson/school/java/socket/2017/01/25/Simple-echo-server.html), но реализованный на базе этого класса ```StreamWorker``` выглядит примерно так:

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.Socket;

public class ChatClient extends MessageListener { // Наследуемся от MessageListener, чтобы обрабатывать входящие сообщения

    public static void main(String[] args) throws IOException {
        ChatClient client = new ChatClient("127.0.0.1", 2391);
        client.run();
    }

    private final String host;
    private final int port;
    private boolean isDisconnected;

    public ChatClient(String host, int port) {
        this.host = host;
        this.port = port;
        this.isDisconnected = false;
    }

    @Override
    void onMessage(String text) { // Реализуем метод, обрабатывающий входящие сообщения
        // Печатаем входящее сообщение в консоль:
        System.out.println("Message from server: " + text);
    }

    @Override
    void onDisconnect() { // Реализуем метод, обрабатывающий событие "соединение разорвано"
        // Например можно напечатать, что соединение с сервером было разорвано
        System.out.println("Disconnected from server!");
        this.isDisconnected = true;
    }

    public void run() throws IOException {
        System.out.println("Connecting to " + this.host + ":" + this.port + "...");
        // Устанавливаем соединение с сервером
        Socket socket = new Socket(this.host, this.port);
        System.out.println("Connected!");

        // Создаем почтальона, который будет оповещать нас (за счет передачи себя - this третьим аргументом под MessageListener listener)
        StreamWorker postman = new StreamWorker(socket.getInputStream(), socket.getOutputStream(), this);
        // Запускаем почтальона, он начнет в отдельном потоке ожидать входящие строки текста
        postman.start();

        // Создаем объект, позволяющий считывать строка за строкой ввод из консоли
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        // Ожидаем ввод строки в консоль
        String userInput = in.readLine();
        // Пока считанная строка не null (пустая строка - тоже строка, а вот null означает о том, что поток данных из консоли был закрыт)
        while (userInput != null) {
            if (this.isDisconnected) {
                System.out.println("Can't send message: disconnected from server!");
                userInput = null;
            } else {
                // Отправляем через почтальона сообщение серверу (будет использоваться поток данных переданный почтальону в конструктор вторым аргументом)
                postman.sendMessage(userInput);
                // Ожидаем ввод строки в консоль
                userInput = in.readLine();
            }
        }

        System.out.println("Closing...");
        in.close();
        postman.close();
        System.out.println("Finish!");
    }
}
```

2.2) Сервер чата
----------------

Сервер на базе предложенной библиотечки получается из примерно следующих набросков кода:

```java
// Создаем серверный сокет - швейцара, который будет пускать в наш чат долгожданных гостей
ServerSocket server = new ServerSocket(port);

while (true) {
    // Дожидаемся очередного гостя
    Socket client = server.accept();
    // Создаем почтальона, который будет ожидать входящие сообщения от данного пользователя, и оповещать о них нас - сервер
    StreamWorker postman = new StreamWorker(client.getInputStream(), client.getOutputStream(), this);
    // Поток, следящий за входными строчками от этого клиента запускается:
    worker.start();
    // Запоминаем почтальона, выделенного данному клиенту в перечне всех почтальонов
    postmans.add(postman);
}
```

Соответственно примерно так может выглядить обработка входящего сообщения:

```java
// Пробегаем по всем почтальонам
for (int i = 0; i < workers.size(); i++) {
    StreamWorker postman = postmans.get(i);
    // Шлем полученное сообщение каждому клиенту (включая клиента являющегося оригинальным отправителем):
    postman.sendMessage(text);
}
```

2.3) Обработка разных видов сообщений
-------------------------------------

TODO

Пример класса ```Message``` - описывающего сообщение:

```java
public class Message {

    private final String userName;
    private final String text;

    public Message(String userName, String text) {
        this.userName = userName;
        this.text = text;
    }

    // Это функция, которая по строке - конструирует новый объект данного типа
    // Обратите внимание на ключевое слово static - оно говорит о том, что это "глобальная функция", и ее можно вызвать от класса Message
    // Т.е. не треубется обратиться к существующему конкретному объекту типа Message - достаточно вызвать Message.parseMessage(...)
    public static Message parseMessage(String s) {
        // Ищем первое вхождение пробела
        int firstSpace = s.indexOf(' ');
        if (firstSpace == -1) {
            throw new IllegalArgumentException("Некорректная строка: '" + s + "', ожидалась строка формата: '<userName> <text>'.");
        }

        // Вытаскиваем подстроку - префикс вплоть до пробела
        String user = s.substring(0, firstSpace);
        // Вытаскиваем подстроку - суффикс сразу после пробела
        String messageText = s.substring(firstSpace + 1, s.length());
        return new Message(user, messageText);
    }

    // Эта функция симметрична функции parseMessage - она представляет текущий объект ввиде строки такого формата,
    // чтобы parseMessage по этой строке мог восстановить объект
    @Override
    public String toString() {
        return userName + " " + text;
    }

}
```
