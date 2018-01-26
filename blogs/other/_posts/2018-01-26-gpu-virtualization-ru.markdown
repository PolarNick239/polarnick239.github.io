---
layout: ru/blogs/other/post
title:  "GPU виртуализация в KVM без внешнего монитора"
date:   2018-01-26 21:30:00 +0300
categories: gpu kvm virtualization
lang:   ru
id:     11_ambient_occlusion_xnormal
---

## Ссылки:

- [http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/](http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/)
- [https://davidyat.es/2016/09/08/gpu-passthrough/#part-2-setting-up-the-vm](https://davidyat.es/2016/09/08/gpu-passthrough/#part-2-setting-up-the-vm)
- [https://bufferoverflow.io/gpu-passthrough/](https://bufferoverflow.io/gpu-passthrough/)
- [https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/](https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/)

## Заметки:

1) Требуется поддержка IOMMU процессором и материнской платой (IOMMU должна быть включена в BIOS).

2) PCI GPU прокидывается только вместе со всеми устройствами той же IOMMU-группы. ([подробнее](https://vfio.blogspot.ru/2014/08/iommu-groups-inside-and-out.html))

3) Прокинутая GPU должна использоваться эксклюзивно (нельзя использовать одну GPU и в host, и в guest, как и нельзя использовать в нескольких guest).
   Поэтому host-система обязана игнорировать прокидываемые GPU (см. [тут](http://mathiashueber.com/amd-ryzen-based-passthrough-setup-between-xubuntu-16-04-and-windows-10/) про "vfio-pci" и "Isolation of the guest GPU").

4) Нужен дисплей подключенный к GPU напрямую. Большинство мониторов умеют переключаться между несколькими кабелями, т.ч. это небольшая проблема. Об этом так же пишут [тут в комментариях](https://www.pugetsystems.com/labs/articles/Multiheaded-NVIDIA-Gaming-using-Ubuntu-14-04-KVM-585/) по ключевому слову "monitor".
   Кроме того возможна поддержка полноценного OpenGL с удаленным доступом по VNC и ```без подключения внешнего дисплея``` - можно сконфигурировать гостевую систему с VirtualGL [этими скриптами](https://github.com/agisoft-llc/cloud-scripts/)
   (поверх TurboVNC можно поднять [noVNC](https://github.com/novnc/noVNC) сервер, и подключаться с любого компьютера через браузер).

## Заметки про NVidia Geforce и Titan:

5) Драйвер Geforce откажется работать если заметит виртуализацию. Он проверяет сигнатуру гипервизора в CPUID. Поэтому в случае KVM нужно выставить ```kvm_hidden=on```
   (см. [devtalk](https://devtalk.nvidia.com/default/topic/957757/cuda-setup-and-installation/gtx-1080-amp-kvm-pci-passthrough-to-guest/post/5092622/#5092622),
        [askubuntu](https://askubuntu.com/questions/939351/virt-install-with-kvm-off-option/939632#939632),
        [detecting virtualization](http://linuxmogeb.blogspot.ru/2013/06/detecting-virtualization.html)).

6) В датацентрах нельзя использовать драйвера для Geforce и Titan (в соответствии с [EULA](http://www.nvidia.com/content/DriverDownload-March2009/licence.php?lang=us&type=GeForce) драйвера):

```
No Datacenter Deployment. The SOFTWARE is not licensed for datacenter deployment, except that blockchain processing in a datacenter is permitted.
```

Четкого термина что такое по мнению NVidia **датацентр** пока нет.
