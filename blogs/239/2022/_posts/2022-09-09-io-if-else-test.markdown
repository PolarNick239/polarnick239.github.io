---
layout: ru/blogs/239/2022/post
title:  "[Java] Input/Output и if-else"
date:   2022-09-09 12:04:00 +0300
lang:   ru
categories: school239_108_2022_2023
---

**Покрытые темы**
====

```java
System.out.print("text");
int x;
System.out.print(x);
System.out.println("x=" + x);
System.out.println();

Scanner scanner = new Scanner(System.in);
int years = scanner.nextInt();
String name = scanner.nextLine();

if (years < 0) {
    System.out.println("Отрицательный возраст!? :O");
} else {
    System.out.println("С введенным возрастом все в порядке! :)");
}

double weightOfStone = scanner.nextDouble();
if ((weightOfStone > 10.0) && (weightOfStone < 20.0)) {              // это логическое И
    System.out.println("Вес камня находится между 10 и 20 кг");
} else if ((weightOfStone < 0.0) || (weightOfStone > 10000000.0)) { // это логическое ИЛИ
    System.out.println("Вес камня крайне подозрительный! (отрицательный или очень большой)");
} else {
    System.out.println("Вес камня попал в остальные случаи которые мы не разобрали: " + weightOfStone);
}
```

Так же есть разные другие логические операции которые часто пригодятся в **if**-условиях:

 - ```!КакоеТоЛогическоеУсловие``` - логическое отрицание того что после восклицательного знака (знака логического отрицания)
 
 - ```> < ==``` - знаки меньше, больше и равенства (**обратите внимание что здесь ДВА знака равно**)
 
 - ```>= <= !=``` - знаки больше или равно, меньше или равно и неравенства


**Задание**
====

Задание на уроке и затем дома к утру четверга 15 сентября - выполнить задачки в [http://mdl.sch239.net/](http://mdl.sch239.net/) :

1) Считать два целых числа и вывести сумму (изначально вам предложен код-заготовка, доделайте ее)

2) Считать имя пользователя, поздороваться с ним, считать два **вещественных числа** и вывести сумму. Обратите внимание на **Возможную ошибку 1** ниже.

3) Считать дату рождения и дату. Вывести число полных лет на момент указанной даты.

4) Пользователь вводит число лет. Просклоняйте и выведите это число, например: "10 let", "1 god", "32 goda".

5) Решите линейное уравнение. Обратите внимание на **Возможную ошибку 2** ниже.

6) Решите квадратное уравнение. (первый коэффициент гарантированно не ноль) Для взятия корня используйте ```double res = Math.sqrt(a);```. Обратите внимание на **Возможную ошибку 2** ниже.

**Возможные ошибки**
====

1) Если вы видите что-то вроде ```InputMismatchException``` и ошибка указывает на строчку ```scanner.nextDouble()``` а вы уверены что к моменту выполнения считывания вещественного числа на вход программе дано число - попробуйте еще раз, но введя вещественное число через запятую, а не через точку.

Причина этой ошибки в том что в операционной системе компьютера есть понятие **локаль** - например она может быть русская, американская или еще какая-то. От нее зависит стандартный способ записи вещественных чисел - в русской локали это запятая, а в американской - через точку.

Подробнее (и про то как в программе фиксировать локаль чтобы она не зависила от компьютера на котором программа исполняется): [https://stackoverflow.com/questions/5929120/nextdouble-throws-an-inputmismatchexception-when-i-enter-a-double](https://stackoverflow.com/questions/5929120/nextdouble-throws-an-inputmismatchexception-when-i-enter-a-double) (гуглится по ```InputMismatchException nextDouble```)

2) Если ваша программа выводит в одном из тестов ```-0.0``` а "правильным" ответом система считает ```0.0``` - простите пожалуйста и обойдите эту проблему:

Просто замените код вида

```java
double result = a / b;
System.out.println(result);
```

на:

```java
double result = a / b;
if (result == 0.0) { // при сравнении двух чисел - Java считает что отрицательный ноль и простой ноль - совпадают
    result = 0.0;    // поэтому если "что-то совпало с нулем" - давайте положим туда "обычный ноль" (т.о. заменив -0.0 на 0.0)
}
System.out.println(result);
```

3) Если вы видите что-то вроде ```/var/www/html/jobe/application/libraries/../../runguard/runguard: warning: timelimit exceeded``` при отправке решения в **mdl**:

Система тестирования подвисла и не успела в рамках ограничения на время тестирования задания его проверить. При этом если вы повторно попробуете отправить задание - система ничего не сделает т.к. думает что раз решение не изменилось, то исход будет такой же.

Решение - добавить фиктивное изменение в код (например пустую строку) и переотправить.
