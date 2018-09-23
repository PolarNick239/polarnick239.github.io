---
layout: ru/blogs/courses/gpgpu2018/post
title:  "Архитектура видеокарт: Warps/Wavefronts, code divergence, occupancy, coalesced memory access, banks conflicts"
date:   2018-09-17 21:30:00 +0300
lang:   ru
id:     23_gpgpu2018_lecture1
---

[Слайды](/static/courses/gpgpu2018/lecture2/2018_09_17_video_cards_computation_2018_autumn.pdf)
=======

<iframe width="560" height="315" src="https://www.youtube.com/embed/0VQDmB8rtQQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>

[Практическое задание](https://github.com/GPGPUCourse2018/Task1AplusB)
=======

Теоретическое задание
=======

Ниже три небольших задачи.

**1)** Пусть на вход дан сигнал x[n], а на выход нужно дать два сигнала y1[n] и y2[n]:

```
 y1[n] = x[n - 1] + x[n] + x[n + 1]
 y2[n] = y2[n - 2] + y2[n - 1] + x[n]
```

Какой из двух сигналов будет проще и быстрее реализовать в модели массового параллелизма на GPU и почему?

**2)** Предположим что размер warp/wavefront равен 32 и рабочая группа делится
 на warp/wavefront-ы таким образом что внутри warp/wavefront
 номер WorkItem по оси x меняется чаще всего, затем по оси y и затем по оси z.

Напоминание: инструкция исполняется (пусть и отмаскированно) в каждом потоке warp/wavefront если хотя бы один поток выполняет эту инструкцию неотмаскированно. Если не все потоки выполняют эту инструкцию неотмаскированно - происходит т.н. code divergence.

Пусть размер рабочей группы (32, 32, 1)

```
int idx = get_local_id(1) + get_group_size(1) * get_local_id(0);
if (idx % 32 < 16)
    foo();
else
    bar();
```

Произойдет ли code divergence? Почему?

**3)** Как и в прошлом задании предположим что размер warp/wavefront равен 32 и рабочая группа делится
 на warp/wavefront-ы таким образом что внутри warp/wavefront
 номер WorkItem по оси x меняется чаще всего, затем по оси y и затем по оси z.

Пусть размер рабочей группы (32, 32, 1).
Пусть data - указатель на массив float-данных в глобальной видеопамяти идеально выравненный (выравнен по 128 байтам, т.е. data % 128 == 0).

(a)
```
data[get_local_id(0) + get_group_size(0) * get_local_id(1)] = 1.0f;
```

Будет ли данное обращение к памяти coalesced? Сколько кеш линий записей произойдет в одной рабочей группе?

(b)
```
data[get_local_id(1) + get_group_size(1) * get_local_id(0)] = 1.0f;
```

Будет ли данное обращение к памяти coalesced? Сколько кеш линий записей произойдет в одной рабочей группе?

(c)
```
data[1 + get_local_id(0) + get_group_size(0) * get_local_id(1)] = 1.0f;
```

Будет ли данное обращение к памяти coalesced? Сколько кеш линий записей произойдет в одной рабочей группе?
