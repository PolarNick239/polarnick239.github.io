---
layout: ru/blogs/courses/gpgpu2018/post
title:  "Лекция 2: Введение в OpenCL"
date:   2018-07-21 21:30:00 +0300
lang:   ru
id:     20_gpgpu2018_lecture2
---

Предыдущая [лекция 1. История](/blogs/courses/gpgpu2018/2018/07/20/lecture1-history-ru.html).

# Пример простой задачи

Пусть нужно сложить два массива чисел:

```cpp
int n;
int a[n], b[n], c[n];

void solve() {
    for (int i = 0; i < n; ++i) {
        c[i] = a[i] + b[i];
    }
}
```

Пусть хочется получить ускорение на процессоре/видеокарте/кластере за счет распараллеливания, это можно сделать так:

```cpp
int n;
int a[n], b[n], c[n];

int partsNumber = 239;

void solve() {
    for (int partId = 0; partId < partsNumber; ++partId) {
        // Запустить поток и выполнить в нем:
        solvePart(partId);
    }
}

void solvePart(int partId) {
    // Вычисляем долю работы каждого потока
    int workPart = roundUp(n / partsNumber); // округление вверх
    // Вычисляем в каком диапазоне наша часть работы
    int from = partId * workPart;
    int to = min((partId + 1) * workPart, n);

    // Считаем свою часть
    for (int i = from; i < to; ++i) {
        c[i] = a[i] + b[i];
    }
}
```

Но как выбрать ``partsNumber``? Для процессора минимальное разумное число совпадает с числом вычислительных ядер. Но в данном случае вычислений очень мало по сравнению с обращением к памяти (одна дешевая операция сложения против двух дорогих чтений и одной дорогой записи),
поэтому пока ядро ждет подгрузки данных для сложения в одном месте это же ядро могло бы складывать уже подгруженные два числа в другой позиции, и тогда вместо ``времяОбращенийКПамяти + времяСложения`` было бы ``min(времяОбращенийКПамяти, времяСложений)``.
Т.е. несмотря на то что обращение к памяти происходит с задержкой, мы можем эту задержку спрятать, переключившись на это время на другую часть задачи. Это называется ``latency-hiding``.

