---
layout: ru/blogs/239/2023/post
title:  "[Java] Краткий конспект"
date:   2023-09-10 12:02:00 +0300
lang:   ru
categories: school239_108_2023_2024
---

Примитивные типы:
- ```int``` - целое число
- ```double``` - вещественное число (так же называется числом с плавающей точкой)
- ```String``` - строчка

Main-функция (точка входа в программу):
```java
public static void main(String[] args) {
}
```

Чтобы напечатать в консоль:
```java
System.out.print("Вывод ");                                   // print - выводит в консоль без окончания строки
System.out.println("в консоль значения переменной a = " + a); // println - выводит в консоль и завершает строку
System.out.print("Это уже вторая строка вывода\n");           // \n - специальный символ завершения строки (иначе говоря - переноса каретки)
System.out.println("" + 2 + 3 + 9); // операция плюс видит слева строку и справа число, поэтому число преобразует в строку и объединит полученные строки и так далее
```

Чтобы считать из консоли:
```java
import java.util.Scanner; // эту строчку надо написать вверху файла
```
```java
Scanner scanner = new Scanner(System.in);
int a = scanner.nextInt();        // считать целое число
double b = scanner.nextDouble();  // считать вещественное число
String line = scanner.nextLine(); // считать строку
```

Работа со строками:
```java
String work = "Test String"; // Строки можно задавать в двойных кавычках
char c1 = work.charAt(3);    // Считает 3-ий символ (индексация с нуля, т.е. букву 't')
char c2 = 't';               // Символы в отличии от строк задаются в одинарных кавычках
if (c1 == c2) {              // Проверяем что все правильно
    System.out.println("Ok!");
}

Scanner scanner = new Scanner(System.in);
String nextWord = scanner.next();  // Сканнер разбивает введенные данные по пробелам и переносам строк на "слова"
System.out.println("Введенное слово: " + nextWord + " (длина: " + nextWord.length() + ")");
```
