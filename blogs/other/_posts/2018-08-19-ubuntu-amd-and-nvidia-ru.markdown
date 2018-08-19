---
layout: ru/blogs/other/post
title:  "Совместная установка AMD и NVidia видеокарт на Ubuntu"
date:   2018-08-19 21:30:00 +0300
lang:   ru
id:     20_ubuntu_amd_and_nvidia
---

Чтобы использовать одновременно и AMD видеокарту, и NVidia видеокарту под Ubuntu нужно аккуратно поставить драйверы и настроить X-сервер.

В моем случае хотелось использовать AMD для вывода информации на дисплей, для OpenGL и OpenCL, а NVidia видеокарту использовать для CUDA и OpenCL.

Существует [инструкция](https://askubuntu.com/a/892533), но для меня это не сработало, зато сработал более явный путь:

 - 1) Убедиться что для каждой видеокарты по отдельности драйвер устанавливается и все работает
 - 2) Удалить все драйвера и физически вытащить все видеокарты
 - 3) Поставить AMD видеокарту
 - 4) Запустить Ubuntu и установить драйвер для AMD (я использовал amdgpu-pro 18.20 на Ubuntu 16.04.5 c 4.15.0-32 кернелом)
 - 5) Перезапустить, убедиться что все работает
 - 6) Не вставляя NVidia карту установить NVidia драйвер (например ``sudo apt install nvidia-384``)
 - 7) Выключить компьютер
 - 8) Вставить NVidia карту и запустить компьютер. Вероятно X-сервер не сможет корректно запуститься, поэтому перейдя в консольный режим (``Ctrl+Alt+F1``) продолжаем
 - 9) Выполнить ``sudo nvidia-xconfig`` и открыть только что созданный ``/etc/X11/xorg.conf``
 - 10) Закомментировать или удалить все строки кроме секций Monitor, Device и Screen, получив что-то подобное:
 
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

 - 11) Выполнить ``lspci | egrep -h "VGA|3D controller"``:

```
01:00.0 VGA compatible controller: Advanced Micro Devices, Inc. [AMD/ATI] Hawaii XT [Radeon R9 290X] (rev 80)
02:00.0 VGA compatible controller: NVIDIA Corporation GK110 [GeForce GTX TITAN] (rev a1)
```

 - 12) Запомнив из этого вывода первые идентификаторы опять редактируем ``/etc/X11/xorg.conf`` так чтобы получилось:

```
Section "Monitor"
    ... ничего не меняем, оставляем то что и было ...
EndSection

Section "Device"
    Identifier     "Device0"
    Driver         "nvidia"
    VendorName     "NVIDIA Corporation"
    BusId          "PCI:2@0:0:0" # Добавляем эту строку (число 2 взято из вывода lspci на прошлом шаге)
EndSection

# Добавляем аналогичную секцию для AMD:
Section "Device"
    Identifier     "Device1"
    Driver         "amdgpu"
    BusId          "PCI:1@0:0:0" # Число 1 аналогично взято из вывода lspci
EndSection

Section "Screen"
    Identifier     "Screen0"
    Device         "Device1"     # Здесь должен быть идентификатор той видеокарты, к которой подключен дисплей (в моем случае это AMD) 
    Monitor        "Monitor0"
    DefaultDepth    24
    SubSection     "Display"
        Depth       24
    EndSubSection
EndSection
```

 - 13) Перезапускаем, все работает.
  
Если не работает - могу попробовать помочь - напишите комментарий с выводом ``lspci | egrep -h "VGA|3D controller"``, что получилось в ``/etc/X11/xorg.conf`` и ``/var/log/Xorg.0.log``.

