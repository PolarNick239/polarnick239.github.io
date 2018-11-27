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
mkdir QtHelloWorld
cd QtHelloWorld
touch CMakeLists.txt
touch main.cpp
```

В пустой файл CMakeLists.txt нужно скопировать:

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

В пустой файл main.cpp нужно скопировать:

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
