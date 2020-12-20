---
layout: ru/blogs/239/2020/post
title:  "[Java] Бегущий дровосек: плавное движение при зажатой кнопке, анимация бега"
date:   2020-12-22 0:02:39 +0300
lang:   ru
categories: school239_105_2020_2021
---

Давайте сделаем простой прототип в котором:

1) Зажимая стрелки можно гладко перемещать персонажа влево-вправо

2) Перемещение сопровождается анимацией

Картинка персонажа и анимация скачаны с сайта [craftpix.net](https://craftpix.net/freebies/free-3-character-sprite-sheets-pixel-art/) (нужно зарегистрироваться, например через google аккаунт). Этот сайт нашел по запросу в гугле "game animation sprite", затем среди картинок из поисковой выдачи (вместо обычного поиска страниц) нашел подходящую картинку и перешел на сайт. 

Звук бега скачан с [freesound.org](https://freesound.org/people/Fabrizio84/sounds/460919/) (сайт нашел по запросу в гугле "game sounds running").

1) Рисуем персонажа с простым управлением
===============

Картинка персонажа:

![Woodcutter](/static/2020/12/Woodcutter.png)

Создали стандартную заготовку - в main-функции создаем окно в которое добавляем нашу панель:

```java
public static void main(String[] args) throws InterruptedException, IOException {
    MyPanel panel = new MyPanel();

    JFrame frame = new JFrame();
    frame.setSize(640, 480);
    frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
    frame.add(panel);
    frame.setVisible(true);

    while (true) {
        frame.repaint();
        panel.updateWorldPhysics(); // вызываем чтобы обновить состояние физики мира (движение персонажа)
        Thread.sleep(20);
    }
}
```

В самой панели ```MyPanel```:

 - Создаем персонажа (храним в поле ```Man man```)
 
 - Рисуем персонажа (на базе [статьи](/blogs/239/2020/school239_105_2020_2021/2020/11/10/images-and-mouse.html))

 - Обрабатываем клавиатуру (на базе [статьи](/blogs/239/2020/school239_105_2020_2021/2020/11/23/image-rotate-and-keyboard.html)) - когда нажимается кнопка влево/вправо переводит персонажа в состояние "бежишь налево/направо", а когда кнопка отпускается - вывести персонажа из этого состояния (прекратить перемещение)

 - ```updateWorldPhysics()``` - обновляет положение персонажа пропорционально тому сколько прошло времени с предыдущего обновления физики мира(в случае если он бежит)

```java
public class MyPanel extends JPanel implements KeyEventDispatcher {

    private Man man;
    private long previousWorldUpdateTime; // Храним здесь момент времени когда физика мира обновлялась в последний раз

    public MyPanel() throws IOException {
        this.man = new Man(200);
        this.previousWorldUpdateTime = System.currentTimeMillis();

        KeyboardFocusManager manager = KeyboardFocusManager.getCurrentKeyboardFocusManager();
        manager.addKeyEventDispatcher(this);
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        man.draw(g, this.getWidth(), this.getHeight());
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent e) {
        if (e.getID() == KeyEvent.KEY_PRESSED) { // Если кнопка была нажата (т.е. сейчас она зажата)
            if (e.getKeyCode() == KeyEvent.VK_LEFT) {
                man.startRunningLeft();
            } else if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
                man.startRunningRight();
            }
        }

        if (e.getID() == KeyEvent.KEY_RELEASED) {     // Если кнопка была отпущена - мы должны прекратить бег
            if (e.getKeyCode() == KeyEvent.VK_LEFT) { // но только бег в ту сторону, которой соответствует отпущенная кнопка
                man.stopRunningLeft();
            } else if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
                man.stopRunningRight();
            }
        }

        return false;
    }

    void updateWorldPhysics() {
        long currentTime = System.currentTimeMillis();
        long dt = currentTime - previousWorldUpdateTime; // нашли сколько миллисекунд прошло с предыдущего обновления физики мира

        man.update(dt);

        previousWorldUpdateTime = currentTime;
    }
}
```

Наконец класс описывающий игрового персонажа.

От него мы ожидаем что он:

 - Умеет себя рисовать (внизу панели)
 
 - Помнит бежит ли он сейчас в одну из сторон (т.е. кнопка зажата и при обновлении физики мира - надо двигаться в правильном направлении)
 
 - В методе ```update``` с учетом ```dt``` (сколько времени прошло) обновляет свою координату если он бежит, иначе - стоит на месте

```java
public class Man {

    private BufferedImage woodcutterImage;

    private double x;
    private double xRunningSpeed;
    private int running; // -1=НАЛЕВО БЕЖИМ, 0=СТОИМ НА МЕСТЕ, +1=НАПРАВО БЕЖИМ

    public Man(double x) throws IOException {
        woodcutterImage = ImageIO.read(new File("...\\Woodcutter.png"));

        this.x = x;
        this.xRunningSpeed = 0.2; // Скорость в пикселях/миллисекунду
        this.running = 0;         // Изначально мы стоим на месте
    }

    public void draw(Graphics g, int panelWidth, int panelHeight) {
        int imageX = (int) x;
        int imageY = panelHeight - woodcutterImage.getHeight();
        g.drawImage(woodcutterImage, imageX, imageY, null);
    }

    public void startRunningLeft() {
        running = -1;
    }
    public void startRunningRight() {
        running = 1;
    }

    public void stopRunningLeft() {
        if (running == -1) {
            running = 0;
        }
    }
    public void stopRunningRight() {
        if (running == 1) {
            running = 0;
        }
    }

    public void update(long dt) {
        if (running == -1) {
            x -= dt * xRunningSpeed;
        } else if (running == 1) {
            x += dt * xRunningSpeed;
        }
        // Или, что то же самое, можно сделать так:
        // x += dt * xRunningSpeed * running;
    }
}
```

2) Перемещение сопровождается анимацией
===============

