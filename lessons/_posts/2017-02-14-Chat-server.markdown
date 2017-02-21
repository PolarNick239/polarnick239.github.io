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

    private final MessageListener listener; // Обработчик входящих собщений
    
    private final Object outputLock = new Object();   // Не обращайте внимания, эти два объекта
    private final Object listenerLock = new Object(); // используются в synchronized-блоках

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

Чат готов!

3) Многопользовательская рисовалка
----------------------------------

Теперь вам предлогается аналогичным образом сделать многопользовательскую программу для рисования:

Каждое сообщение в многопользовательской рисовалке будет описывать отрезок. Соответственно сообщение имеет вид:

```Segment x0 y0 x1 y1```

Где:

 - ```Segment``` - фиксированная строка, она указывает типа сообщения (в данном задании достаточно одного вида сообщений, но это задел на развитие рисовалки)
 - ```x0 y0``` - пара целых чисел через пробел, описывающих координаты начала отрезка
 - ```x1 y1``` - пара целых чисел через пробел, описывающих координаты конца отрезка
 
В случае если вы хотите добавить имя/идентификацтор пользователя в сообщение, то его вид может стать например таким:
 
```Segment UserId x0 y0 x1 y1```
 
В случае если вы хотите добавить цвет к отрезку:
 
```Segment x0 y0 x1 y1 r g b```
 
Где ```r g b``` - три числа в диапазоне от 0 до 255 (включительно).

3.1) С точки зрения клиента:
----------------------------

 - Клиент может рисовать непрерывные (пока кнопка зажата) линии движениями мышки (как в [Задании 39 - Пункт 6](/lessons/239/lesson/school/java/paint/swing/2017/01/24/Simple-drawer.html))
 - Клиент отправляет на сервер сообщения, описывающие новые нарисованные отрезки
 - Клиент получает сообщения об отрезках, по мере их рисования другими пользователями
 
3.2) С точки зрения сервера:
----------------------------

 - Постоянно ожидать подключения новых пользователей
 - Когда клиент присылает новый отрезок - рассылать его всем пользователям
 - Помнить о всех отрезках, который накопились за все время
 - Когда новый клиент подключается - в первую очередь отправить в него подряд все отрезки, который уже нарисованы
 
4) Отправка задания
-------------------

Отправляйте выполненное задание ввиде zip-архива ```src``` папки, и пожалуйста:

 - Тему письма называйте правильно, например: ```Задание 41 16-1 Полярный Коля```
 - Правильно названный zip-архив (или 7zip), внутри которого папка ```src``` с ```.java``` файлами, пример названия: ```41_16_1_polyarniy_nikolay.zip```

5) Частые проблемы
------------------

```Ситуация:``` При запуске сервера выводится исключение ```java.net.BindException: Address already in use (Bind failed)```

Это означает что слушать по такому порту сервер не смог, т.к. этот порт уже кем-то занят. Скорее-всего вы забыли остановить запущенный ранее сервер (нажать красную квадратную стоп-кнопку).

```Ситуация:``` При запуске клиента не устанавливается соединение с исключением ```java.net.ConnectException: Connection refused: connect```

Это означает, что клиент попытался установить соединение по какому-то порту, но на этом порту никто не ждал гостей, т.е. сервер не был запущен и не создал на этом порту свой ```ServerSocket```.

ДАЛЬШЕ ВСЕ ОПЦИОНАЛЬНО, ИГНОРИРУЙТЕ. Обработка разных видов сообщений
----------------------------------------------------------------------

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
