---
layout: ru/blogs/239/2018/post
title:  "[Java] Многопоточность: synchronized"
date:   2019-05-19 0:02:39 +0300
lang:   ru
categories: school239_105_2018_2019
---

Что делать если нужно выполнить какую-то операцию над одним и тем же ресурсом (например над переменной, или над файлом) из многих разных потоков?

Рассмотрим случай когда есть переменная ```x``` и хочется из разных потоков ее увеличивать на единицу.

Операция увеличения переменной на единицу состоит из трех шагов:

1) Прочитать из оперативной памяти (RAM) текущее значение переменной ```x``` и положить это значение в регистр процессора (это как если бы вы из своей записной книжки (из оперативной памяти) прочитали число $$42$$ и держали его в голове (т.е. положили бы его в регистр у процессора))

2) Увеличить число в регистре процессора на единицу (это как если бы вы увеличили число $$42$$ в голове на единицу и теперь держали бы в голове число $$43$$)

3) Записать число из регистра в оперативную память по адресу переменной ```x``` (это как если бы вы поверх записи в своей записной книжке записали число из своей головы - $$43$$)

Что здесь может пойти не так если большое число потоков пытается проделать такую операцию из трех шагов над одной и той же переменной? Шаги могут перемешаться и мы получим не то число.

Например пусть было число $$0$$, два потока хотят каждый его увеличить, тем самым в результате мы хотели бы увидеть число $$2$$, т.к. $$0+1+1=2$$.

Но они работают параллельно, а это значит что они могли одновременно выполнить шаг **1)**, считать текущее значение переменной ```x```, т.е. считать себе в регистр значение $$0$$.

Увеличить его на $$1$$ (и получить единицу), и одновременно же записать обе полученные единицы в память соответствующую переменной ```x```. Т.о. в результате будет все выглядеть со стороны так, как будто было выполнено одно увеличение на единичку. Печально.

Обобщение (хрупкие ресурсы)
======

Заметьте что данная проблема гораздо шире, это то же самое что может произойти если два субъекта попытаются одновременно что-то делать с ресурсом который одновременно может использовать лишь один.

Например если вы и ваш друг одновременно попытаются использовать один и тот же компьютер сидя на одном и том же стуле - вы скорее всего оба упадете на пол, ну или получите кол.

Как избежать такой ситуации? Хорошо бы иметь возможность "взять право владения на объект", т.е. синхронизироваться с остальными, заявить свои права на данный объект, что вы его сейчас взяли, работаете с ним, и когда закончите работать - отпустите его, оповестите остальных и отдадите.

Так и с переменной - вы можете создать кусок кода, который одновременно будет выполнять лишь в одном потоке, в том, который сейчас захватил право работать с данным ресурсом.

Пример (с ошибкой)
======   

```java
public class StorageForX {
    public int x = 0;

    public static void main(String[] args) throws InterruptedException {
        // Создаем объект с ресурсом (с переменной x)
        StorageForX storage = new StorageForX();
        System.out.println("x=" + storage.x);

        // Запускаем два потока - они будут увеличивать на единичку переменную storage.x
        System.out.println("Starting 2 threads...");
        IncrementerThread thread1 = new IncrementerThread(storage);
        IncrementerThread thread2 = new IncrementerThread(storage);
        thread1.start();
        thread2.start();
        // Дожидаемся когда оба потока закончат свое выполнение
        thread1.join();
        thread2.join();
        System.out.println("Finished!");

        // Каждый поток увеличивает переменную на единичку 10000 раз, т.о. в результате мы бы ожидале storage.x == 20000
        System.out.println("x=" + storage.x);
    }
}

public class IncrementerThread extends Thread {
    private StorageForX storage;

    public IncrementerThread(StorageForX storage) {
        this.storage = storage;
    }

    @Override
    public void run() {
        System.out.println("IncrementerThread starts running...");
        for (int i = 0; i < 10000; ++i) {
            this.storage.x += 1;
        }
        System.out.println("IncrementerThread finished!");
    }
}
```