Анимация бега хранится в одной картинке (или можно хранить в нескольких - по картинке на отдельный кадр):

![Woodcutter run](/static/2020/12/Woodcutter_run.png)

Это означает что нашему персонажу надо хранить не только свою картинку "стою на месте", но и набор этих кадров соответствующих бегу.

Давайте поймем что нам нужно будет еще и хранить то какой кадр мы отрисовываем сейчас и написать логику которая понимает что прошло уже достаточно времени и пора перейти к отрисовке следующего кадра.

Все это достаточно сложная логика, и было бы удобно завести отдельный класс для этого - класс анимация:

```java
public class Animation {

    private BufferedImage[] frames;
    private int frameWidth;
    private int frameHeight;

    private long timePerFrame;
    private long playingTime;

    public Animation(String path, int numberOfFrames, long timePerFrame) throws IOException {
        BufferedImage allFrames = ImageIO.read(new File(path));
        int allFramesWidth = allFrames.getWidth();
        if (allFramesWidth % numberOfFrames != 0) {
            throw new RuntimeException("Ширина картинки хранящей анимации=" + allFramesWidth + ", но он должен быть кратен числу кадров " + numberOfFrames + "!");
        }

        this.frameWidth = allFramesWidth / numberOfFrames;
        this.frameHeight = allFrames.getHeight();

        // Нам надо нарезать картинку на кадры, как это делать можно найти в гугле по запросу "java swing bufferedimage crop"
        // https://stackoverflow.com/a/4818980
        frames = new BufferedImage[numberOfFrames];
        for (int i = 0; i < numberOfFrames; ++i) {
            frames[i] = allFrames.getSubimage(i * frameWidth, 0, frameWidth, frameHeight);
        }

        System.out.println("Анимация загружена (разрешение кадра: " + frameWidth + "x" + frameHeight + ", " + numberOfFrames + " кадров, путь: " + path + ")");

        this.timePerFrame = timePerFrame;
        this.playingTime = 0;
    }

    public int getFrameWidth() {
        return frameWidth;
    }
    public int getFrameHeight() {
        return frameHeight;
    }

    public void restart() {
        // Если персонаж начал бежать - мы хотим откатиться к первому кадру, т.е. откатить время проигрывания до нуля
        playingTime = 0;
    }

    public void update(long dt) {
        long totalAnimationTime = timePerFrame * frames.length;
        playingTime = (playingTime + dt) % totalAnimationTime; // взятие по модулю, т.к. анимация зациклена
    }

    public void draw(Graphics g, int x, int y) {
        int i = (int) (playingTime / timePerFrame); // вычисляем какой кадр сейчас актуален
        BufferedImage currentFrame = frames[i];
        g.drawImage(currentFrame, x, y, null);
    }

}
```

