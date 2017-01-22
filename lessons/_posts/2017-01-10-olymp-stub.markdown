---
layout: 239post
title:  "Тутор: ввода-вывод на Java (для олимпиад)"
date:   2017-01-10 11:59:00 +0300
categories: 239 school java olymp
---

Пример решения следующей задачи:

Вход: число n на первой строке, на второй строке n чисел и на третьей строке произвольное количество чисел

Выход: сумма n чисел в первой строке, сумма чисел с третьей строки во второй строке вывода, в третьей строке вывести "Ответ: A B", где A - первоя строка вывода, B - вторая строка вывода

Пример входа:

```
4
1 2 3 4
125 126 163 13 11 2
```

Пример выхода:

```
10
440
Ответ: 10 440
```

Решение при вводе-выводе через консоль
======================================

```java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.StringTokenizer;

public class ProblemH {

    public static void main(String[] args) throws IOException {
        // Для работы через консоль:
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(System.out);

        String s = in.readLine();                           // считали первую строку
        int n = Integer.parseInt(s);                        // распарсили из строки число

        s = in.readLine();                                  // считали следующую (вторую) строку с числами (если следующей строки нет - то in.readLine() вернет null)
        StringTokenizer tokenizer = new StringTokenizer(s); // этот объект разобъет вторую строку по пробелам

        int sum = 0;
        for (int i = 0; i < n; ++i) {
            String token = tokenizer.nextToken();           // взяли следующий элемент строки (т.е. следующее слово через пробел)
            int value = Integer.parseInt(token);            // распарсили из слова - очередное число
            sum += value;
        }

        out.println(sum);                                   // println выводит аргумент и завершает строку (чтобы просто вывести аргумент без перевода каретки - можно вызвать out.print(sum))

        int sum2 = 0;
        s = in.readLine();                                  // считали третью строку
        tokenizer = new StringTokenizer(s);                 // разбили ее по пробелам
        while (tokenizer.hasMoreTokens()) {                 // пока есть элементы в этой строке
            sum2 += Integer.parseInt(tokenizer.nextToken());
        }
        out.println(sum2);

        out.print("Ответ: ");
        out.print(sum);
        out.print(" ");
        out.println(sum2);
        // А можно было и так:
        // out.println("Ответ: " + sum + " " + sum2);

        in.close();
        out.close();                                        // НЕ ЗАБЫВАЕМ СБРОСИТЬ ПОТОК ВЫВОДА
    }

}
```

Решение при вводе-выводе через файлы (input.txt и output.txt)
=============================================================

```java
import java.io.*;                                           // таким образом можно заимпортить сразу много, но вообще лучше делать импорты через подсказки IDE (Alt+Enter в месте использования класса, который еще не импортирован)
import java.util.StringTokenizer;

public class ProblemH {

    public static void main(String[] args) throws IOException {
        // Для работы через файлы:
        BufferedReader in = new BufferedReader(new FileReader("input.txt"));
        PrintWriter out = new PrintWriter(new FileWriter("output.txt"));

        String s = in.readLine();                           // считали первую строку
        int n = Integer.parseInt(s);                        // распарсили из строки число

        s = in.readLine();                                  // считали следующую (вторую) строку с числами (если следующей строки нет - то in.readLine() вернет null)
        StringTokenizer tokenizer = new StringTokenizer(s); // этот объект разобъет вторую строку по пробелам

        int sum = 0;
        for (int i = 0; i < n; ++i) {
            String token = tokenizer.nextToken();           // взяли следующий элемент строки (т.е. следующее слово через пробел)
            int value = Integer.parseInt(token);            // распарсили из слова - очередное число
            sum += value;
        }

        out.println(sum);                                   // println выводит аргумент и завершает строку (чтобы просто вывести аргумент без перевода каретки - можно вызвать out.print(sum))

        int sum2 = 0;
        s = in.readLine();                                  // считали третью строку
        tokenizer = new StringTokenizer(s);                 // разбили ее по пробелам
        while (tokenizer.hasMoreTokens()) {                 // пока есть элементы в этой строке
            sum2 += Integer.parseInt(tokenizer.nextToken());
        }
        out.println(sum2);

        out.print("Ответ: ");
        out.print(sum);
        out.print(" ");
        out.println(sum2);
        // А можно было и так:
        // out.println("Ответ: " + sum + " " + sum2);

        in.close();
        out.close();                                        // НЕ ЗАБЫВАЕМ ЗАКРЫТЬ ФАЙЛ
    }

}
```


