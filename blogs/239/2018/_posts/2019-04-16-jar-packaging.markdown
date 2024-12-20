---
layout: ru/blogs/239/2018/post
title:  "[Проект] Упаковка в самодостаточный .jar файл"
date:   2019-04-16 0:02:39 +0300
lang:   ru
categories: school239_105_2018_2019
---

Может быть удобно собрать вашу программу в один файл (включающий в себя и скомпилированные исходники, и картинки) который можно скинуть кому-нибудь чтобы он легко запустил вашу программу на почти любом компьютере.

Если у вас творческий проект - настоятельно рекомендуется пройти по этому пути и опубликовать собранный ```.jar```-файл как релиз вашего проекта в репозитории на **GitHub**.

В общем случае в реальном мире это делается относительно сложно с помощью сборочных инструментов вроде **Ant**, **Maven** или **Gradle**. Но нам подойдет и более простой способ - с помощью встроенной в **Intellij IDEA** функциональности.

0) Нужен готовый проект
-----------------------

Для того чтобы было что запаковывать в приложение нужен проект открытый в **Intellij IDEA**, который можно запустить. Т.е. в этом проекте есть ```main``` функция, которая будет являться точкой входа в приложение, т.е. будет запускаться в момент двойного клика по запакованной программе.

Дальше будет предполагаться что класс в котором определена желаемая ```main``` функция называется ```Monoceros```.

1) Настройка упаковки в пакет
-----------------------------

- ```File```->```Project Struture```->```Artifacts```
- Зеленый плюсик сверху-слева -> ```JAR``` -> ```From modules with dependencies...```
- Справа от ```Main Class``` нажав на три точки нужно выбрать класс ```Monoceros```
- Убедиться, что выбран вариант ```extract to the target JAR```
- Нажать ```Ok```
- Еще раз нажать ```Ok```

2) Компиляция пакета
--------------------

Теперь можно собирать пакет приложения:

- ```Build``` -> ```Build Artifacts...```
- Выбираете нужный артефакт, и жмете ```Build```

Теперь в подпапке проекта ```out/artifacts/<ArtifactName>_jar/``` лежит упакованный ```jar``` файл. Его можно запустить на любом компьютере, на котором установлена Java-машина (она же ```JVM```, она же ```JRE```).

3) Запуск jar-пакета
--------------------

Двойного клика должно быть достаточно. Но зависит от операционной системы, так что если не будет работать на вашей - напишите мне.

4) Если у вас в проекте есть картинки
-------------------------------------

1) Создайте папку ```data``` внутри проекта (рядом с папкой ```src```) и перенесите в нее все картинки

2) Замените все пути к картинкам с глобальных на относительные, например с ```C:\\Users\\...\\image.png``` на ```data\\image.png``` (или сразу сделайте **шаг 4**)

3) Нажмите в **IDEA** правой кнопкой на папке ```data``` -> ```Mark Directory as``` -> ```Resources Root```

4) Заменить все пути к картинкам с ```data\\image.png``` на ```image.png``` (т.е. сделать их относительными относительно ```data```-папки которая установлена как корень "ресурсов")

```NB:``` Если у вас есть подпапки в ```data```, например есть файлы до **шага 4** доступные по пути ```data\\images\\unicorn.png``` и ```data\\music\\boom.mp3```, то в рамках четвертого шага их пути надо заменить на ```images/unicorn.png``` и ```music/boom.mp3``` (**обратите внимание что слеши были заменены с ```\\``` на ```/```).

5) Заменить все считывания картинок на открытие не через ```new File(...)```, а через ```MyPanel.class.getResourceAsStream(...)```:

```BufferedImage unicornImage = ImageIO.read(new File("images/unicorn.png"));```

На:

```BufferedImage unicornImage = ImageIO.read(MyPanel.class.getResourceAsStream("images/unicorn.png"));```

Обратите внимание что здесь вместо ```MyPanel``` должен быть тот класс внутри которого вы считываете картинку.

6) Пересобрать ```.jar```-артефакт (см. пункт выше **Компиляция пакета**)

7) Запустить и радоваться, если оно не работает - см. ниже

8) Из любопытства можете заглянуть внутрь ```.jar```-файла, достаточно изменить его расширение на ```.zip```, т.к. на самом деле это просто ```.zip```-архив, и теперь вы можете заглянуть внутрь и убедиться что там есть скомпилированные исходники (```.class``` файлы) и все ресурсы (например картинки)


5) Если несколько main-функций
------------------------------

Есть несколько вариантов что делать, если у вас есть несколько ```main```-функций. По сути это означает что у вас есть несколько программ. Например сервер и клиент. Самый простой вариант - выполнить эту инструкцию два раза для каждого класса, в котором есть ```main```-функция, тогда будет несколько ```jar```-пакетов.

6) Как выложить jar-пакет в репозиторий
-------------------------

1) Открываете [GitHub.com](https://github.com/)

2) Убеждаетесь что вы залогинились и открываете ваш проект

3) Открываете ```0 releases``` (сразу над списком исходных файлов)

4) Жмете ```Create a new release```

5) Укажите версией что-нибудь вроде ```v1.0```, Release title: ```1.0```, Describe the release: ```Финальный релиз перед конференцией```

6) Ниже воспользуйтесь ```Attach binaries by dropping them here or selecting them.``` чтобы приложить собранный ```.jar``` файл последней версии который проверенно работает, хорошая идея так же приложить презентацию

7) Нажмите ```Publish release```

7) Не забудьте добавить ссылку на ваш репозиторий в конце презентации
-------------------------

Например вы можете взять одну из картинок-логотипов **GitHub** [здесь](https://github.com/logos). Затем на последнем слайде добавить эту картинку и рядом - ссылку на репозиторий.

Если вдруг не запускается
-------------------------

Запустите терминал (как это сделать - гуглится по ```windows N how to run command prompt```, где ```N``` - ваша версия ОС). Вероятно почти везде сработает открыть главное меню (пуск или меню-плитка), там запустить программу ```Выполнить```, в ней ввести ```cmd``` и нажать ```Enter```.

В появившемся черном текстовом окне перейдите в папку где находится ```<ArtifactName>.jar```:

Например если файл находится по пути ```C:\A\B\C\<ArtifactName>.jar``` то надо выполнить две команды:

 - ```C:```
 - ```cd A\B\C```

Теперь надо запустить явным образом ```jar```-файл (то же самое происходит при двойном клике):

 - ```java -jar <ArtifactName>.jar```

Скорее-всего как и при двойном клике программа на самом деле запускается но падает на старте, и поэтому создается впечатление что она не запустилась, хотя на самом деле она просто быстро упала.

Преимущество явного запуска из консоли в том, что ошибки приложения будут видны в консоли (аналогично тому, как они были видны в консоли среды разработки).

