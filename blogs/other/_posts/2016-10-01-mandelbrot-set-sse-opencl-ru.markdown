---
layout: ru/blogs/other/post
title:  "Множество Мандельброта. Вычисления с помощью SSE, AVX и OpenCL"
date:   2016-10-01 21:30:00 +0300
categories: cpu gpu sse opencl openmp
lang:   ru
id:     1_mandelbrot
---

[Множество Мандельброта](https://ru.wikipedia.org/wiki/%D0%9C%D0%BD%D0%BE%D0%B6%D0%B5%D1%81%D1%82%D0%B2%D0%BE_%D0%9C%D0%B0%D0%BD%D0%B4%D0%B5%D0%BB%D1%8C%D0%B1%D1%80%D0%BE%D1%82%D0%B0) - множество комплексных чисел $$c$$ для которых $$f_{c}(z)=z^{2}+c$$ не расходится (начиная с $$z=0$$), 
т.е. множество комплексных чисел, для которых $$\{ f_{c}(0),\>f_{c}(f_{c}(0)),\>\dots \}$$ остается ограниченным.

Полезный факт: если $$\|P_{c}^{n}(0)\| > 2$$, то $$c$$ не принадлежит множеству Мондельброта.

Если $$c=(x_0, y_0) = x_0 + y_0 \cdot i$$ и $$z=(x, y) = x + y \cdot i$$, то $$f_{c}(z) = z^2+c$$ $$ = x^2 + 2 x y \cdot i - y^2 + x_0 + y_0 \cdot i$$ $$ = (x^2 - y^2 + x_0, 2xy + y_0)$$.

Хочется визуализировать множество таких точек на $$2D$$-плоскости (псевдокод):

``` cpp
mandelbrotContains(x0, y0):
    x, y = x0, y0
    for iteration in 0...MAX_ITERATIONS:
        x, y = x*x - y*y + x0, 2*x*y + y0
        if sqrt(x*x+y*y) > 2:
            return false
    return true

drawMandelbrot(image):
    for x in image:
        for y in image:
            if mandelbrotContains(x, y):
                image[x, y] = true
            else:
                image[x, y] = false
```

![Множество Мандельброта](/static/mandelbrot/mandelbrot.png)

Давайте реализуем вычисление количества итераций, которое успевает произойти в функции ```mandelbrotContains(x, y)``` до ее завершения. Если число итераций достигает ```MAX_ITERATIONS``` - 
 эта точка почти наверняка принадлежит нашему множеству (т.к. ряд не расходится достаточно долго).
 
Реализация на **C++** {% include /commons/icon-github.html label="ниже:" link="https://github.com/PolarNick239/FPGABenchmarks/blob/c36b213bed3fbf6c714f3a819e820d3d393c9711/benchmarks/mandelbrot/src/mandelbrot_cpu.cpp#L13-L45" %}

``` cpp
void MandelbrotProcessorCPU::process(Vector2f from, Vector2f to,
                                     Image<unsigned short>& iterations) {
    size_t width = iterations.width;
    size_t height = iterations.height;

    float x_step = (to.x() - from.x()) / width;
    float y_step = (to.y() - from.y()) / height;

    for (size_t py = 0; py < height; py++) {
        float y0 = from.y() + y_step * py;

        for (size_t px = 0; px < width; px++) {
            float x0 = from.x() + x_step * px;

            unsigned short iteration;
            float x = 0.0f;
            float y = 0.0f;
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                float xn = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xn;
                if (x * x + y * y > INFINITY) {
                    break;
                }
            }
            iterations(py, px) = iteration;
        }
    }
}
```

Замечания: ```from``` и ```to``` - координаты углов изображения на комлексной плоскости, ```INFINITY``` - порог расхождения ряда (равен ```2.0f```). 

Все замеры производительности ниже реализованы в {% include /commons/icon-github.html label="этом" link="https://github.com/PolarNick239/FPGABenchmarks/blob/c36b213bed3fbf6c714f3a819e820d3d393c9711/benchmarks/mandelbrot/src/mandelbrot_bench.cpp" %} исходнике, но запускается он с разрешением 2048x2048 (```MAX_ITERATIONS = 10000``` как на github).

На моем **Intel i7 6700** данная реализация выполняется **5545 ms**.

OpenMP праллелизация
--------------------

Но в моем CPU четыре ядра, и восемь потоков из-за hyper-threading, поэтому давайте распараллелим вычисления с помощью **OpenMP**. {% include /commons/icon-github.html label="Код:" link="https://github.com/PolarNick239/FPGABenchmarks/blob/c36b213bed3fbf6c714f3a819e820d3d393c9711/benchmarks/mandelbrot/src/mandelbrot_cpu.cpp#L13-L45" %}

``` cpp
void MandelbrotProcessorCPU::process(Vector2f from, Vector2f to,
                                     Image<unsigned short>& iterations) {
    size_t width = iterations.width;
    size_t height = iterations.height;

    float x_step = (to.x() - from.x()) / width;
    float y_step = (to.y() - from.y()) / height;
    
    // The only line needed to add:
    #pragma omp parallel for
    for (size_t py = 0; py < height; py++) {
        float y0 = from.y() + y_step * py;

        for (size_t px = 0; px < width; px++) {
            float x0 = from.x() + x_step * px;

            unsigned short iteration;
            float x = 0.0f;
            float y = 0.0f;
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                float xn = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xn;
                if (x * x + y * y > INFINITY) {
                    break;
                }
            }
            iterations(py, px) = iteration;
        }
    }
}
```

Единственная важная строка кода - ```#pragma omp parallel for```. **OpenMP** позволяет распараллелить вычисления с помощью таких простых прагм.
 Данный фреймворк поддерживается почти всеми компиляторами (разве что возможно на **Mac OS X** он не поддерживается из коробки).

В данном случае **OpenMP** распределяет вычисления между всем ядрами. Прагма была указана для внешнего for-loop - поэтому блок кода внешнего цикла будет исполнятся с некоторым значением ```py``` в одном из потоков.
 Например для каждого восьмого значения ```py``` блок кода может исполняться в Потоке#8, каждый седьмой из восьми - в Потоке#7 и так далее.
 Поэтому логично ожидать ускорение вплоть до **x8** раз.
 
Теперь время исполнения равно **1274 ms**. Ускорение: ```5545 ms / 1274 ms = x4.3```. Это не те **x8** которые ожидались, и вызвано это тем что на самом деле в процессоре только **4** реальных ядра.
 Hyper-threading одного ядра может привести к ускорение только если два паралелльных потока используют разные ресурсы этого ядра.
 Узкое место в данном примере в вычислениях - и эти ресурсы ядер не могут быть магическим образом удвоены за счет hyper-threading.
 
Итого на данный момент:

```
Speedup  Time    Implementation   Device

 x4.3   1274 ms	 Naive CPU        8 threads		
 x1.0   5545 ms	 Naive CPU        1 thread	

Cpu is Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz (4 cores, 8 threads by hyper-threading)
```

SIMD, SSE
---------

Уже очень давно все процессоры поддерживают [SIMD](https://en.wikipedia.org/wiki/SIMD) инструкции.
 **SIMD** (Single Instruction, Multiple Data) позволяют произвести одну операцию сразу над несколькими операндами.
 Например можно сложить $$a_1,a_2,a_3,a_4$$ с $$b_1,b_2,b_3,b_4$$ и получить $$c_1,c_2,c_3,c_4$$, где $$c_i=a_i+b_i$$.
 Ориентировочно можно считать, что если инструкция обрабатывает **N** операндов - она даст прирост вплоть до x**N** раз.
 
Наиболее известные и популярные расширения - **SSE**, **SSE2** и вплоть до **SSE4.2**. Они поддерживаются практически во всех **x86** процессорах и оперируют **128**-битными данными.
 В случае работы с **32**-битными числами с плавающей точкой это означает ускорение вплоть до **x4** раз.
 
Все современные компиляторы поддерживают **intrinsics** для таких расширений.
 Пример **SSE** инструкции: ```_mm_add_ps``` - суммирует четыре числа с плавающей точкой (числа должны располагаться в специальном **SSE** регистре) с другими четырьмя числами (из другого регистра) и
 сохраняет результат в третий регистр. Более детальное описание всех инструкций удобно изложено в [Intel intrinsics guide](https://software.intel.com/sites/landingpage/IntrinsicsGuide/#text=_mm_add_ps&expand=109).
 Суффикс инструкции показывает над каким типом данных выполняется работа. Например *ps* - над числами с плавающей точкой одинарной точности, *pi16* - **16-битные** целые числа и т.п..
  
Т.к. эти intrinsics работают с **четырьмя 32-битными операндами** одновременно - нам надо выполнять вычисления над данными расположенными в специальных больших регистрах, а затем выгрузить результат из регистра в память.

**C++** компилятор сам распределит наши вычисления по регистрам, но для этого требуется явным образом работать с четырьмя значениями за раз - с помощью использования специального типа: ```__m128``` - **128-битного** регистра.

Итоговый {% include /commons/icon-github.html label="код:" link="https://github.com/PolarNick239/FPGABenchmarks/blob/c36b213bed3fbf6c714f3a819e820d3d393c9711/benchmarks/mandelbrot/src/mandelbrot_cpu_sse.cpp#L20-L81" %}

``` cpp
void MandelbrotProcessorCPU_SSE::process(Vector2f from, Vector2f to,
                                         Image<unsigned short>& iterations) {
    float width = iterations.width;
    float height = iterations.height;

    float x_step = (to.x() - from.x()) / width;
    float y_step = (to.y() - from.y()) / height;

    #pragma omp parallel for
    for (size_t py = 0; py < iterations.height; py++) {
        float y0 = from.y() + y_step * py;

        for (size_t px = 0; px < iterations.width / 4 * 4; px += 4) {
            float pxf = (float) px;
                                                                                                                    // Four values in register (__m128):
            __m128 pxs_deltas128 = _mm_mul_ps(_mm_set_ps(0.0f, 1.0f, 2.0f, 3.0f), _mm_set1_ps(x_step));             // 0.0f*x_step, 1.0f*x_step, 2.0f*x_step, 3.0f*x_step 
            __m128 xs0 = _mm_add_ps(_mm_set1_ps(from.x()), _mm_add_ps(_mm_set1_ps(x_step * pxf), pxs_deltas128));   // from.x()+px*x_step, where px takes 4 conseqent values starting from current loop index

            unsigned short iteration;
            __m128i maskAll = _mm_setzero_si128();                                                                  // maskAll is the mask, that stores flag for each value from our four:
            __m128i iters = _mm_setzero_si128();                                                                    // 'is this series divergent?' - sqrt(x*x+y*y) > 2
            __m128 xs = _mm_set1_ps(0.0f);                                                                          // because in that case we should not increment 'iters' for that value
            __m128 ys = _mm_set1_ps(0.0f);
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                __m128 xsn = _mm_add_ps(_mm_sub_ps(_mm_mul_ps(xs, xs), _mm_mul_ps(ys, ys)), xs0);                   // xn = x * x - y * y + x0;
                __m128 ysn = _mm_add_ps(_mm_mul_ps(_mm_mul_ps(_mm_set1_ps(2.0f), xs), ys), _mm_set1_ps(y0));        // yn = 2 * x * y + y0;
                xs = _mm_add_ps(_mm_andnot_ps((__m128) maskAll, xsn), _mm_and_ps((__m128) maskAll, xs));            // updating previous values to new ones
                ys = _mm_add_ps(_mm_andnot_ps((__m128) maskAll, ysn), _mm_and_ps((__m128) maskAll, ys));            // but with taking into account maskAll
                                                                                                                    // (if value divergent once - we should fix its iterations number)

                maskAll = _mm_or_si128(_mm_castps_si128(_mm_cmpge_ps(_mm_add_ps(_mm_mul_ps(xs, xs), _mm_mul_ps(ys, ys)), _mm_set1_ps(INFINITY))), maskAll);  // calculating mask, by checking x*x+y*y > INFINITY for each value
                iters = _mm_add_epi16(iters, _mm_andnot_si128(maskAll, _mm_set1_epi16(1)));                         // increments 'iters' counter for those numbers,
                int mask = _mm_movemask_epi8(maskAll);                                                              // that were taking part in this iteration
                if (mask == 0xffff) {
                    break;                                                                                          // if all values divergent - stop
                }
            }
            iters = _mm_shuffle_epi8(iters, _mm_setr_epi8(12, 13, 8, 9, 4, 5, 0, 1, -1, -1, -1, -1, -1, -1, -1, -1));
            _mm_storel_epi64((__m128i *) &iterations(py, px), iters);                                               // unloading data to memory
        }

        for (size_t px = iterations.width / 4 * 4; px < iterations.width; px++) {
            float x0 = from.x() + (to.x() - from.x()) * px / width;

            unsigned short iteration;
            float x = 0.0f;
            float y = 0.0f;
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                float xn = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xn;
                if (x * x + y * y > INFINITY) {
                    break;
                }
            }
            iterations(py, px) = iteration;
        }
    }
}
```

Да, довольно нечитаемый код! Написание такого кода довольно муторное занятие (если делать это лишь изредко). [Intel intrinsics guide](https://software.intel.com/sites/landingpage/IntrinsicsGuide/#text=_mm_add_ps&expand=109)
 помогает очень сильно - в нем есть очень удобные фильтры по наборам расширений (например вам могут быть не интересны инструкции из **AVX**-набора, т.к. не все процессоры ваших пользователей поддерживают данный набор), там же есть исчерпывающие описания и т.п..
 
Обратите внимание, что последний цикл является откатом к невекторизованной версии, т.к. объем наших данных может не делиться на 4 (это количество элементов обрабатываемых за раз **SSE** инструкциями) и это самый простой и очевидный способ обработать такую ситуацию аккуратно.

Результаты производительности (**SSE**, **SSE2** и **SSSE3** были использованы):

```
Speedup   Time   Implementation   Device

x10.1    547 ms	 CPU SSE          8 threads		
 x2.3   2370 ms	 CPU SSE          1 thread	
 x4.3   1274 ms	 Naive CPU        8 threads		
 x1.0   5545 ms	 Naive CPU        1 thread	
 
Cpu is Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz (4 cores, 8 threads by hyper-threading)
```

SIMD, AVX
---------
 
Но можно пойти дальше! После **SSE** было выпущено много расширений, в т.ч. **AVX** (заявлен в 2008, поддерживается с 2011 - впервые в **Sandy Bridge**).
 Главным отличием являются более широкие (в два раза) регистры - **256-битные**, т.о. можно ускорить еще в два раза! Обратите внимание, что переход с **SSE** на **AVX**
 довольно тривиальный - достаточно заменить ```__m128``` на ```__m256``` и обновить код с учетом мелких изменений в инструкциях (например иногда порядок аргументов различается).

Код практически идентичен коду с использованием **SSE**, но {% include /commons/icon-github.html label="на всякий случай:" link="https://github.com/PolarNick239/FPGABenchmarks/blob/c36b213bed3fbf6c714f3a819e820d3d393c9711/benchmarks/mandelbrot/src/mandelbrot_cpu_avx.cpp#L19-L84" %}

``` cpp
void MandelbrotProcessorCPU_AVX::process(Vector2f from, Vector2f to,
                                         Image<unsigned short>& iterations) {
    assert (MAX_ITERATIONS < std::numeric_limits<unsigned short>::max());
    assert (iterations.cn == 1);

    assert (((float) iterations.width) + 1 == (float) (iterations.width + 1));
    assert (((float) iterations.height) + 1 == (float) (iterations.height + 1));
    float width = iterations.width;
    float height = iterations.height;

    float x_step = (to.x() - from.x()) / width;
    float y_step = (to.y() - from.y()) / height;

    #pragma omp parallel for
    for (size_t py = 0; py < iterations.height; py++) {
        float y0 = from.y() + y_step * py;

        for (size_t px = 0; px < iterations.width / 8 * 8; px += 8) {
            float pxf = (float) px;
            __m256 pxs_deltas128 = _mm256_mul_ps(_mm256_set_ps(0.0f, 1.0f, 2.0f, 3.0f, 4.0f, 5.0f, 6.0f, 7.0f), _mm256_set1_ps(x_step));
            __m256 xs0 = _mm256_add_ps(_mm256_set1_ps(from.x()), _mm256_add_ps(_mm256_set1_ps(x_step * pxf), pxs_deltas128));    // from.x() + x_step * px

            unsigned short iteration;
            __m256i maskAll = _mm256_setzero_si256();
            __m256i iters = _mm256_setzero_si256();
            __m256 xs = _mm256_set1_ps(0.0f);
            __m256 ys = _mm256_set1_ps(0.0f);
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                __m256 xsn = _mm256_add_ps(_mm256_sub_ps(_mm256_mul_ps(xs, xs), _mm256_mul_ps(ys, ys)), xs0);               // xn = x * x - y * y + x0;
                __m256 ysn = _mm256_add_ps(_mm256_mul_ps(_mm256_mul_ps(_mm256_set1_ps(2.0f), xs), ys), _mm256_set1_ps(y0)); // yn = 2 * x * y + y0;
                xs = _mm256_add_ps(_mm256_andnot_ps((__m256) maskAll, xsn), _mm256_and_ps((__m256) maskAll, xs));
                ys = _mm256_add_ps(_mm256_andnot_ps((__m256) maskAll, ysn), _mm256_and_ps((__m256) maskAll, ys));

                maskAll = (__m256i) _mm256_or_ps(_mm256_cmp_ps(_mm256_add_ps(_mm256_mul_ps(xs, xs), _mm256_mul_ps(ys, ys)), _mm256_set1_ps(INFINITY), _CMP_GT_OS), (__m256) maskAll);
                iters = _mm256_add_epi16(iters, _mm256_andnot_si256(maskAll, _mm256_set1_epi16(1)));
                int mask = _mm256_movemask_epi8(maskAll);
                if (mask == (int) 0xffffffff) {
                    break;
                }
            }
            iters = _mm256_shuffle_epi8(iters, _mm256_setr_epi8(0, 1, -1, -1, 4, 5, -1, -1, 8, 9, -1, -1, 12, 13, -1, -1, 16, 17, -1, -1, 20, 21, -1, -1, 24, 25, -1, -1, 28, 29, -1, -1));
            unsigned int tmp[8];
            _mm256_storeu_si256((__m256i *) tmp, iters);
            for (int i = 0; i < 8; i++) {
                iterations(py, px + 7 - i) = (unsigned short) tmp[i];
            }
        }

        for (size_t px = iterations.width / 8 * 8; px < iterations.width; px++) {
            float x0 = from.x() + (to.x() - from.x()) * px / width;

            unsigned short iteration;
            float x = 0.0f;
            float y = 0.0f;
            for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                float xn = x * x - y * y + x0;
                y = 2 * x * y + y0;
                x = xn;
                if (x * x + y * y > INFINITY) {
                    break;
                }
            }
            iterations(py, px) = iteration;
        }
    }
}
```

Производительность:

```
Speedup   Time   Implementation   Device

x20.8    266 ms	 CPU AVX2         8 threads		
 x4.8   1160 ms	 CPU AVX2         1 thread	
x10.1    547 ms	 CPU SSE          8 threads		
 x2.3   2370 ms	 CPU SSE          1 thread	
 x4.3   1274 ms	 Naive CPU        8 threads		
 x1.0   5545 ms	 Naive CPU        1 thread	
 
Cpu is Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz (4 cores, 8 threads by hyper-threading)
```

AVX действительно дал **x2** ускорение относительно SSE.

OpenCL
------

OpenCL предоставляет единообразный способ реализации паралелльных вычислений для исполнения на множестве многоядерного железа - GPUs и CPUs.
 Ключевой код содержится в так называемом kernel (ядре), синтаксис в нем основан на **C99** и кернелы компилируются прямо на лету (как OpenGL шейдеры).
 Приложение шлет исходный код OpenCL-драйверу (например драйверу видеокарты, или специальному драйверу процессора) чтобы скомпилировать и затем исполнить kernel.
 
Код очень похож на изначальную версию:

``` cpp
__kernel void mandelbrotProcess(__global unsigned short* iterations,
                                 int width, int height,
                                 float fromX, float fromY, float toX, float toY) {
    int px = get_global_id(0);
    int py = get_global_id(1);
    if (px >= width || py >= height) return;

    float x0 = fromX + px * (toX - fromX) / width;
    float y0 = fromY + py * (toY - fromY) / height;

    unsigned short iteration;
    float x = 0.0f;
    float y = 0.0f;
    for (iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        float xn = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xn;
        if (x * x + y * y > INFINITY_THRESHOLD) {
            break;
        }
    }
    iterations[width * py + px] = iteration;
}
```

Но производительность на **AMD R9 390X** впечатляет - **6 ms**! **x924** ускорение! Причина в том, что рассматриваемый пример идеален для архитектуры видеокарты - он идеально параллелизуем и единственное узкое место - вычисления,
 нет никакого упора в доступе к памяти, нет условного ветвления, только чистые вычисления которые идеально раскладываются по регистрам и вычисления выполняются с полной вычислительной мощностью устройства. В случае **AMD R9 390X** вычислениями занимаются **2816 ядер** работающих на частоте **1 Ghz**!

**OpenCL** kernels так же можно исполнять на процессорах - тест содержит выполнение на **i7-6700** через два OpenCL-драйвера: версия от [Intel](https://software.intel.com/en-us/articles/opencl-drivers) и от [AMD](http://support.amd.com/en-us/kb-articles/Pages/OpenCL2-Driver.aspx) (драйвер от AMD так же поддерживает процессоры от Intel):

```
Speedup   Time   Implementation   Device

 x924      6 ms	 OpenCL (AMD)     Hawaii R9 390X
  x22    252 ms	 OpenCL (Intel)   Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz
 x5.8    942 ms	 OpenCL (AMD)     Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz
x20.8    266 ms	 CPU AVX2         8 threads		
 x4.8   1160 ms	 CPU AVX2         1 thread	
x10.1    547 ms	 CPU SSE          8 threads		
 x2.3   2370 ms	 CPU SSE          1 thread	
 x4.3   1274 ms	 Naive CPU        8 threads		
 x1.0   5545 ms	 Naive CPU        1 thread	
 
Cpu is Intel(R) Core(TM) i7-6700 CPU @ 3.40GHz (4 cores, 8 threads by hyper-threading)
```

И внезапно **Intel** драйвер работает быстрее чем рукописная **AVX**-версия! Это означает, что драйвер успешно векторизовал код с учетом доступных на данном процессоре наборов инструкций: AVX и AVX2.
 AMD драйвер вероятно исполняет невекторизованную версию на всех доступных ядрах, и это приводит к такой же производительности как и у наивного распараллеливания.

**OpenCL** позволяет использовать вычислительные мощности центральных процессоров и видеокарт. И это гораздо более простой способ, по сравнению с использованием процессорных intrinsics.
 Даже на CPU хорошая производительность часто может быть достигнута с прямолинейным и простым кодом благодаря OpenCL-драйверу (т.к. Intel-драйвер часто способен эффективно векторизовать код).
 Но иногда intrinsics необходимы: если не у всех пользователей есть GPU и слишком сложно заставить их установить OpenCL-драйвер от Intel, или если у вас есть много простаивающих компьютеров с мощными процессорами
 (например простаивающие сервера с Xeon-процессорами) а Intel-драйвер не сумел векторизовать ваш слишком сложный код, и т.д..
  
