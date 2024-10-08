---
layout: ru/blogs/239/2018/post
title:  "[Java] Шарик и кнопки"
date:   2018-12-16 0:02:39 +0300
lang:   ru
categories: school239_105_2018_2019
---

1) Создайте пустой проект.

2) Создайте три готовых класса: Main, MyPanel и MyPauseListener. Исходники доступны [здесь](https://gist.github.com/PolarNick239/6d59cd940e43c04ba06427d933596b07).

3) Проверьте что готовый код у вас запускается.

4) Исследуйте код и поймите его, с этим помогут вопросы указанные в [main-функции](https://gist.github.com/PolarNick239/6d59cd940e43c04ba06427d933596b07#file-main-java-L55-L71). Убедитесь, что то как окно себя ведет соответствует вашему пониманию кода. Не бойтесь экспериментировать с кодом, убеждаясь что изменение кода приводит к изменениям в поеведении программы ожидаемым вами.

5) Вместе с поиском ответов на вопросы, выполняйте подряд TODO-задания, указанные в [main-функции](https://gist.github.com/PolarNick239/6d59cd940e43c04ba06427d933596b07#file-main-java-L55-L71).

Правила сдачи
==============

 - В начале урока **20 декабря** вы должны запустить на компьютере то что вы **делали дома**  и получить оценку за домашнее задание

Дополнения
==============

Как рисовать картинки
---------------------

Такого рода вещи легко найти в интернете, например по запросу "java swing как нарисовать картинку" (напоминаю, что ```Swing``` - название пакета который мы используем для создания графического интерфейса).

Окажется, что достаточно:

1) Загрузить на диск из интернета какую-нибудь картинку, например [эту](/static/unicorn.png).

2) Добавить поле ```Image unicornImage;``` в класс ```MyPanel```.

3) Инициализировать его в конструкторе, загрузив картинку с диска, например так: ```this.unicornImage = ImageIO.read(new File("C:\\downloads\\unicorn.png"));```

4) Не забыть сделать все импорты всех новых классов через Alt+Enter.

5) Т.к. загрузка картинки может кинуть ошибку (например если файл не будет найден), поэтому вы будете видеть ошибку ```Unhandled exception: java.io.IOException``` - поправьте ее кинув ошибку выше через ```Alt+Enter``` (Add exception to method signature) - выше появится ```throws IOException``` - это означает что теперь текущий метод (или конструктор) может кинуть ошибку связанную с IO - т.е. связанную с Input Output, т.е. связанную с чтением с диска.

6) Теперь надо нарисовать загруженную картинку - достаточно в отрисовке ```MyPanel``` (в методе ```paintComponent```) добавить например ```g.drawImage(this.unicornImage, centerX, centerY, null);```.

Если вы где-то застряли или возникли вопросы - не стесняйтесь спрашивать меня в Telegram, VK или по почте.

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

Если вы где-то застряли или возникли вопросы - не стесняйтесь спрашивать меня в Telegram, VK или по почте.