Попробуйте прочитать код, запустить и понять его, затем создать чистый проект и написать что-то подобное **самостоятельно почти не подглядывая**.

Убедитесь что выводится какое-то случайное число между $$10001$$ и $$19999$$.

Критическая секция synchronized
======

В Java у любого **объекта** есть встроенная функция "захватить над ним единоличную власть", т.е. заявить что пока что "поток взял этот хрупкий ресурс и работает с ним, поэтому никакой другой поток не может пока что сделать то же самое - другой поток должен дождаться когда наш поток отпустит этот ресурс".

Это называется синхронизация:

```java
synchronized (objectLock) {
    System.out.println("Текущий поток захватил власть над объектом objectLock...");
    System.out.println("И не отдаст этот ресурс никакому другому потоку пока не дойдет до закрывающей фигурной скобки.");
    System.out.println("Если другой поток попытается захватить власть над этим же объетом, то он встанет в очередь ожидающих этот ресурс.");
    x += 1;
    System.out.println("И вот наконец мы сделали без вмешательства других потоков свои дела - увеличили переменную на 1, и можем отдать ресурс.");
    System.out.println("Как только мы дойдем до закрывающей фигурной скобки (до конца критической секции) в следующей строке - ресурс вновь будет свободен.");
}
``` 

Такой "потоко безопасный" кусок кода в фигурных скобках так же называется "критической секцией".

Обратите внимние что гораздо естественне было бы вместо ```objectLock``` написать сам используемый ресурс ```x```. Но т.к. это **примитивный тип** а не полноценный объект, то с ним так сделать нельзя, поэтому этой переменной нужен вспомогательный **объект** ```objectLock```.

**Упражнение 1**: исправление примера
======

Возьмите ваш код подобный проблемному примеру выше, и поправьте его с использованием ```synchronized```-секции.

```Подсказка:``` Как объект-синхронизации (т.е. вместо ```objectLock```) используйте ```storage```.

Deadlock (взаимная блокировка)
======

Что будет если у вас есть два объекта $$A$$ и $$B$$ использующихся для синхронизации из двух потоков следующим образом:

 - Первый поток захватывает контроль сначала над $$A$$ а затем над $$B$$ (двумя вложенными секциями ```synchronized```)
 - Второй поток захватывает контроль сначала над $$B$$ а затем над $$A$$

Особенно хороший вопрос что будет если они попытаются синхронизироваться одновременно друг с другом? Например пусть:

1) Первый поток захватил контроль над $$A$$

2) Второй поток захватил контроль над $$B$$

3) Первый поток пытается захватить контроль над $$B$$, но т.к. он уже захвачен вторым потоком - то первый поток встает в очередь и ждет когда освободится $$B$$

4) Второй поток пытается захватить контроль над $$A$$, но т.к. он уже захвачен первым потоком - то второй поток встает в очередь и ждет когда освободится $$A$$

В результате оба потока будут вечно стоять в очереди на захват контроля над соответствующими объектами, ожидая друг друга, т.о. потоки друг друга **взаимно заблокировали** - случился **deadlock**.

Как его можно было бы избежать? Если бы оба потока брали контроль над объектами в одинаковом порядке - такого не могло бы случиться. **Подумайте** так ли это.

**Упражнение 2**: спровоцируйте deadlock
======

Создайте два потока которые будут постоянно пытаться взять в разном порядке два объекта под контроль, как это было продемонстрировано на уроке на примере двух банковских счетов.

Убедитесь что они зависают.

Убедитесь что они зависают на попытке взять вторую синхронизацию - для этого достаточно запуститься под отладчиком, подождать достаточно времени (в т.ч. убедившись что в диспетчере задач нагрузка на процессор упала до почти нуля) и нажать на паузу, а затем исследовать что делает (на какой строчке остановился) каждый из двух потоков.
