---
layout: ru/blogs/239/2024/post
title:  "[Java] Введение в GUI/Swing - конспект"
date:   2024-10-07 09:03:00 +0300
lang:   ru
categories: school239_108_2024_2025
---

Заметки
===

Система координат в окне может быть немного непривычна - точка отсчета в **верхнем левом угле**:

![Frame coordinate system](/static/2022/10/frame_coordinate_system.png)

Раньше мы переопределяли метод ```toString()``` чтобы наши объекты выводили себя в консоль ввиде строки как надо.

Так и теперь - мы хотим переопределить метод ```paintComponent(Graphics g)``` чтобы наша панель рисовала что нам захочется:

![MyPanel extends JPanel](/static/2022/10/extends_panel.png)

Создадим человечка
===

```java
import java.awt.*;

public class Human {

    int x;
    int y;
    int height;
    String name;

    public Human(int x, int y, int height, String name) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.name = name;
    }
    void setX(int x) {
        this.x = x;
    }
    public int getX() {
        return x;
    }

    // Этот метод реализует в человечке навык "нарисуй себя"
    // аргумент этого метода - холст на котором человечек может себя нарисовать
    void paint(Graphics g) {
        g.drawRect(x, y, 50, height);
        g.drawString(name, x, y);
    }
}
```

Создадим окно в main-функции
===

```java
import javax.swing.*;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        // Создаем два человечка
        Human petya = new Human(200, 100, 200, "Petya");
        Human vasya = new Human(400, 100, 180, "Vasya");

        // Создаем панель, даем ей сразу информацию про двух человечков
        // чтобы в момент отрисовки она смогла отрисовать обоих
        MyPanel panel = new MyPanel(petya, vasya);

        // Создаем окно
        JFrame frame = new JFrame();
        frame.add(panel);        // добавляем в окно панель
        frame.setSize(640, 480); // делаем окно нужного размера
        frame.setVisible(true);  // делаем его видимым (ОБЯЗАТЕЛЬНО В САМЫЙ ПОСЛЕДНИЙ МОМЕНТ - когда панель уже добавлена)
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE); // при закрытии окошка нужно завершить выполнение программы

        while (true) {
            frame.repaint(); // говорим окну что ему нужно рисоваться заново постоянно (это в свою очередь провоцирует отрисовку панели)
        }
    }
}
```

Создадим панель
===

```java
import javax.swing.*;
import java.awt.*;

public class MyPanel extends JPanel { // наследуемся от базовой панели
    Human human;
    Human human2;
    public MyPanel(Human human, Human human2) {
        this.human = human;
        this.human2 = human2;
    }

    // В этой функции панель рисует себя на чистом холсте g
    // эта функция вызывается много раз и часто
    // каждый раз мы рисуем все с чистого листа (на чистом холсте g)
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        System.out.println("TEST");
        g.drawRect(20, 10, 200, 100);

        long time = System.currentTimeMillis();
        double s = Math.sin(time/100.0) + 1.0;
        double s2 = s * 200.0;
        human.setX((int) s2); // двигаем одного из человечков

        human.paint(g);
        human2.paint(g);
    }
}
```