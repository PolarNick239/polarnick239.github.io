---
layout: ru/blogs/gpgpu/post
title:  "[NVidia] About OpenCL bugtracker"
date:   2017-05-13 21:30:00 +0300
categories: gpu opencl nvidia
lang:   en
id:     4_nvidia_opencl_bugreport
---

Some time ago I encountered very simple and minor bug in NVidia implementation of OpenCL: 
 [clEnqueueNDRangeKernel](https://www.khronos.org/registry/OpenCL/sdk/1.2/docs/man/xhtml/clEnqueueNDRangeKernel.html) should return error code
 ```CL_INVALID_GLOBAL_WORK_SIZE``` in case if ```global_work_size[0]``` equals to ```0```, but NVidia driver doesn't do so.
 
The bug is not important, but the history of reporting is quite interesting:

 - ```10.11.2016``` I reported the bug with description and link to OpenCL API. Got email from NVidia employee Kevin with request for bug-reproducer.
 - ```11.11.2016``` NVidia uses their self-made and awkward bugtracker without file attachment support, so you should send letter to ```CUDAIssues@nvidia.com``` with attachments and mentioning ticket number. I sent email with minimal bug-reproducer. Zip-archive included binaries, so I renamed it to ```<Some name>.zip.workaround``` to workaround email filters. Wrote to Kevin that I sent reproducer.  
 - ```26.12.2016``` I commented in bugtracker that this bug is still important for me and that at 11 november I sent email with reproducer.
 - ```26.12.2016``` Kevin wrote to me that in case if email contained zip-archive it could be blocked, so he asked me to rename archive to ```<Some name>.zip_``` and sent it to him.
 - ```26.12.2016``` I sent archive to Kevin.
 - ```21.02.2017``` Kevin wrote comment in ticket that email seems to be blocked because of zip-archive. 
 - ```21.02.2017``` I sent email with archive again with mentioning about this in ticket comment. Also I wrote that email notifications about ticket updates contain link ```https://partners.nvidia.com/bug/viewbug/<Ticket ID>```, but this link can't be opened by developers like me (because I am not a partner).
 - ```21.04.2017``` I got an email with request for archive uploading to sftp server (email contained temporary login). I uploaded archive with reproducer and wrote email about this in response.
 - ```03.05.2017``` I got email notification about ticket update, but I couldn't find any changes in letter or in ticket.
 - ```16.05.2017``` Ticket status updated from ```Open - Requested more info from customer``` to ```Open - in progress```
 - ```To be continued...```
