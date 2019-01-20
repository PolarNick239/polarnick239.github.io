---
layout: ru/blogs/239/2018/post
title:  "[Java] Рисование повернутой картинки, нажатия мышкой, обработка клавиатуры"
date:   2019-01-20 0:02:39 +0300
lang:   ru
categories: school239_105_2018_2019
---

Как рисовать картинки
---------------------

Такого рода вещи легко найти в интернете, например по запросу "java swing как нарисовать картинку" (напоминаю, что ```Swing``` - название пакета который мы используем для создания графического интерфейса).

Окажется, что достаточно:

1) Загрузить на диск из интернета какую-нибудь картинку, например [эту](/static/unicorn.png).

2) Добавить поле ```BufferedImage unicornImage;``` в класс ```MyPanel```.

3) Инициализировать его в конструкторе MyPanel, загрузив картинку с диска, например так: ```this.unicornImage = ImageIO.read(new File("C:\\downloads\\unicorn.png"));```

4) Не забыть сделать все импорты всех новых классов через Alt+Enter.

5) Т.к. загрузка картинки может кинуть ошибку (например если файл не будет найден), поэтому вы будете видеть ошибку ```Unhandled exception: java.io.IOException``` - поправьте ее кинув ошибку выше через ```Alt+Enter``` (Add exception to method signature) - выше появится ```throws IOException``` - это означает что теперь текущий метод (или конструктор) может кинуть ошибку связанную с IO - т.е. связанную с Input Output, т.е. связанную с чтением с диска.

6) Теперь надо нарисовать загруженную картинку - достаточно в отрисовке ```MyPanel``` (в методе ```paintComponent```) добавить например ```g.drawImage(this.unicornImage, centerX, centerY, null);```.

7) Чтобы рисовать картинку повернутой на некоторый угол:

```java
double angleInDegrees = 45.0; // Угол поворота в градусах
double angleInRadians = Math.toRadians(angleInDegrees);
double locationX = unicornImage.getWidth() / 2;
double locationY = unicornImage.getHeight() / 2;
AffineTransform tx = AffineTransform.getRotateInstance(angleInRadians, locationX, locationY);
AffineTransformOp op = new AffineTransformOp(tx, AffineTransformOp.TYPE_BILINEAR);

g.drawImage(op.filter(unicornImage, null), 100, 100, null);
```

Как обрабатывать нажатия мышки
------------------------------

Такого рода вещи тоже легко гуглятся - "java swing как обрабатывать нажатия мышки".

Окажется что все аналогично тому, что было проделано с ```MyPauseListener```. Отличия:

1) Добавлять слушателя нужно на панель которая рисует шарик (через метод ```panel.addMouseListener(MouseListener)```).

2) Чтобы узнать например в методе ```public void mouseClicked(MouseEvent e)``` в каком именно месте находится мышка - нужно вызвать у аргумента ```MouseEvent e``` соответствующие геттеры:

```java
@Override
public void mouseClicked(MouseEvent e) {
    System.out.println("Mouse click on (x=" + e.getX() + ", y=" + e.getY() + ")");
}
```

Как обрабатывать нажатия на клавиатуре
--------------------------------------

Раньше мы обрабатывали одну из двух вещей: нажатия на кнопки и взаимодействия мышкой. Но для управления в играх часто используется и клавиатура - например для игры вроде Flappy Bird было бы удобно прыгать по пробелу.

Раньше все обработчики нажатий на кнопки или взаимодействий мышки были привязаны к какому-то компоненту в окошке. Нажатия на кнопки были привязаны к кнопкам, рисования мышкой - к панели рисования и т.п..

Обрабатывать клавиатуру для игры хотелось бы не зависимо от того где находится мышка и т.п.. Иначе говоря - хотелось бы чтобы обработка клавиатуры была глобальной.

Чтобы это сделать, нужно создать объект, который олицетворяет клавиатуру: ```KeyboardFocusManager manager = KeyboardFocusManager.getCurrentKeyboardFocusManager();```

А затем добавить к нему обработчик нажатий: ```manager.addKeyEventDispatcher(new MyDispatcher())```, где в скобочках передается объект вашего нового класса, который должен реализовывать интерфейс ```KeyEventDispatcher``` (с единственным методом: ```public boolean dispatchKeyEvent(KeyEvent e)```).

Теперь вы сможете в этом методе обработать нажатия кнопок мыши, например:

```java
@Override
public boolean dispatchKeyEvent(KeyEvent e) {
    System.out.println("Новое событие кнопок клавиатуры!");

    String typeOfEvent = "unknown";
    if (e.getID() == KeyEvent.KEY_PRESSED) {
        typeOfEvent = "pressed";
    } else if (e.getID() == KeyEvent.KEY_RELEASED) {
        typeOfEvent = "released";
    } else if (e.getID() == KeyEvent.KEY_TYPED) {
        typeOfEvent = "typed";
    }

    String key = "unknown";
    if (e.getKeyCode() == KeyEvent.VK_SPACE) {
        key = "space";
    } else if (e.getKeyCode() == KeyEvent.VK_ENTER) {
        key = "enter";
    } else {
        key = "code#" + e.getKeyCode();
    }

    System.out.println("type=" + typeOfEvent + " keyCode=" + key);
    return false;
}
```

Если вы где-то застряли или возникли вопросы - не стесняйтесь спрашивать меня в Telegram, VK или по почте.
