---
layout: ru/blogs/239/2022/post
title:  "[Java] Проигрывание звуков (.wav)"
date:   2023-01-14 0:02:39 +0300
lang:   ru
categories: school239_108_2022_2023
---

1) Создайте пустой проект (или откройте ваш)

2) Найдите какой-нибудь ```wav``` аудиофайл:
 
 - например вбив в гугл ```mp3 for games``` и найдя сайт вроде [https://www.zapsplat.com/sound-effect-category/game-sounds/](https://www.zapsplat.com/sound-effect-category/game-sounds/)
 - когда для подобного сайта вас просят залогиниться - можно сэкономить время найдя сайт на котором выкладывают логины, например вбив в гугл ```free logins for sites``` -> [https://login2.me/](https://login2.me/)
 - скачав ```mp3``` надо его преобразовать в ```wav``` - вбиваем в гугл ```mp3 to wav converter```, находим сайт
 - преобразовали ```mp3``` в ```wav``` (к сожалению mp3 - проприетарный формат, его можно проиграть через javafx, а с этим есть сложности, особенно из-под Swing GUI)

3) Вбейте в гугл ```java play wav file``` и найдите например [это](https://stackoverflow.com/questions/2416935/how-to-play-wav-files-with-java) - создайте класс ```MakeSound```:

```java
import java.io.File;
import java.io.IOException;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.SourceDataLine;

public class MakeSound {

    private final int BUFFER_SIZE = 128000;
    private File soundFile;
    private AudioInputStream audioStream;
    private AudioFormat audioFormat;
    private SourceDataLine sourceLine;

    /**
     * @param filename the name of the file that is going to be played
     */
    public void playSound(String filename){

        String strFilename = filename;

        try {
            soundFile = new File(strFilename);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

        try {
            audioStream = AudioSystem.getAudioInputStream(soundFile);
        } catch (Exception e){
            e.printStackTrace();
            System.exit(1);
        }

        audioFormat = audioStream.getFormat();

        DataLine.Info info = new DataLine.Info(SourceDataLine.class, audioFormat);
        try {
            sourceLine = (SourceDataLine) AudioSystem.getLine(info);
            sourceLine.open(audioFormat);
        } catch (LineUnavailableException e) {
            e.printStackTrace();
            System.exit(1);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }

        sourceLine.start();

        int nBytesRead = 0;
        byte[] abData = new byte[BUFFER_SIZE];
        while (nBytesRead != -1) {
            try {
                nBytesRead = audioStream.read(abData, 0, abData.length);
            } catch (IOException e) {
                e.printStackTrace();
            }
            if (nBytesRead >= 0) {
                @SuppressWarnings("unused")
                int nBytesWritten = sourceLine.write(abData, 0, nBytesRead);
            }
        }

        sourceLine.drain();
        sourceLine.close();
    }
}
```

4) Из ```Main``` класса проиграйте звук:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Start...");

        new MakeSound().playSound("bip.wav");

        System.out.println("main() finished!");
    }
}
```

5) Обратите внимание что вызов проигрывания музыки - блокирующий, пока файл не проиграется до конца - код не пойдет выполняться дальше.
Другая сторона этой проблемы - невозможно проиграть два аудиофайла одновременно, но решение есть!

6) Нужно выполнить этот код из другого потока, тогда основная программа продолжит исполнение команд дальше - а аудиофайл проиграется из метода ```playSound(...)``` выполняемого параллельно - в параллельном вычислительном потоке:

```java
public class Main {
    public static void main(String[] args){
        System.out.println("Start...");

        new Thread(() -> {
            new MakeSound().playSound("bip.wav");
            System.out.println("audio file finished!");
        }).start();

        System.out.println("main() finished!");
    }
}
```

Заметьте что теперь ```main() finished!``` печатается в консоль сразу после начала проигрывания музыки (не дожидаясь ее окончания), а это значит что основная программа продолжает выполняться независимо от проигрывания звука, ведь этим занимается специально созданный независимый поток.
