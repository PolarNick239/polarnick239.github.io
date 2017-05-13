---
layout: ru/blogs/gpgpu/post
title:  "CUDA allocations takes up to 600 ms"
date:   2017-05-13 21:30:00 +0300
categories: gpu cuda nvidia
lang:   en
id:     3_cuda_mallocs
---

On two-socket computer with two Quadro P6000 GPUs under Windows algorithm was very slow - GPUs utilization was between 10% and 30%.
 But on the same computer under Linux utilization of both GPUs is very high, and algorithm runs fast.
 On another one-socket computer under Windows the problems also wasn't found: GPUs utilization about 90%.

After running on two-socket computer under Windows profiler showed that CUDA allocations were taking up to 600 ms (VRAM usage: only 23 out of 24 Gb):

![Slow CUDA mallocs](/static/2017/05/01/slowCudaMallocs.png)

But in fact algorithm was processing big amount of data part by part and it was reallocating data for each part, so it was possible to workaround problem
 with dirty workaround of reusing buffers. This makes code more complicated, makes more implicit amount of VRAM consumtion (and so leads to bigger chance of Out Of Memory), and finally - it is 2017!
 Allocators, multicore and multi-socket systems used for decades!

It seems that problem bound with WDDM 2.x and happens on some NUMA-architectures. To use NVIDIA GPU not under WDDM driver - it can be switched to TCC mode.
 But this driver mode available only under Quadro/Tesla/Titan GPUs (**except Titan Xp** - [devtalks](https://devtalk.nvidia.com/default/topic/1007197/tcc-support-for-titan-xp-not-yet-implemented-/)).
 And only those GPUs, who don't used for display. So if you are using server with only two GPU slots and one GPU is connected to display - very sad! This one was the waste of your money (in case of computations)!
 You can switch to TCC mode only the second GPU, and you can try to make allocations less frequent.

Discussion on [devtalks](https://devtalk.nvidia.com/default/topic/924453/-multiple-gpus-processes-cuda-memory-de-allocation-slow).
 
Profiling results with one GPU in WDDM mode, and one GPU in TCC mode:

![Fixed CUDA mallocs](/static/2017/05/01/fixedCudaMallocs.png)