Чтобы этого достичь достаточно выбрать ``partsNumber=N*ЧислоЯдерПроцессора``. 
Но насколько большим должно быть ``N``? Оказывается довольно быстро увеличение ``N`` начинает лишь замедлять,
 т.к. переключение ядра между потоками небесплатно (бесплатно только для двух потоков на ядро, и то лишь благодаря [Hyper-threading](https://en.wikipedia.org/wiki/Hyper-threading)/[SMT](https://en.wikipedia.org/wiki/Simultaneous_multithreading)).
 Т.о. имеет смысл выбирать  ``partsNumber=2*ЧислоЯдерПроцессора``.

На видеокарте же число одновременно выполняемых потоков достигает нескольких тысяч и поэтому стоит гораздо более сложная задача распределения вычислительной задачи между потоками, поэтому она стоит не перед программистом, а перед драйвером. 
Программисту же нужно лишь сформулировать вычислительную задачу в соответствии с OpenCL-моделью. (основная причина такой модели на самом деле другая и об этом будет больше сказано при подробном обсуждении что можно делать в рамках одной ``work-group``)

## OpenCL-модель вычислений с массовым параллелизмом

1. Есть некоторое большое рабочее пространство задачи (т.н. ``NDRange``): в нашем случае одномерное и его длина совпадает с числом элементов в массивах, но может быть двумерное шириной и высотой совпадающее с обрабатываемой картинкой, или трехмерное если вычисления ведутся на регулярной решетке или на вокселях в пространстве.
2. Циклы заменяются на ``kernel``-функцию (в данном случае это ``c=a+b``) которая описывает, что нужно сделать в каждой ячейке рабочего пространства (такие ячейки называются ``work-item``).

Т.о. задача с суммированием решается примерно так:

```cpp
int n;
int a[n], b[n], c[n];

void solve() {
    driver.launchKernel(
        NDRange = (x=n, y=1, z=1),
        kernel  = kernelAPlusB
    );
}

void kernelAPlusB(int i) {
    c[i] = a[i] + b[i];
}
```

Для каждого ``work-item`` из указанного рабочего ``NDRange``-пространства ``kernel`` будет выполнен ровно один раз.
Такая модель позволяет драйверу принять решение как много работы каждое вычислительное ядро возьмет на себя. Т.к. каждая задачка очень простая, и задачек очень много, то драйвер сможет распределить их между ядрами равномерно.

Обратите внимание что такая модель удобна и для распределенных вычислений, и для вычислений на процессоре, и для вычислений на видеокарте.

``NB`` На самом деле в OpenCL ``kernel`` выглядит так:

```cpp
__kernel void aplusb(__global const float* a,
                     __global const float* b,
                     __global       float* c
)
{
    // Узнаем индекс текущего work-item в пространстве задачи
    const size_t i = get_global_id(0); // 0 указывает по какой оси пространства нас интересует индекс (x=0, y=1, z=2)

    c[i] = a[i] + b[i];
}
```

## Пример более сложной задачи

Пусть нужно найти максимальную префикс сумму знаковых чисел в массиве:

```cpp
int n;
int xs[n];

int solve() {
    int result = 0;
    int current_prefix = 0;
    for (int i = 0; i < n; ++i) {
        current_prefix += xs[i];
        result = max(result, current_prefix);
    }
    return result;
}
```

И хочется опять получить ускорение на процессоре/видеокарте/кластере за счет распараллеливания, это можно сделать так:

```cpp
int n;
int xs[n];

int partsNumber = 239;

int localResult[partsNumber];
int localSum   [partsNumber];

int solve() {
    for (int partId = 0; partId < partsNumber; ++partId) {
        // Запустить поток и выполнить в нем:
        solvePartLocalSum(partId);
    }
    // Дождаться пока все значения localResult и localSum посчитаются (т.е. все потоки отработают)

    // Соберем финальный результат:
    int result = 0;
    int current_sum = 0;
    for (int i = 0; i < partsNumber; ++i) {
        result = max(result, current_sum + localResult[i]);
        current_sum += localSum[i];
    }
    return result;
}

void solvePartLocalSum(int partId) {
    int workPart = ...; int from = ...; int to = ...;

    // Считаем свою часть (но не глобальные префиксы, а локальные)
    int local_result = 0;
    int local_current_prefix = 0;
    for (int i = from; i < to; ++i) {
        local_current_prefix += xs[i];
        local_result = max(local_result, local_current_prefix);
    }
    localResult[partId] = local_result;
    localSum   [partId] = local_current_prefix;
}
```

Если это переложить на модель OpenCL:

```cpp
int n;
int xs[n];

int workPart = 64;
int workSize; // Аналог partsNumber

int localResult[workSize];
int localSum   [workSize];

int solve() {
    // В каждом work-item хотим обработать workPart значений массива
    // поэтоме рабочий размер пространства в workPart меньше, чем массив
    workSize = roundUp(n / workPart);
    driver.launchKernel(
        NDRange = (x=workSize, y=1, z=1),
        kernel  = kernelLocalPrefix
    );

    int result = 0;
    int current_sum = 0;
    for (int i = 0; i < workSize; ++i) {
        result = max(result, current_sum + localResult[i]);
        current_sum += localSum[i];
    }
    return result;
}

// Этот кернел ничем не отличается от кода в первой попытке распараллеливания
// Единственная разница - размер своей части работы фиксирован и равен 64
void kernelLocalPrefix(int partId) {
    int workPart = workPart; int from = ...; int to = ...;

    int local_result = 0;
    int local_current_prefix = 0;
    for (int i = from; i < to; ++i) {
        local_current_prefix += xs[i];
        local_result = max(local_result, local_current_prefix);
    }
    localResult[partId] = local_result;
    localSum   [partId] = local_current_prefix;
}
```

Если же хочется получить ускорение совсем близкое к линейному от числа рабочих ядер, то нужно добавить еще уровней иерархии:

```cpp
int n;
int xs[n];

int workPart = 64;
int workSize;

int localResult [n] = xs;
int localSum    [n] = xs;

int nextLocalResult[...];
int nextLocalSum   [...];

int solve() {
    while (n > 1) {
        workSize    = roundUp(n / workPart);
        localResult = new int[workSize];
        localSum    = new int[workSize];

        driver.launchKernel(
            NDRange = (x=workSize, y=1, z=1),
            kernel  = kernelLocalPrefix
        );

        n           = workSize;
        localResult = nextLocalResult;
        localSum    = nextLocalSum;
    }
    return localResult[0];
}

// Этот кернел кодом в OpenCL ничем не отличается от кода в первой попытке распараллелить
// Единственная разница - размер своей части работы фиксирован и равен 64
void kernelLocalPrefix(int partId) {
    int workPart = workPart; int from = ...; int to = ...;

    // Считаем свою часть (но не глобальные префиксы, а локальные)
    int local_result = 0;
    int local_current_prefix = 0;
    for (int i = from; i < to; ++i) {
        // Теперь мы опираемся на уже посчитанные лучшие префиксы подрегионов (а не на просто массив значений)
        // Эти две строчки эквивалентны финальному сбору результата в предыдущей версии
        local_result = max(local_result, local_current_prefix + localResult[i]); 
        local_current_prefix += localSum[i];
    }
    nextLocalResult[partId] = local_result;
    nextLocalSum   [partId] = local_current_prefix;
}
```

Таким образом достигнута уже почти идеальная параллельность (почти линейное ускорение от числа вычислительных ядер).

Можно ли сделать быстрее? В случае если кластер - это мощная видеокарта с огромным числом ядер, то оказывается что можно.

Ведь когда в кластере есть тысяча компьютеров, то общение между ними очень медленное (т.к. идет через общее на всех сетевое соединение). В случае же видеокарты вычислительные ядра находятся рядом друг с другом, и можно было
 бы использовать это преимущество. Для этого нужно как-то научиться понимать какие ядра рядом друг с другом (а значит эти ядра (или ``work-item``) могут эффективно общаться и синхронизироваться друг с другом).

## Work-group

Чтобы было возможно синхронизировать соседние потоки драйвер запускает ``work-item``-ы группами. Эти группы называются ``work-group``.
Возможность синхронизации и обмена данных между разными ``work-item`` из одной ``work-group`` позволяет решать гораздо быстрее (и гораздо более сложные задачи).

Мы подробнее обсудим как могут общаться и синхронизироваться между собой потоки одной рабочей группы в следующих лекциях. Но пока что можно считать что в группах по 64 штуки ``work-item``.
И именно благодаря небольшому размеру наличие синхронизации внутри рабочей группы не является препятствием для масштабирования задачи на тысячи ядер видеокарты, т.к. разные группы между собой работают независимо и не имеют механизмов синхронизации (а значит ускорение от увеличения числа рабочих групп линейное).

Т.о. в целом рабочее пространство выглядит так (здесь двухмерном случай и в каждой ``work-group`` по 8x4 ``work-item``):

<img alt="NDRange, work-group, work-item" src="/static/courses/gpgpu2018/lecture2/ndrange.png"/>

Что произойдет если число элементов в массиве некратно размеру рабочей группы? Например чисел 1000000, а рабочая группа размером 256? По спецификации OpenCL 1.2 размер рабочего пространства всегда должен быть кратен рабочей группе,
 поэтому нужно создать рабочее пространство округленное вверх до кратности (1000192), а в лишних ``work-item`` просто ничего не делать добавив в ``kernel`` проверку на выход за пределы массива:

```cpp
__kernel void aplusb(__global const float* a,
                     __global const float* b,
                     __global       float* c,
                              const size_t n
)
{
    const size_t i = get_partId(0);
    if (i >= n)
        return;

    c[i] = a[i] + b[i];
}
```

## Общие концепции OpenCL-API

В компьютере может быть несколько OpenCL-устройств, например:

 - Intel-процессор
 - Интегрированная видеокарта Intel HD
 - Дискретная видеокарта AMD
  
Все эти устройства можно использовать через OpenCL.

В первую очередь у драйвера нужно спросить перечень доступных OpenCL-платформ через [clGetPlatformIDs](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clGetPlatformIDs.html), в описанном случае есть две платформы - платформа от Intel (позволяющая работать с процессором и интегрированной Intel HD) и платформа от AMD (позволяющая работать с процессором и дискретной видеокартой).

Затем у каждой платформы нужно узнать о перечне доступных устройств этой платформы через [clGetDeviceIDs](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clGetDeviceIDs.html).

Про каждое устройство можно узнать такую информацию как название устройства, максимальный размер ``work-group``, тип устройства, размер памяти и т.п. через [clGetDeviceInfo](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clGetDeviceInfo.html).

Наконец, выбрав устройство (или устройства) которое планируется использовать нужно создать контекст через [clCreateContext](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clCreateContext.html).

Теперь есть OpenCL-контекст в котором могут существовать аллоцированные в видеопамяти массивы данных, скомпилированные ``kernel``-функции и т.п..

Все команды для выполнения на устройстве (такие как выполнение ``kernel``-функции, копирование данных из оперативной памяти в видеопамять, кпирование результатов вычислений из видеопамяти в оперативную память и т.п.) делаются
через очередь задач к отдельному устройству. Поэтому в рамках контекста для каждого рабочего устройства требуется создать очередь команд через [clCreateCommandQueue](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clCreateCommandQueue.html).

Дальше остается создать ``kernel``-функцию в рамках созданного контекста (компиляция будет произведена драйвером на лету), аллоцировать рабочие массивы данных в видеопамяти, прогрузить данные, выполнить ``kernel``-функцию, и выгрузить результат из видеопамяти в оперативную память.
 
Все эти OpenCL-API вызовы не нужно использовать напрямую, достаточно один раз написать обертку над ними и дальше работать с удобной оберткой. В рамках курса будет предложена готовая обертка, 
но нужно уметь работать с этими функциями напрямую, и это возможно благодаря отличной [документации](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/). Так же может быть удобна [эта шпаргалка](https://www.khronos.org/files/opencl-1-2-quick-reference-card.pdf).

# Домашнее задание 0 ``TODO``.

# Следующая лекция 3 ``TODO``.

## Ссылки:

- [https://www.khronos.org/files/opencl-1-2-quick-reference-card.pdf](https://www.khronos.org/files/opencl-1-2-quick-reference-card.pdf)
- [https://www.khronos.org/registry/OpenCL/specs/opencl-1.2.pdf](https://www.khronos.org/registry/OpenCL/specs/opencl-1.2.pdf)
- [https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/)
- [https://www.youtube.com/watch?v=r-7d0M5BtgY](https://www.youtube.com/watch?v=r-7d0M5BtgY)
- [https://www.imgtec.com/blog/a-quick-guide-to-writing-opencl-kernels-for-rogue](https://www.imgtec.com/blog/a-quick-guide-to-writing-opencl-kernels-for-rogue)
