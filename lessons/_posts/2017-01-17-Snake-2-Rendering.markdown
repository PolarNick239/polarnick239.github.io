---
layout: ru/239/201612/post
title:  "Задание 32. Змейка и Мухоморы: визуализация"
date:   2017-01-17 12:00:00 +0300
categories: 239 lesson school java swing game snake
---

Общее описание игры [здесь](/lessons/239/lesson/school/java/swing/game/snake/2017/01/10/Snake-overview.html). Первая часть [здесь](/lessons/239/lesson/school/java/swing/game/snake/2017/01/10/Snake-1-Entities.html). Третья часть [здесь](/lessons/239/lesson/school/java/swing/game/snake/2017/01/18/Snake-3-Final.html).

Коротко про [классы в Java](/lessons/239/school/java/base/2017/01/09/Java-classes.html). (пишите/говорите мне, если еще что-то надо описать, или что-то описано плохо/поверхностно)

```Обратите внимание``` на [статью](/lessons/239/lesson/school/java/debug/2017/01/21/Java-debug.html) про отладку приложения.

Дедлайны:
---------

 - 9-1: 32 января
 - 10-1: 28 января
 - 11-1: 28 января
 
-1) Создание проекта по исходникам в IDEA
----------------------------------------

Если вы отправили мне исходники первой части змейки (папку src в архиве) - то вы можете заново создать по ним проект следующим образом:

 - Создайте пустую папку MyProjectName
 - В нее положите папку src с исходниками (пример иерархии: MyProjectName->src->com->snake->...)
 - В IDEA: File->New->Project from existing sources
 - Укажите папку MyProjectName -> Ok
 - Жмите несколько раз Next (по пути смотрите на все значения, но они должны и сами быть верно выставлены), в конце Finish 

0) Отрисовка
------------

Итак в первой части были сделаны базовые компоненты основной логики и небольшая часть ее функциональности.
Перед тем как доделывать функциональность стоит визуализировать текущее состояние мира (клетчатое поле со змейкой и яблоком), т.к. тогда при реализации остальной логики будет возможность сразу ее тестировать.

Для того чтобы визуализировать мир змейки требуется:

1. Создать окно приложения (MainFrame)
2. По текущему состоянию мира научиться заполнять пиксели соответствующими цветами (Renderer)
3. Реализовать цикл, который провоцирует обновление и отрисовку (UpdaterLoop)
4. Добавить точку входа (main-функцию)

```Обратите внимание``` что пункты 2, 3 и 4 делать не обязательно строго последовательно. Скорее-всего разумно реализовать MainFrame, затем сделать набросок Renderer, после чего реализовав цикл и точку входа - начать цикл "что-то доделал - запустил (возможно под отладкой)".

1) MainFrame - окно приложения
--------------------------------------

Как мы уже обсуждали в нашей архитектуре окном заведует класс ```MainFrame``` (о чем можно вспомнить, вглянув на картинку архитектуры [внизу этой страницы](/lessons/239/lesson/school/java/swing/game/snake/2017/01/10/Snake-overview.html))

1.1) Начальный класс MainFrame
==============================

Создайте класс ```MainFrame``` в пакете ```com.snake.gui``` (так же как создавали ```Snake``` и другие классы в пакете ```com.snake.logic```)

```Обратите внимание``` что чтобы можно было кликнуть по ```com.snake``` - сначала надо нажать на шестеренку вверху Project View и там - снять галочку с ```Compact Empty Middle Packages```:

![Compact Empty Middle Packages](/static/snake/screen_compact_empty.jpg)

Чтобы создать в Java окно, достаточно отнаследовать наш ```MainFrame``` от стандартного класса ```JFrame``` (наследование осуществляется ключевым словом ```extends```):

```java
public class MainFrame extends JFrame {         // Объявляем наш класс MainFrame и указываем что он является наследником JFrame (окна)
    
    public MainFrame() {                        // Объявляем конструктор нашего класса
        setVisible(true);                       // который лишь вызывает метод setVisible(true), который достался в наследство от JFrame
                                                // visible = видимый, т.е. setVisible делает окно видимым
    }

    public static void main(String[] args) {    // это main-функция, которая выполняется при запуске приложения
        MainFrame frame = new MainFrame();      // здесь мы просто создаем объект класса MainFrame, и т.к. он сразу в конструкторе становится видимым - окно появляется
    }

}
```

Нужные импорты классов (например ```JFrame```) можно сделать поставив мышку на подсвеченный красным класс и последующим нажатием ```Alt+Enter```->```Import class``` (клик мышкой или ```Enter```).

1.2) Настройка окна
===================

Но окно создается какого-то странного размера. Выставить размер явно можно вызвав метод ```void setPreferredSize(Dimension preferredSize)```, реализованный в классе JFrame, а значит и наследованный в MainFrame. Т.о. в конструктор надо добавить строку ```setPreferredSize(new Dimension(<WIDTH>, <HEIGHT>))```

