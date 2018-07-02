---
layout: ru/blogs/other/post
title:  "GPU версия mean shift сегментации"
date:   2018-05-08 21:30:00 +0300
categories: gpu opencl cv
lang:   ru
id:     16_gpu_meanshift
---

Существует очень хорошая реализация mean shift сегментации в [EDISON](http://coewww.rutgers.edu/riul/research/code/EDISON/) (Edge Detection and Image SegmentatiON system).

К сожалению она обладает несколькими недостатками:

 - Оптимизированная версия (HIGH_SPEEDUP) не только не оптимизирована под современные процессоры, но работает даже медленнее чем неоптимизированная версия (NO_SPEEDUP) 
 - Отсутствует оптимизация под многоядерные CPU
 - Отсутствует реализация под GPU

Поэтому реализация была модифицирована с учетом следующих целей:

 - Результаты должны быть максимально близки к оригинальной версии (к NO_SPEEDUP)
 - Распараллеливание под многоядерные CPU (OpenMP)
 - Адаптация под GPU (OpenCL)
 - Возможность ускорения множеством видеокарт вместе с процессором (просто из любопытства)

Получившаяся модификация с замерами производительности на различных процессорах и видеокартах выложена на [github](https://github.com/PolarNick239/OpenMeanShift).

Пример результата:

![Unicorn from Blade Runner](https://raw.githubusercontent.com/PolarNick239/OpenMeanShift/master/data/no_speedup/unicorn_512_no.png)
