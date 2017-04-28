---
layout: blogs/gpgpu/post
title:  "NVIDIA OpenCL bug: Ptx assembly aborted due to errors"
date:   2017-04-28 21:30:00 +0300
categories: gpu sse opencl nvidia
lang:   en
id:     2_nvidia_ptx_assembly_popcount_bug
---

```Situation:``` NVIDIA Driver fails on compilation of OpenCL 1.2 kernel with error:

```
ptxas application ptx input, line 16; fatal : Parsing error near '[]': syntax error
ptxas fatal : Ptx assembly aborted due to errors
```

Problem reproduces only on GeForce GTX 580, but the same driver succesfully compiles this kernel for multiple last GPUs (GTX Titan X, GTX 980, GTX 1080 and so on). 

NVIDIA firstly generates intermediate ptx-assembly, and then compiles it. So it is helpful to look at these assembly at place that failed to compile:
 
```cpp
.func (.param .b32 func_retval0) popcount
(
    .param .align 8 .b8 %VAParam[]
);
```

```Workaround:``` If all [popcount](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/popcount.html) calls will be replaced with manually implemented popcount (based on bit-operations) - problem fixes for GTX 580 (this strange assembly block dissapear), but speed drops two-three times.