Заметим что отрисовка делается не в тот массив который прямо сейчас показывается пользователю, а в другой - временный. Т.е. на самом деле цветных массивов два - тот который показывается сейчас, и тот который будет показан в следующий момент (который сейчас заполняется алгоритмом). Это так называемая [двойная буферизация](https://ru.wikipedia.org/wiki/Двойная_буферизация).
 
Чтобы активировать двойную буферизацию нужно после ```setPreferredSize``` вызвать метод ```pack();``` и ```createBufferStrategy(2);```. Первый вызов нужен чтобы окно учло требуемые от него размеры и было готово конструировать буферы изображения. Второй вызов указывает число буферов, которые нам потребуются (нам нужно два буфера - один на показ, второй на подготовку).

Таким образом конструктор MainFrame принимает примерно такой вид (не копируйте отсюда, а напишите сами, пожалуйста):

![MainFrame constructor](/static/snake/mainframe_constructor.png)

P.S.:
 
 - ```Обратите внимание``` что при закрытии окна программа не завершает исполнение, для того чтобы закрытие окна завершала исполнение достаточно настроить окно - ```setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE)```
 - Чтобы можно было изменять размер окна мышкой (и разворотом на весь экран) достаточно вызвать соотествтующий флаг методом ```setResizable(boolean)``` (этот метод реализован в JFrame, а значит наследуется и в MainFrame)

1.3) Метод paint в MainFrame
============================

Добавим метод ```paint(BufferedImage image)``` в MainFrame. Он будет отрисовывать картинку, которая ему передана извне.

Предлагаю это считать за технические детали - скопируйте этот метод в MainFrame:

```java
    public void paint(BufferedImage image) {
        BufferStrategy bs = getBufferStrategy();                                // получаем нашу двойную буферизацию
        Graphics g = bs.getDrawGraphics();                                      // берем графический контекст для отрисовки ("графику")

        g.drawImage(image, 0, 0, image.getWidth(), image.getHeight(), null);    // говорим графике отрисовать переданный сюда image (в прямоугольнике указанного размера, с углом в позиции (0, 0))
        g.dispose();                                                            // сообщаем графике, что она может освободить все временные ресурсы

        bs.show();                                                              // говорим двойной буферизации показать текущий буфер отрисовки
    }
```

Итого получилось примерно следующее (не копируйте пожалуйста отсюда, это условный код):

```java
public class MainFrame extends JFrame (

    publ!c MainFrame() (
        setPreferredSize(new Dimension(800, 600))
        pack()
        createBufferStrategy(2)
        setVisible(true)
    )

    publ!c void paint(BufferedImage img) (
        BufferStrategy gbs = getBufferStrategy()
        Graphics g = gbs.getDrawGraphics()

        g.drawImage(img O O img.getWidth() img.getHeight() null)
        g.dispose()

        gbs.show()
    )

    publ!c static void main(String[] args) (
        MainFrame frame = new MainFrame()
    )
)

```

2) Renderer - визуализация мира
-------------------------------

Общий вид класса ```com.snake.gui.Renderer```:

(Чтобы делать горизонтальную прокрутку для чтения комментариев - попробуйте стрелочки или ```Shift+КолесоМышки```)

```java
public class Renderer {

    public Renderer(World world, int tileSize) {                        // конструктор - нам достаточно иметь доступ к миру, и знать какой размер каждой клетки в этом поле (т.е. ширина и высота в пикселях)
        ...
    }

    public void render(int[] pixels) {                                  // метод отрисовки в одномерный массив пикселей, где каждое число - цвет.
        // TODO: на самом деле кроме одномерного массива сюда так же необходимо передать информацию о том, как этот массив интепретировать - т.е. ширину и высоту окна 
        renderBackground(world.getWidth(), world.getHeight(), pixels);  // рисуем фон: клетки внутри поля - один цвет, остальные пиксели - другой
        renderSnake(world.getSnake(), pixels);                          // рисуем змейку: голова - один цвет, остальные части - другой цвет
        renderApple(world.getApple(), pixels);                          // рисуем яблоко: одна клетка какого-то цвета
    }

    public void renderBackground(...) {                                 // рисуем фон: клетки внутри поля - один цвет, остальные пиксели - другой
        // TODO
    }

    public void renderSnake(...) {                                      // рисуем змейку: голова - один цвет, остальные части - другой цвет
        // TODO
    }

    public void renderApple(...) {                                      // рисуем яблоко: одна клетка какого-то цвета
        // TODO
    }

    private static int color(int r, int g, int b) {                     // формируем число-цвет из трех компонент - r=red, g=green, b=blue (от 0 до 255)
        return color(r, g, b, 255);
    }

    private static int color(int r, int g, int b, int a) {
        return (a << 24) | (r << 16) | (g << 8) | b;
    }

    ...
    public int APPLE_COLOUR = color(0, 255, 0);                         // пример константы, описывающей цвет яблока
    ...

}
```

Вы можете реализовывать как хотите, но вот идеи:

- (простой путь) Рисовать все с предположением что левый верхний угол левой верхней клетки мира совпадает с левым верхним пикселем окна.
- (сложный путь) Рисовать все с предположением, что центр клетки-головы змейки совпадает с центром окна.
- (сложный путь+) Обратить внимание что сложный путь полезен лишь когда мир не влезает в окно, и придумать что-нибудь любопытное адаптивное (чтобы если мир влезает - не было движения центра окна вместе с головой змеи, но при этом случай "мир не влезает" обрабатывался как в сложном пути).

И наконец общая рекомендация реализации циклов (это условный код, в любом его месте вам может понадобится что-то править, поэтому воспринимайте его как идею и подсказку, а не как что-то, что надо скопировать и доделывать):

```java
for (int tileY = ...) {                                     // перебираем координату y интересующих нас клеток
    for (int tileX = ...) {                                 // перебираем координату x
    
        for (int dy = 0; dy < tileHeight; ++dy) {           // перебираем отступ dy пикселя внутри текущей клетки (tileY, tileX)
            for (int dx = 0; dx < tileWidth; ++dx) {        // перебираем отступ dx
            
                int x = ... + tileX * tileWidth + dx;       // вычисляем x и y - координаты пикселя в окне
                int y = ... + tileY * tileHeight + dy;

                pixels[y * pixelsWidth + x] = SOME_COLOR;   // проставляем цвет
            }
        }
    }
}
```

3) UpdaterLoop - цикл обновления всего
--------------------------------------

Как мы уже обсуждали - у нас будет UpdaterLoop - класс ответственный за постоянное обновление и отрисовку мира:

```java
public class UpdateLoop {

    public UpdateLoop(World world, Renderer renderer) {
        ...
    }

    public void start() {
        while (true) {
            // world.update();  // обновление мира в рамках второй части не обязательно - но обязательно будет в третьей части (пока эту строку можно оставить закомментированной)
            renderer.render();  // отрисовываем состояние мира
        }
    }

}
```

Заметим, что у нас до сих пор нигде не создается массив pixels - его может создавать UpdateLoop (хотя это не логично, я не знаю почему я сделал это в нем - так что подумайте и перетащите его в более логичное место, будем считать что это так и было задумано - как бага в архитектуре, которую предложено поправить вам). 

При этом массив должен быть понятен для графической составляющей Java - быть частью ```BufferedImage``` который ожидается в методе ```MainFrame.paint(BufferedImage image)```.

Т.е. мы должны создать холст для рисования - ```BufferedImage``` такого же размера, каким обладает наше окно. И передать массив пикселей из этого холста в ```Renderer.render```:
 
```java
public class UpdateLoop {

    private BufferedImage img = null;

    public UpdateLoop(MainFrame frame, World world, Renderer renderer) {
        ...
    }

    public void start() {
        while (true) {
            // Обновление мира в рамках второй части не обязательно - но обязательно будет в третьей части (пока эту строку можно закомментировать)
            // world.update();
        
            // Если холст для рисования еще не готов или его размер отличается от размера окна - создаем новый холст (BufferedImage)
            if (img == null || img.getWidth() != frame.getWidth() || img.getHeight() != frame.getHeight()) {
                img = new BufferedImage(frame.getWidth(), frame.getHeight(), BufferedImage.TYPE_INT_ARGB);
            }

            // Получаем доступ (ввиде массива) к цветам пикселей из холста
            int[] pixels = ((DataBufferInt) img.getRaster().getDataBuffer()).getData();
            // Отрисовываем состояние мира
            renderer.render(world, pixels, img.getWidth(), img.getHeight());

            frame.paint(img);
        }
    }

}
```

4) Точка входа (main-функция)
-----------------------------

Все что мы написали должно откуда-то вызываться - это происходит из функции ```main``` в ```MainFrame```:

```java
public static void main(String[] args) {
    ...
}
```

Заметим, что она должна сконструировать MainFrame, Renderer, UpdaterLoop. Затем нужно вызвать метод start() у созданного UpdaterLoop.

5) Тестирование и отправка задания
----------------------------------

Чтобы запустить приложение нужно нажать правой кнопкой на класс с функцией ```main``` (вероятно ```MainFrame```) и там нажать ```Run ...``` (или Debug).

```Обратите внимание``` на [статью](/lessons/239/lesson/school/java/debug/2017/01/21/Java-debug.html) про отладку приложения.

Ваше приложение должно показывать примерно следующее: мир, в нем змея стоит в изначальной позиции (например в углу или центре мира).

Отправляйте выполненное задание ввиде zip-архива ```src``` папки, и пожалуйста:

 - Тему письма называйте правильно (номер этого задания, как написано в самом верху - 32)
 - zip-архив (или 7zip) называйте по тем же правилам, как назывались патчи (только расширение файла теперь не ```.patch```, а ```.zip```)
 
Т.е. формат такой же как и про [патч](/lessons/239/lesson/school/1703/05/16/Patch.html), только вместо ```.patch``` вы шлете ```.zip```.
