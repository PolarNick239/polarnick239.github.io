---
layout: blogs/other/post
title:  "GPU version of mean shift segmentation"
date:   2018-05-08 21:30:00 +0300
categories: gpu opencl cv
lang:   en
id:     16_gpu_meanshift
---

There are exists great mean shift segmentation implementation in [EDISON](http://coewww.rutgers.edu/riul/research/code/EDISON/) (Edge Detection and Image SegmentatiON system).

But it has some disadvantages:

 - Optimized version (HIGH_SPEEDUP) not optimized for modern CPUs and performs even slower than non-optimized one (NO_SPEEDUP) 
 - No optimization for multi-core CPUs
 - No implementation for GPUs

So implementation was modified with following targets:

 - Results should be as close to original version as possible (original version - NO_SPEEDUP)
 - Multithreaded version for multi-core CPUs (OpenMP)
 - Adaptation for GPUs (OpenCL)
 - Possibility to run on multiple GPUs+CPU (just for fun)

Resulted implementation with benchmarks on multiple CPUs and GPUs open-sourced on [github](https://github.com/PolarNick239/OpenMeanShift).

Example of result:

![Unicorn from Blade Runner](https://raw.githubusercontent.com/PolarNick239/OpenMeanShift/master/data/no_speedup/unicorn_512_no.png)