И теперь нам надо в дровосеке обновить код чтобы воспользоваться этой анимацией:

```java
public class Man {
    // ...

    private Animation animationRun;

    public Man(double x) throws IOException {
        woodcutterImage = ImageIO.read(new File("C:\\Users\\PolarNick\\IdeaProjects\\AnimationTest\\src\\Woodcutter.png"));
        animationRun = new Animation("C:\\Users\\PolarNick\\IdeaProjects\\AnimationTest\\src\\Woodcutter_run.png", 6, 60);

        // ...
    }

    public void draw(Graphics g, int panelWidth, int panelHeight) {
        int imageX = (int) x;
        int imageY = panelHeight - woodcutterImage.getHeight();
        if (running == 0) { // если мы не бежим - рисуем старую картинку стоящего дровосека
            g.drawImage(woodcutterImage, imageX, imageY, null);
        } else {            // иначе - рисуем анимацию бега
            animationRun.draw(g, imageX, imageY);
        }
    }

    // ...
    
   public void update(long dt) {
        x += dt * xRunningSpeed * running;

        animationRun.update(dt); // не забываем обновлять анимацию с учетом течения времени
    }

}
```

Бег направо работает замечательно! Но как сделать бег влево?

Можно было бы создать зеркальную вторую картинку, и второй объект ```Animation```. Но можно ведь програмно отзеркалить картинку прямо перед отрисовкой в случае если бег в другую сторону.

Вбиваем в гугл что-нибудь вроде "java bufferedimage how to mirror". Находим [https://stackoverflow.com/a/35123358](https://stackoverflow.com/a/35123358)

Делаем так чтобы при отрисовке анимации можно было попросить ее отзеркалиться:

```java
    public void draw(Graphics g, int x, int y, boolean mirrored) {
        int i = (int) (playingTime / timePerFrame); // вычисляем какой кадр сейчас актуален
        BufferedImage currentFrame = frames[i];
        if (!mirrored) {
            g.drawImage(currentFrame, x, y, frameWidth, frameHeight, null);
        } else {
            g.drawImage(currentFrame, x, y, -frameWidth, frameHeight, null);
        }
    }
```

И в человечке при отрисовке анимации смотрим куда мы бежим:

```java
    public void draw(Graphics g, int panelWidth, int panelHeight) {
        int imageX = (int) x;
        int imageY = panelHeight - woodcutterImage.getHeight();
        if (running == 0) {
            g.drawImage(woodcutterImage, imageX, imageY, null);
        } else {
            boolean isMirrored = (running == -1);
            animationRun.draw(g, imageX, imageY, isMirrored);
        }
    }
```

Протестируйте. Заметно что теперь персонаж как будто сдвигается когда начинает бежать влево. Это оттого что мы воспользовались трюком с "отрицательной шириной картинки". Надо его компенсировать и при отрисовке рисовать не по координате ```x```, а по координате ```x+frameWidth```: ```g.drawImage(currentFrame, x+frameWidth, y, -frameWidth, frameHeight, null);```. 
