---
layout: ru/blogs/gpgpu/post
title:  "NVIDIA OpenCL bug: Ptx assembly aborted due to errors"
date:   2017-04-28 21:30:00 +0300
categories: gpu sse opencl nvidia
lang:   ru
id:     2_nvidia_ptx_assembly_popcount_bug
---

```Ситуация:``` NVIDIA драйвер падает при компиляции OpenCL 1.2 кернела с ошибкой:

```
ptxas application ptx input, line 16; fatal : Parsing error near '[]': syntax error
ptxas fatal : Ptx assembly aborted due to errors
```

Причем проблема встречается на GeForce GTX 580, но с тот же драйвер корректно компилирует для многих современных GPU (GTX Titan X, GTX 980, GTX 1080 и т.п.). 

Т.к. NVIDIA сначала генерирует промежуточный ptx-ассемблер а затем его компилирует, полезно взглянуть на этот ассемблер в месте которое не смогло скомпилироваться:
 
```cpp
.func (.param .b32 func_retval0) popcount
(
    .param .align 8 .b8 %VAParam[]
);
```

```Workaround:``` Если заменить вызовы функции [popcount](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/popcount.html) (появившейся с OpenCL 1.2) на вызовы самописной popcount (на базе битовых операций) - проблема решается для GTX 580 (этот странный блок кода исчезает из ассемблера), но скорость работы падает в два-три раза.
