---
layout: 239post
title:  "Задание 1. Андроиды и электроовцы с клеточными автоматами"
date:   2016-12-06 02:39:00 +0300
categories: 239 lesson school android java
---

Настройка окружения, Android Studio:
====================================
1. скачать Android Studio: <a href="https://developer.android.com/studio/index.html">https://developer.android.com/studio/index.html</a>
2. установить, оставив все по дефолту (галочки стоят на всех трех пакетах)
3. Запустить Android Studio
4. "I do not have a previous version ..." -> Ok
5. "Standard" -> Next
6. галку на Android Virtual Device (если хочется эмулятор) -> Next
7. Finish, ждать пока грузится 600 Мб

Git:
====
1. скачать git клиент <a href="https://git-for-windows.github.io/">https://git-for-windows.github.io/</a>
1. установить его (всё оставлять по умолчанию)
1. запустить Android Studio
1. открыть настройки Android Studio (либо Configure->Settings если вы видите маленькое окно, либо File->Settings если вы видите запущенную Android Studio)
1. в настройках Android Studio: Version Control -> Git
1. Path to Git executable: указать git.exe файл, который установлен примерно по такому пути: C:\Program Files\Git\bin\git.exe
1. Нажать справа кнопку "Test", должно показаться окно с версией git
1. Закрываем настройки, нажав Ok

Задание "Клеточный автомат:
===========================
1. Запустить Android Studio
1. Check out project from Version Control->Git (НЕ github)
1. Git repository URL: <a href="https://github.com/PolarNick239/AndroidBenchmarks">https://github.com/PolarNick239/AndroidBenchmarks</a>
1. Если пишет красным "The parent path C:\...\StudioProjects must exist" - создайте такую папку, либо укажите другую Parent Directory
1. нажать Clone
1. would you like to create a Studio project for the sources you have been checked ...? -> нажать Yes
1. create project from existing sources -> Next -> и еще раз Next -> и еще раз Next -> и еще один терпеливый раз Next -> ну и чего уж там еще один Next -> вообщем Next до упора
1. закрываем окошко Tip of the day -> Close

Уровни сложности:
=================
1. Easy (если обычно вас напрягает информатика, или сделать Medium вы не успеваете)
1. Medium (вариант по умолчанию, на другой уровень сложности в любой момент можно переключится, скопировав то что уже написали)
1. Nightmare (на самом деле это Medium, но еще одна сложная технически задачка добавлена, поэтому когда будет сделан Medium - можно попробовать Nightmare, скопировав уже сделанную часть

Настройка проекта:
==================
1. Снизу слева нажать на "Unregistered VCS root detected" -> нажать синюю надпись Add Root
1. справа снизу нажать на "Git: master" -> origin/easy -> checkout as new loca branch -> Ok
1. Снизу нажав на TODO можно увидеть перечень заданий

Android NDK:
============
1. Скачать Android NDK:
1. либо Project Structure->SDK Location-> снизу нажать на "Download" Android NDK
1. либо руками скачать отсюда <a href="https://developer.android.com/ndk/downloads/index.html">https://developer.android.com/ndk/downloads/index.html</a> а затем в  Project Structure->SDK Location-> снизу указать путь на этот распакованный архив

Чтобы запускать:
================
1. Run->Edit configurations
1. Зеленый плюс->Android App
1. Module: выбрать main (единственный вариант)
1. Target: Emulator (тут можно указать USB, если захочется проверить на своем телефоне)
1. Prefer Android Virtual Device: выбрать "Nexus 5x ..." (единственный вариант)
1. Ok
1. теперь можно запускать сверху зеленым треугольником (как кнопка Play в плеерах)
