---
layout: blogs/other/post
title:  "AMD and NVidia GPUs on Ubuntu at the same time"
date:   2018-08-19 21:30:00 +0300
lang:   en
id:     20_ubuntu_amd_and_nvidia
---

It is possible to use AMD GPU and NVidia GPU on Ubuntu at the same time, but both drivers should be installed and X-server should be carefully configured.

I wanted to use AMD card for display (and for OpenGL and OpenCL) and NVidia card for CUDA and OpenCL.

There are [instruction](https://askubuntu.com/a/892533) exists, but it didn't work for me, but this explicit way worked:

 - 1) Ensure that for each GPU you can install driver and everything works Ok (with single card in computer)
 - 2) Uninstall all drivers and remove all GPUs
 - 3) Install AMD GPU in computer
 - 4) Launch Ubuntu and install driver for AMD GPU (I used amdgpu-pro 18.20 on Ubuntu 16.04.5 with 4.15.0-32 kernel)
 - 5) Reboot and ensure that everything works
 - 6) Install NVidia driver without installation of NVidia card (for example via ``sudo apt install nvidia-384``)
 - 7) Shutdown computer
 - 8) Install NVidia card and launch Ubuntu. Probably X-server was unable to launch correctly, so switch to console mode (``Ctrl+Alt+F1``) and continue
 - 9) Execute ``sudo nvidia-xconfig`` and edit open newly created ``/etc/X11/xorg.conf``
 - 10) Comment or delete all lines except Monitor, Device and Screen sections (edit under root). Example result:
 
```
Section "Monitor"
    Identifier     "Monitor0"
    VendorName     "Unknown"
    ModelName      "Unknown"
    HorizSync       28.0 - 33.0
    VertRefresh     43.0 - 72.0
    Option         "DPMS"
EndSection

Section "Device"
    Identifier     "Device0"
    Driver         "nvidia"
    VendorName     "NVIDIA Corporation"
EndSection

Section "Screen"
    Identifier     "Screen0"
    Device         "Device0"
    Monitor        "Monitor0"
    DefaultDepth    24
    SubSection     "Display"
        Depth       24
    EndSubSection
EndSection
```

 - 11) Execute ``lspci | egrep -h "VGA|3D controller"``:

```
01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Hawaii XT [Radeon R9 290X] (rev 80)
02:00.0 VGA compatible controller: NVIDIA Corporation GK110 [GeForce GTX TITAN] (rev a1)
```

 - 12) Remember first identifiers and again edit ``/etc/X11/xorg.conf`` under root so that result will be:

```
Section "Monitor"
    ... no changes ...
EndSection

Section "Device"
    Identifier     "Device0"
    Driver         "nvidia"
    VendorName     "NVIDIA Corporation"
    BusId          "PCI:2@0:0:0" # Add this line (identifier 2 taken from lspci output on the previous step)
EndSection

# Add similar section for AMD card:
Section "Device"
    Identifier     "Device1"
    Driver         "amdgpu"
    BusId          "PCI:1@0:0:0" # Identifier 1 taken from lspci output
EndSection

Section "Screen"
    Identifier     "Screen0"
    Device         "Device1"     # This identifier should be from the GPU device connected to display (in my case it was an AMD card) 
    Monitor        "Monitor0"
    DefaultDepth    24
    SubSection     "Display"
        Depth       24
    EndSubSection
EndSection
```

 - 13) Reboot, it works.
  
If it doesn't work - I can try to help you - just make a comment with output of ``lspci | egrep -h "VGA|3D controller"``, your ``/etc/X11/xorg.conf`` and ``/var/log/Xorg.0.log``.

