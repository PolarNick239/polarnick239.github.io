---
layout: blogs/gpgpu/post
title:  "NVIDIA OpenCL bug: Ptx assembly aborted due to errors"
date:   2017-04-28 21:30:00 +0300
categories: gpu opencl nvidia
lang:   en
id:     2_nvidia_ptx_assembly_popcount_bug
---

```Situation:``` NVIDIA Driver fails at compilation of OpenCL 1.2 kernel on some GPUs with error:

```
ptxas application ptx input, line 16; fatal : Parsing error near '[]': syntax error
ptxas fatal : Ptx assembly aborted due to errors
```

Problem was encountered on GeForce GTX 580, but the same driver successfully compiles the same kernel for multiple last GPUs (GTX Titan X, GTX 980, GTX 1080 and so on). 

NVIDIA firstly generates intermediate ptx-assembly, and then compiles it. So it is helpful to look at these assembly at place that failed to compile:
 
```cpp
.func (.param .b32 func_retval0) popcount
(
    .param .align 8 .b8 %VAParam[]
);
```

```Workaround:``` If all [popcount](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/popcount.html) calls will be replaced with manually implemented popcount (based on bit-operations) - problem fixes for GTX 580 (this strange assembly block dissapear), but speed drops two-three times.

Retrieving ptx-assembly
-----------------------

In OpenCL [function](https://www.khronos.org/registry/OpenCL/sdk/1.1/docs/man/xhtml/clGetProgramInfo.html) ```clGetProgramInfo(CL_PROGRAM_BINARIES)``` retrieves intermediate representation of the kernel. Representation can be binary or, for example, text instructions of ptx-assebmly (in case of NVIDIA):

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

P.S. ```OCL_SAFE_CALL``` - macros that checks result of OpenCL-call to check error codes.

Bit-operations popcount
-----------------------

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
