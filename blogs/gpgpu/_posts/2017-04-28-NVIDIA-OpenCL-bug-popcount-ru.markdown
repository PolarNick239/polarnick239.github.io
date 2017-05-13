---
layout: ru/blogs/gpgpu/post
title:  "NVIDIA OpenCL bug: Ptx assembly aborted due to errors"
date:   2017-04-28 21:30:00 +0300
categories: gpu opencl nvidia
lang:   ru
id:     2_nvidia_ptx_assembly_popcount_bug
---

```Ситуация:``` NVIDIA драйвер падает при компиляции OpenCL 1.2 кернела на некоторых GPU с ошибкой:

```
ptxas application ptx input, line 16; fatal : Parsing error near '[]': syntax error
ptxas fatal : Ptx assembly aborted due to errors
```

Причем проблема обнаружена на GeForce GTX 580, но тот же драйвер успешно компилирует тот же кернел для многих современных GPU (GTX Titan X, GTX 980, GTX 1080 и т.п.). 

Т.к. NVIDIA сначала генерирует промежуточный ptx-ассемблер а затем его компилирует, полезно взглянуть на этот ассемблер там, где произошла ошибка компиляции:
 
```cpp
.func (.param .b32 func_retval0) popcount
(
    .param .align 8 .b8 %VAParam[]
);
```

```Workaround:``` Если заменить вызовы функции [popcount](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/popcount.html) на вызовы самописной popcount (на базе битовых операций) - проблема решается для GTX 580 (этот странный блок исчезает из ассемблера), но скорость работы падает в два-три раза.

Получение ptx-ассемблера
------------------------

В OpenCL [функция](https://www.khronos.org/registry/OpenCL/sdk/1.1/docs/man/xhtml/clGetProgramInfo.html) ```clGetProgramInfo(CL_PROGRAM_BINARIES)``` позволяет получить промежуточное представление кернела. Это может быть скомпилированный бинарник, промежуточное представление, или же ptx-ассемблер (в случае NVIDIA):

```cpp
std::vector<unsigned char> getProgramBinaries(cl_program program)
  {
    size_t binaries_size;
    OCL_SAFE_CALL(clGetProgramInfo(program, CL_PROGRAM_BINARY_SIZES,
                  sizeof(size_t), &binaries_size, NULL));

    std::vector<unsigned char> binaries(binaries_size);
    unsigned char *data = binaries.data();
    OCL_SAFE_CALL(clGetProgramInfo(program, CL_PROGRAM_BINARIES,
                  sizeof(unsigned char *), &data, NULL));

    return binaries;
  }
```

P.S. ```OCL_SAFE_CALL``` - самописный макрос проверяющий результат OpenCL-вызова для обработки ошибок.

Битовая реализация popcount
---------------------------

```cpp
static unsigned int popcnt32(unsigned int x)
{
  x = x - ((x >> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x = ((mul24(x, 0x808080u) << 1) + x) >> 24;
  return x;
}
```
