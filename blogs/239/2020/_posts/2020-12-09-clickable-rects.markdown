---
layout: ru/blogs/239/2020/post
title:  "[Проект] Как сделатель кликабельный объект"
date:   2020-12-09 0:02:39 +0300
lang:   ru
categories: school239_105_2020_2021
---

Пример куска кода с урока (это набросок иллюстрирующий идею, не копируйте его, в нем могут быть баги, лучше перепишите на свой манер):

```java
public interface ClickListener {

    public void handleClick();

}
```

```java
public class ClickableObject {

    public int x0;
    public int y0;
    public int width;
    public int height;
    public BufferedImage image;
    public ClickListener clickListener;

    public ClickableObject(int x0, int y0, int width, int height, BufferedImage image, ClickListener listener) {
        this.x0 = x0;
        this.y0 = y0;
        this.width = width;
        this.height = height;
        this.image = image;
        this.clickListener = listener;
    }

    public void draw(Graphics g) {
//        g.drawRect(x0, y0, width, height);
        g.drawImage(image, x0, y0, width, height, null);
    }

    public boolean checkClick(MouseEvent e) {
        // return true  - is click on us
        // return false - if not
        int x = e.getX();
        int y = e.getY();
        if (x < x0 || x > x0 + width) {
            return false;
        }
        if (y < y0 || y > y0 + height) {
            return false;
        }

        this.clickListener.handleClick();

        return true;
    }
}
```

