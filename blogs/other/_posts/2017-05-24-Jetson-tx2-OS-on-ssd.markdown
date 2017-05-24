---
layout: blogs/other/post
title:  "Jetson TX2: Flash, CUDA installation + installation L4D OS on external SSD"
date:   2017-05-24 21:30:00 +0300
categories: gpu embedded nvidia cuda
lang:   en
id:     5_jetson_installation
---

Flash and CUDA installation via JetPack
---------------------------------------

[JetPack](https://developer.nvidia.com/embedded/jetpack) provides possibility to flash Jetson with fresh L4D OS (Linux for Jetson, modification of Ubuntu 16.04), to install CUDA and some other packages.
JetPack can be used only on host-computer under Linux (Ubuntu 14.04 is officially supported, but works on 16.04 too) - but it can be used in VM - just don't forget to passthrough USB-device ```NVIDIA Corp.``` - connected Jetson Dev Kit.
 
After connecting Dev Kit in recovery mode to host-computer - you can flash OS and install CUDA.

At stage of packages choosing I left only OS installation, CUDA and examples:

![JetPack](/static/2017/05/24/jetpack.png)

Network Layout - the easiest one is "Device accesses internet via router/switch.":

![JetPack](/static/2017/05/24/jetpack_network_layout.png)

It is useful not to delete files that JetPack downloaded and saved on the drive.

Once I had OS installation failed - but another try succeeded after complete cleaning of JetPack folder.

L4D OS installation on SSD or SD instead of embedded memory
-----------------------------------------------------------

Embedded card has 32 Gb only, so I installed OS on SSD. JetPack has no support for this, but it is quite easy to do on your own:

Host: OS filesystem installation on SSD
=======================================

After inserting SSD to host-computer you should format ext4 partition and install L4D OS on it.

It is assumed that firstly Jetson was successfully configured via JetPack launched in directory ```<jetpack_dir>```, and so directory ```<jetpack_dir>/jetpack_download``` already contains these files (versions can mismatch, also it seems that these files can be downloaded [from NVidia site](https://developer.nvidia.com/embedded/downloads)):
  
  - ```Tegra_Linux_Sample-Root-Filesystem_R28.0.0_aarch64.tbz2```
  - ```Tegra186_Linux_R28.0.0_aarch64.tbz2```
  - ```cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb```

L4D OS installation on ```/dev/sdb1``` partition:

```bash
cd <jetpack_dir>
mkdir ssd_for_jetson
# Mounting of clean ext4 partition
sudo mount /dev/sdb1 ssd_for_jetson/

cd jetpack_download
# Unpacking of utilities downloaded previously via JetPack (in process described in the article begining)
tar jxpf Tegra186_Linux_R28.0.0_aarch64.tbz2
# Unpacking OS filesystem to rootfs-directory (sudo required, without it apply_binaries will fail)
cd Linux_for_Tegra/rootfs
rm README.txt
sudo tar jxpf ../../Tegra_Linux_Sample-Root-Filesystem_R28.0.0_aarch64.tbz2
# Installing binaries to OS filesystem (sudo required)
cd ..
sudo ./apply_binaries.sh
# OS filesystem ready, copying it to mounted clean partition
cd ../..
sudo cp -a jetpack_download/Linux_for_Tegra/rootfs/* ssd_for_jetson/ && sync
# Copying deb-package for CUDA installation on Jetson
sudo cp jetpack_download/cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb ssd_for_jetson/home/nvidia/
sudo umount ssd_for_jetson
```

Jetson: Configuring SSD as filesystem for startup
=================================================

After configuring Jetson via JetPack (it was described in the beginning of article) and SSD preparing, you should insert SSD in Jetson and launch it to configure SSD as filesystem for launching (instead of embedded memory):

```bash
# Checking path to prepared partition (in my case it was /dev/sda1)
sudo fdisk -l
# Configuring path to OS filesystem
sudo gedit /boot/extlinux/extlinux.conf
# You should replace root=/dev/mmcblk0p1 with root=/dev/sda1 (or another path to prepared partition with OS filesystem)
# Save edited extlinux.conf
# Restart Jetson
```

If something gone wrong and system failed to launch from SSD - you always can reconfigure Jetson from scratch as described in the begining of article.

Jetson: CUDA installation
=========================

In process of OS filesystem copying to SSD partition - you was able to copy ```cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb``` (as described above), and then you can install CUDA on Jetson:  

```bash
sudo dpkg -i ~/cuda-repo-l4t-8-0-local_8.0.82-1_arm64.deb
sudo apt update
sudo apt install cuda-toolkit-8-0
# Installation check
/usr/local/cuda/bin/nvcc --version
```
