---
layout: ru/blogs/239/2022/post
title:  "[Java] Рекурсия, getters/setters/toString()"
date:   2022-09-30 12:04:00 +0300
lang:   ru
categories: school239_108_2022_2023
---

```java
public class Main {
    public static int fib(int i) {
        // это РЕКУРСИЯ, мы сводим функцию саму к себе
        // а что будет если удалить эти два if-а и оставить только строчку с return?
        if (i == 0)
            return 0;
        if (i == 1)
            return 1;
        return fib(i - 2) + fib(i - 1);
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10; ++i) {
            System.out.println("fib " + i + "=" + fib(i));
        }
    }
}
```

```java
public class NaturalValue {
    int value;

    NaturalValue(int value) {
        // В конструкторе никто не мешает проверять аргументы на корректность и как-то их изменять (исправлять)
        if (value < 1) {
            this.value = 1;
        } else {
            this.value = value;
        }
    }

    int getValue() {
        // это так называемый getter, в java принято извне (из main) ВЕЖЛИВО узнавать значения полей
        // т.е. через такие (тривиальные) функции
        // getter от слова get = получить = узнать значение поля (соответственно тип результата = типу поля)
        // называется он всегда getSomeFieldName где SomeFieldName - название поля (с большой буквы)
        return value;
    }

    void setValue(int value) {
        // это так называемый setter, в java принято извне (из main) ВЕЖЛИВО МЕНЯТЬ значения полей
        // т.е. через такие (тривиальные) функции
        // setter от слова set = установить значение поля (соответственно результата нет - void)
        // называется он всегда setSomeFieldName где SomeFieldName - название поля (с большой буквы)
        this.value = value;
        // в частности такой способ позволяет проконтролировать что за значение нам подсунили и поправить его:
        if (value < 1) {
            this.value = 1;
        } else {
            this.value = value;
        }
    }

    void fix() {
        // А что если мы хотим часто менять наше натуральное число?
        // Что если оно перестанет быть натуральным?
        // В каждой функции писать if подобный тому что в конструкторе и setter-е? Утомительно и не красиво!
        // Давайте просто сделаем функцию fix()="поправь натуральное число если это требуется" и будем ее вызывать отовсюду
        // в т.ч. из конструктора можно было бы и из setter-а
        if (value <= 1) {
            value = 1;
        }
    }

    void add(int value) {
        this.value += value;
        fix(); // если вдруг мы вычли слишком много и ушли в минус (или до нуля) - поправляем
    }

    void add(NaturalValue value) { // методы и функции могут быть "ПЕРЕГРУЖЕНЫ" (overloaded)
        // т.е. их может быть несколько с одинаковым названием (см. add выше)
        // но в момент вызова Java поймет какую функцию выполнять,
        // т.к. они вызываются с разными типами аргументов
        this.value += value.value;
        fix(); // на самом деле это не обязательно т.к. натуральное+натуральное=натуральное, но так спокойнее и надежнее...
    }

    NaturalValue plus(int value) {
        return new NaturalValue(this.value + value); // нужен ли тут вызов fix?
    }

    NaturalValue plus(NaturalValue value) {
        return new NaturalValue(this.value + value.value);
    }

    // @Override - это указание что не мы не просто объявляем новый метод,
    // а ПЕРЕОПРЕДЕЛЯЕМ метод который есть в более базовом классе
    // в Java во всех классах есть toString(), именно он определяет что будет выведено
    // если подставить объект x в System.out.println(x);
    // поэтому ПЕРЕОПРЕДЕЛИВ этот метод - мы явно скажем как преобразовать объект в строку
    // т.е. как представить объект в приятном человеческому глазу виде
    @Override
    public String toString() {
        return "value=" + value + "";
    }
}
```
