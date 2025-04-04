---
layout: ru/blogs/239/2022/post
title:  "[Проект] Как проверять крайние случаи/зависания"
date:   2023-02-08 0:03:39 +0300
lang:   ru
categories: school239_108_2022_2023
---

Очень важно (и в типовом проекте, и в реальной разработке) - убедиться что программа работает не на одном примере который вы протестировали, а всегда - в т.ч. в крайних случаях, которые бывают редко, но важно убедиться что даже в этом редком случае все отработает корректно (не просто программа не упадет с ошибкой, но и результат будет правильный, или хотя бы сообщение об ошибке если такой случай не имеет смысла).

Типовые крайние случаи в которых бывают проблемы/встречаемые ошибки:

1) Ошибка или неправильный ответ в случае если есть ```вертикальные прямые``` (поэтому удобно использовать обобщенную формулу $$a \cdot x + b \cdot y + c = 0$$).

2) ```Деление на ноль.``` На самом деле вертикальные прямые - частный случай деления на ноль.

3) ```Корень из отрицательного числа.``` Например в случае если квадратное уравнение не имеет корней - дискриминант отрицателен.

4) ```Цикл работает бесконечно ("зависает").``` Например в ```while(true)``` никогда не срабатывает ```if``` содержащий ```break;```. Или когда в ```while(!flag)``` никогда не выставляется этот флаг.

5) ```Бесконечная рекурсия.``` Например если в рекурсивной функции рассчета чисел Фибоначчи не добавить условие про $$F_1 = 1$$ и $$F_2 = 1$$.

6) ```Разобраны ли все случаи.``` Например если вам надо по-разному обработать случаи когда число из одного диапазона, из другого или третьего. И вы разобрали два случая, а про третий не подумали.

Как по коду найти все слабые места?
======

Идете по списку из этих случаев и технично и планомерно ищете где у вас может встречаться каждое из них:

1) Есть ли у меня прямые на вход? Что будет если они будут ```вертикальными```? Бывают ли прямые которые возникают в процессе промежуточных вычислений? Они могут оказаться вертикальными и спровоцировать деление на ноль? Попробовать спровоцировать подобный случай, отладить и пофиксить чтобы результат был корректен.

2) ```Деление на ноль.``` Технично найти **ВСЕ** операции деления (например через поиск ```Ctrl+F("/")```). Про каждую из этих операций очень придирчиво подумать - есть ли в коде чуть выше **СТРОГОЕ ДОКАЗАТЕЛЬСТВО** которое гарантирует что деления на ноль не может быть? Если нету - добавьте. Чаще всего такое доказательство это ```ìf (... != 0) { ... } else { ... }``` где в первой ветке типичный случай, а во второй ветке - аккуратно разобран крайний случай (или наоборот - это вопрос предпочтения).

3) ```Корень из отрицательного числа.``` То же самое что и с делением - находите **ВСЕ** извлечения корня (и другие операции которые требуют от аргументов быть в некотором диапазоне). Каждое из них оборачиваете в проверку, разбираете крайние случаи (хотя бы киньте вразумительную ошибку чтобы было легко отладить и понять что пошло не так, когда это место кода взорвется). Придумываете случаи когда этот кусок кода мог взорваться - пытаетесь сломать программу - убеждаетесь что без этого ```if``` код падает/результат не верен на придуманном примере, а теперь после исправления - этот пример отрабатывает корректно.

4) ```Цикл работает бесконечно ("зависает").``` Ищете все циклы кроме типового ```for (int i = 0; i < n; ++i)``` и задаетесь вопросом - может ли быть так что цикл работает вечно? Например даже цикл ```for (int i = 0; i < values.size(); ++i)``` может зависать, если внутри этого цикла есть добавление элемента в список ```values```. Если у вас программа зависает - проще всего исследовать проблему запустив под отладчиком, дождаться пока программа зависнет и нажать на "паузу" отладчика, чтобы посмотреть что именно сейчас происходит - какой цикл завис.

5) ```Бесконечная рекурсия.``` Ищете все рекурсии в вашем коде (т.е. функции которые вызывают сами себя), пытаетесь найти уязвимость - случай когда функция зациклится и будет вызывать себя, которая будет вызывать себя, которая будет вызывать себя... Главное понять что вы **ЗАИНТЕРЕСОВАНЫ** найти багу в своем коде, т.к. лучше сейчас чем потом, когда вы уже забудете что написано в вашем коде - ведь отлаживать и исправлять багу позже будет гораздо тяжелее чем сразу в момент разработки.

6) ```Разобраны ли все случаи.``` Когда пишете ```if (A) {``` после нее пользуйтесь конструкцией ```} else if (B) {``` - т.е. "а иначе попробовать такой-то случай". И, что очень важно, в конце добавьте ```} else { throw new RuntimeException("Unhandled case!"); }``` на случай если вы забыли разобрать какой-то случай, например:

```java
int x = ...;
if (x >= 100) {
    System.out.println("В числе " + x + " три или более цифры");
} else if (x <= 99 && x >= 10) {
    System.out.println("В числе " + x + " две цифры");
} else if (x <= 9 && x >= 0) {
    System.out.println("В числе " + x + " одна цифра");
} else {
    throw new RuntimeException("Unhandled case x=" + x + "!");
}
```

И теперь я, во-первых, гарантирую себе кодом (благодаря ```else```) что выполнится **ровно одна** из четырех веток кода. И, во-вторых, когда обнаружится что я забыл разобрать отрицательный случай - я сразу получу ошибку из ```else { throw ...}``` секции кода. И это очень удобно - т.к. я сразу пойму что произошло - увижу значение $$x$$. Это ускорит отладку и исправление такой ошибки, т.к. это падение программы ровно там же где произошла ошибка логики, а не где-то потом программа выдала странный результат и нужно долго искать первопричину проблем.
