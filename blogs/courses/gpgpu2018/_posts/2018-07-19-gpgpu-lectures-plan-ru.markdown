---
layout: ru/blogs/courses/gpgpu2018/post
title:  "План курса"
date:   2018-07-19 21:30:00 +0300
lang:   ru
id:     18_gpgpu2018_lectures_plan
---

Курс будет предложен в рамках осеннего семестра Computer Science Center и предполагает знание C++.

Для выполнения домашних заданий желательно наличие любой дискретной видеокарты, но OpenCL можно запускать и на инегрированной Intel HD, и на CPU. Операционная система любая.

Рекомендуется тестировать приложение на скорость на дискретной видеокарте, но сначала на корректность - и делать это на процессоре (тогда гораздо ниже риски что придется перезапускать компьютер из-за баги и/или слабого драйвера).

Рекомендуемое окружение: Ubuntu + GCC 5.4 + CLion.

## План лекций:

# Неделя 1:

[Лекция 1](/blogs/courses/gpgpu2018/2018/07/20/lecture1-history-ru.html):
``История`` Процессоры, software 3D, специализированные 3D-ускорители, 3D-ускорители стали программируемыми (шейдеры), появление GPGPU.

[Лекция 2](/blogs/courses/gpgpu2018/2018/07/21/lecture2-opencl-introduction-ru.html):
``Введение в OpenCL`` Модель вычислений с массовым параллелизмом, общие концепции API, OpenCL-manual. [[0.4]](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/)

``Задание 0``.

# Неделя 2:

``Задание 0 - дедлайн``.

``Лекция 3: Архитектура видеокарты`` Высокий throughput ценой latency. Global/texture/cache/local/register memory.

``Лекция 4: Механизмы синхронизации`` Atomics, barriers, warps/wavefronts.

``Задание 1``.

# Неделя 3:
   
``Лекция 5: Оптимизация`` Coalesced access и bank conflicts. Occupancy и registers spilling. Нужна ли 100% occupancy?

``Лекция 6: Перемножение матриц`` Оптимизация перемножения матриц через shared memory. [[1]](http://courses.cms.caltech.edu/cs179/) [[2]](https://github.com/NVIDIA/cuda-samples/blob/master/Samples/matrixMul/matrixMul.cu) [[3]](https://cnugteren.github.io/tutorial/pages/page1.html)

# Неделя 4:


``Лекция 7: Задачи задания 1`` Reduction: сумма чисел массива, prefix-сумма, сортировки.

``Задание 1 - мягкий дедлайн``. ``Задание 2``

# Неделя 5:

``Задание 1 - дедлайн``

``Лекция 8`` Задачи компьютерного зрения, вычисления на октодеревьях (lookup tables), marching cubes.

# Неделя 6:

``Задание 2 - мягкий дедлайн``.

``Лекция 9: Поддержка всех устройств`` Баланс между driver timeout и GPU underutilization. Поддержка multi-GPU. CPU+GPU. Live demo: PyOpenCL.

``Задание 3``.

# Неделя 7:

``Лекция 10: CUDA, поддержка OpenCL+CUDA`` Отличия CUDA. Как поддерживать вычисления на двух API. Поддержка шаблонов в OpenCL 1.2.

# Неделя 8:

``Задание 3 - мягкий дедлайн``

``Лекция 11: Профилирование`` NVidia Nsight, AMD CodeXL, Intel VTune amplifier.

# Неделя 9:

``Задание 3 - дедлайн``

``Лекция 12: CPU бывают удобнее`` OpenMP и SSE/AVX интринсики. OpenMP: просто и быстро. SSE/AVX: можно сильно ускорить и будет работать везде, но тяжело. [[4]](https://software.intel.com/sites/landingpage/IntrinsicsGuide/) [[5]](http://www.tommesani.com/index.php/simd/46-sse-arithmetic.html) [[6]](http://polarnick.com/blogs/other/cpu/gpu/sse/opencl/openmp/2016/10/01/mandelbrot-set-sse-opencl-ru.html)

## Практические задания:

``Задание 0`` A+B c почти готовым кодом: нужно реализовать kernel-функцию. Цель - убедиться что у всех есть окружение и познакомить с форматом заданий.

``Задание 1`` Перемножение матриц (через shared memory). [[1]](http://courses.cms.caltech.edu/cs179/) [[2]](https://github.com/NVIDIA/cuda-samples/blob/master/Samples/matrixMul/matrixMul.cu) [[3]](https://cnugteren.github.io/tutorial/pages/page1.html)

``Задание 2`` Несколько подробно обсужденных задачек с почти готовым кодом (реализовать кернелы, CPU-версии уже готовы), ориентировочно четыре-пять задачек:
 
 - [Фрактал мандельброта](https://en.wikipedia.org/wiki/Mandelbrot_set)
 - Пример численного метода (TV-L1 denoising)
 - Сумма чисел массива
 - [Сумма на префиксе](https://en.wikipedia.org/wiki/Prefix_sum)
 - Сортировки
 - [Gaussian blur](https://en.wikipedia.org/wiki/Gaussian_blur)
 - Поиск кратчайшего пути

``Задание 3`` Задача машинного обучения с самописной версией [HOG](https://en.wikipedia.org/wiki/Histogram_of_oriented_gradients) через PyOpenCL.

# Формат заданий:

``Задание 0`` можно отправлять в течение недели, нужно отправить хотя бы что-то. Сдача через pull-request.

``Задания 1, 2 и 3`` мягкий дедлайн через две недели, жесткий дедлайн еще через неделю. Сдача через pull-request. После мягкого дедлайна можно отправить на проверку не больше одного раза.

``Теоретические вопросы`` Дополнительно даются теоретические вопросы на неделю после каждой лекции. Сдача через email. [[1]](http://courses.cms.caltech.edu/cs179/)

# Разбалловка:

- 30 баллов - ``Задание 1``
- 30 баллов - ``Задание 2``
- 30 баллов - ``Задание 3``
- 10 баллов - ``Теоретические вопросы`` (суммарно за все)

# Финальная оценка:

- 60+ баллов - 3
- 70+ баллов - 4
- 85+ баллов - 5

# Ссылки:

[[0.1]](https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/) - A trip through the Graphics Pipeline 2011

[[0.2]](https://anteru.net/blog/2018/intro-to-compute-shaders/) [[0.3]](https://anteru.net/blog/2018/more-compute-shaders/index.html) - About compute shaders

[[0.4]](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/) - OpenCL manual

[[1]](http://courses.cms.caltech.edu/cs179/) - CS 179 GPU Programming course in Caltech

[[2]](https://github.com/NVIDIA/cuda-samples/blob/master/Samples/matrixMul/matrixMul.cu) - NVIDIA CUDA Samples

[[3]](https://cnugteren.github.io/tutorial/pages/page1.html) - Tutorial: OpenCL SGEMM tuning for Kepler

[[4]](https://software.intel.com/sites/landingpage/IntrinsicsGuide/) - Interactive intrinsics guide (SSE, AVX and others)

[[5]](http://www.tommesani.com/index.php/simd/46-sse-arithmetic.html) - SSE Arithmetic diagrams

[[6]](http://polarnick.com/blogs/other/cpu/gpu/sse/opencl/openmp/2016/10/01/mandelbrot-set-sse-opencl-ru.html) - Фрактал Мандельброта (OpenCL, OpenMP+SSE/AVX)

https://www.learnopencv.com/handwritten-digits-classification-an-opencv-c-python-tutorial/
