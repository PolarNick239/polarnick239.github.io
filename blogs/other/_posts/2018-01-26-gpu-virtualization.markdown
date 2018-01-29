---
layout: blogs/other/post
title:  "GPU virtualization in KVM without external monitor"
date:   2018-01-26 21:30:00 +0300
categories: gpu kvm virtualization
lang:   en
id:     11_ambient_occlusion_xnormal
---

## References:

- [http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/](http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/)
- [https://davidyat.es/2016/09/08/gpu-passthrough/#part-2-setting-up-the-vm](https://davidyat.es/2016/09/08/gpu-passthrough/#part-2-setting-up-the-vm)
- [https://bufferoverflow.io/gpu-passthrough/](https://bufferoverflow.io/gpu-passthrough/)
- [https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/](https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/)

## Notes:

1) IOMMU support in CPU and motherboard required (IOMMU should be enabled in BIOS).

2) GPU PCI passthrough can be done only with all devices from the same IOMMU group. ([more info](https://vfio.blogspot.ru/2014/08/iommu-groups-inside-and-out.html))

3) Passed through GPU must be used exclusively (it is impossible to use the same GPU from host and from guest, as well as it can't be used from multiple guests).
   So host-system should ignore passed through GPU (see [here](http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/) about "vfio-pci" and "Isolation of the guest GPU").

4) External GPU connected to passed through GPU needed. Most monitors can be easily switched from one connected input cable to another, so this is not a big problem. You can also read about this [here in comments](https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/) by keyword "monitor".
   But it is possible to have full OpenGL support with remote access via VNC ```without connecting external monitor``` - you can configure guest system with VirtualGL with [these scripts](https://github.com/agisoft-llc/cloud-scripts/)
   (over TurboVNC you can run [noVNC](https://github.com/novnc/noVNC) server, which makes possible to connect from any computer with browser).

## Notes about NVidia Geforce and Titan:

5) Geforce driver doesn't work if it detects virtualization. It checks hypervisor signature in CPUID. So ```kvm_hidden=on``` option required in case of KVM
   (see [devtalk](https://devtalk.nvidia.com/default/topic/957757/cuda-setup-and-installation/gtx-1080-amp-kvm-pci-passthrough-to-guest/post/5092622/#5092622),
        [askubuntu](https://askubuntu.com/questions/939351/virt-install-with-kvm-off-option/939632#939632),
        [detecting virtualization](http://linuxmogeb.blogspot.ru/2013/06/detecting-virtualization.html)).

6) It is not allowed to use Geforce and Titan driver in datacenter (w.r.t. [its EULA](http://www.nvidia.com/content/DriverDownload-March2009/licence.php?lang=us&type=GeForce)):

```
No Datacenter Deployment. The SOFTWARE is not licensed for datacenter deployment, except that blockchain processing in a datacenter is permitted.
```

What is a **datacenter** in NVidia opinion - still is unknown.
