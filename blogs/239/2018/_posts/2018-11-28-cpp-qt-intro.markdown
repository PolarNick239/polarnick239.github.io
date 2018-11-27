---
layout: ru/blogs/239/2018/post
title:  "[C++] Введение в GUI - Qt5"
date:   2018-11-28 0:02:39 +0300
lang:   ru
categories: school239_105_2018_2019
---

Установить окружение:
=========================================
```sudo apt install cmake qtbase5-dev```

Создать папку для проекта и базовые исходники:
===========================================

```
mkdir qthelloworld
cd qthelloworld
gedit CMakeLists.txt
gedit main.cpp
mkdir build
cd build
cmake ..
make -j4
./qthelloworld
```

В файл CMakeLists.txt нужно скопировать и сохранить:

```
cmake_minimum_required(VERSION 2.8.11)

project(QtHelloWorld)

# Find the QtWidgets library
find_package(Qt5Widgets)

# Tell CMake to create the executable
add_executable(qthelloworld main.cpp)

# Use the Widgets module from Qt 5.
target_link_libraries(qthelloworld Qt5::Widgets)
```

В файл main.cpp нужно скопировать и сохранить:

```cpp
#include <QtWidgets>

class Widget : public QWidget
{
protected:
    void paintEvent(QPaintEvent *event) override
    {
        QPainter painter(this);
        painter.setPen(QPen(Qt::black, 1, Qt::SolidLine));
        painter.drawLine(0, 0, this->size().width(), this->size().height());
    }
};

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);

    Widget w;
    w.show();

    return app.exec();
}
```

Документация
===========================================

В случае Ubuntu 16.04 LTS версия Qt - 5.5.1.

Проверить версию можно либо выполнив ```dpkg -l | grep qt5-qmake``` (и посмотреть справа),
либо выполнить ```dpkg -L qt5-qmake | grep bin/qmake``` и выполнить получившийся в консоле результат с флажком -v: ```/usr/lib/x86_64-linux-gnu/qt5/bin/qmake -v``` и посмотреть какая **Qt version** будет выведена.

К сожалению на сайте Qt документации по такой версии уже нет, но есть про [Qt 5.6](http://doc.qt.io/qt-5.6/qpainter.html), будем надеяться что разница невелика :)
