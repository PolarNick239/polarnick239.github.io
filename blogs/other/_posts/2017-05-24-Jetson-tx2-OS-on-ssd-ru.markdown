---
layout: ru/blogs/other/post
title:  "Jetson TX2: Прошивка, установка CUDA + установка L4D OS на внешний SSD"
date:   2017-05-24 21:30:00 +0300
categories: gpu embedded nvidia cuda
lang:   ru
id:     5_jetson_installation
---

Прошивка и установка CUDA через JetPack
---------------------------------------

[JetPack](https://developer.nvidia.com/embedded/jetpack) нужен для прошивки Jetson свежей версией L4D OS (Linux for Jetson, модифицированная Ubuntu 16.04), установки CUDA и некоторых других пакетов.
JetPack можно запустить только на host-компьютере с Linux (официально поддерживается Ubuntu 14.04, но работает и на 16.04) - но можно запустить внутри виртуальной машины, прокинув USB-устройство ```NVIDIA Corp.``` - подключенную Jetson Dev Kit плату.
 
Подключив плату по USB к host-компьютеру и переведя ее в recovery mode - можно начать прошивку и установку CUDA.

На этапе выбора пакетов я оставил только установку OS, CUDA и компиляцию примеров:

![JetPack](/static/2017/05/24/jetpack.png)

Выбор Network Layout - проще работать с "Device accesses internet via router/switch.":

![JetPack](/static/2017/05/24/jetpack_network_layout.png)

Желательно не удалять файлы которые JetPack скачал и сохранил на диске. Все остальное довольно очевидно.

Один раз у меня прошивка упала с невразумительной ошибкой - мне помогло очистить всю папку в которой работает JetPack и попробовать заново.

Установка системы на SSD или SD вместо встроенной памяти
--------------------------------------------------------

Встроенная карта памяти всего 32 Гб, поэтому я установил операционную систему на SSD. В JetPack для этого ничего не предусмотрено, поэтому делал руками:

Host: Установка файловой системы OS на SSD
==========================================

Вставив SSD в host-компьютер потребуется отформатировать ext4 раздел и установить на него L4D OS.

Ниже предполагается что изначально Jetson был прошит через JetPack, запущенный в папке ```<jetpack_dir>```, и поэтому предполагается что в папке ```<jetpack_dir>/jetpack_download``` уже лежат файлы (версии в названиях могут не совпадать, так же эти файлы вроде можно скачать [с сайта NVidia](https://developer.nvidia.com/embedded/downloads))::
  
  - ```Tegra_Linux_Sample-Root-Filesystem_R28.0.0_aarch64.tbz2```
  - ```Tegra186_Linux_R28.0.0_aarch64.tbz2```
  - ```cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb```

Установка L4D OS на ```/dev/sdb1``` раздел:

```bash
cd <jetpack_dir>
mkdir ssd_for_jetson
# Примонтируем чистый ext4 раздел
sudo mount /dev/sdb1 ssd_for_jetson/

cd jetpack_download
# Распакуем утилиты ранее скачанные через JetPack (в процессе прошивки описанном выше)
tar jxpf Tegra186_Linux_R28.0.0_aarch64.tbz2
# Распакует в папку rootfs файловую систему (sudo обязателен, иначе apply_binaries будет ругаться)
cd Linux_for_Tegra/rootfs
rm README.txt
sudo tar jxpf ../../Tegra_Linux_Sample-Root-Filesystem_R28.0.0_aarch64.tbz2
# Установим бинарники в распакованную систему (sudo обязателен)
cd ..
sudo ./apply_binaries.sh
# Файловая система готова, скопируем ее на примонтированный чистый раздел
cd ../..
sudo cp -a jetpack_download/Linux_for_Tegra/rootfs/* ssd_for_jetson/ && sync
# Подложим deb-пакет для установки CUDA на Jetson
sudo cp jetpack_download/cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb ssd_for_jetson/home/nvidia/
sudo umount ssd_for_jetson
```

Jetson: Указание запуска с SSD
==============================

После прошивки Jetson через JetPack (которая была описана в начале статьи) и подготовки SSD - нужно вставить SSD в Jetson и запустить его чтобы указать точкой запуска SSD вместо встроенной памяти:

```bash
# Проверить путь к нужному разделу (в моем случае это был /dev/sda1)
sudo fdisk -l
# Теперь нужно настроить путь к файловой системе
sudo gedit /boot/extlinux/extlinux.conf
# Заменить root=/dev/mmcblk0p1 на root=/dev/sda1 (или другой путь к разделу, на который была распакована файловая система OS)
# Сохранить отредактированный extlinux.conf
# Перезапустить Jetson
```

Если что-то пошло не так и система не запустилась с SSD, то всегда можно заново начисто прошить Jetson как описано в начале статьи.

Jetson: Установка CUDA
======================

При копировании файловой системы на раздел SSD еще стоило скопировать ```cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb``` (как описано выше), тогда чтобы установить CUDA на Jetson достаточно: 

```bash
sudo dpkg -i ~/cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb
sudo apt update
sudo apt install cuda-toolkit-8-0
# Проверка установки
/usr/local/cuda/bin/nvcc --version
```
