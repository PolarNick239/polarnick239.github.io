var width;
var width2;
var height;
var height2;
var holeX;
var bird1;
var bird2;

var bird;
var imBirdHeight = 60;
var imBirdWidth = 70;
var imBirdDelta = 10;
var back;
var tubeUp;
var tubeDown;
var constWallSpeed;

var points;
var recordPoints;
var flag;
var flag2;

function setup() {
    points = 0;
    recordPoints = 0;
    height = windowHeight;//750;
    width2 = 560/750 * height;
    if (windowWidth >= width2) width = width2;
    if (windowWidth <= width2)
    {
        width = windowWidth;
        height2 = 750/560 * windowWidth;
        if (height >= height2) height = height2;
        if (height <= height2) height = windowHeight;
    }

    bird1 = color(255, 255, 255);
    bird2 = color(0, 0, 0);
    holeX = width/2-5;
    constWallSpeed = 6;
    wallSpeed = constWallSpeed;
    bird = loadImage("bird2.png"); // Load the image
    back = loadImage("fon2.png");
    tubeUp = loadImage("tubeUp.png");
    tubeDown = loadImage("tubeDown.png");
    flag = false;
    flag2 = false
    createCanvas(width, height);     // Указываем размер холста
    frameRate(50);
}

var birdHeight = 0.0;
var birdVerticalSpeed = 0.0;
var gravityAcceleration = 0.25;



function draw() {
    if (flag2 == false)
    {
        //background(54, 187, 205);            // Указываем цвет фона
        image(back, 0, 0, width, height);

        translate(width/2, height/2);        // Смещаем центр системы координат в центр экрана

        drawWall(holeX, holeY);
        updateWall();

        drawBird(birdHeight);
        updateBird();

        textSize(32);
        textStyle(BOLD);
        fill(255, 255, 255);
        text(points, 0, -height/2+50);
        text("Record: " + recordPoints, -width/2, -height/2+50);
    }

    else if (flag2 == true)
    {
        image(back, 0, 0, width, height);

        translate(width/2, height/2);        // Смещаем центр системы координат в центр экрана

        drawWall(holeX, holeY);
        updateWall();

        drawBird(birdHeight);
        updateBird();

        textSize(32);
        textStyle(BOLD);
        fill(255, 255, 255);
        text(points, 0, -height/2+50);
        text("Record: " + recordPoints, -width/2, -height/2+50);

        if (birdHeight >= (height/2 - imBirdHeight))
        {
            translate(-width/2, -height/2);        // Смещаем центр системы координат в центр экрана
            image(back, 0, 0, width, height);
            translate(width/2, height/2);

            textSize(32);
            textStyle(BOLD);
            fill(255, 255, 255);
            text("Your points: " + points, -50, 0);
            textSize(32);
            text("Record: " + recordPoints, -width/2, -height/2+50);

            textSize(32);
            textStyle(BOLD);
            fill(255, 255, 255);
            text("Replay?", -50, 50);
            textSize(20);
            text("Computer: Enter/ Mouse", -50, 80);
            text("Phone: TAP", -50, 110);
        }
    }
}


function drawBird(birdHeight)
{
    var Y = birdHeight+height/2;
    var X = -width/4 - imBirdWidth/2;
    if  ( ((X + imBirdWidth - 2) > holeX) && (X < (holeX+holeWidth)) )
    {
        if (  ( ((Y+imBirdHeight) > holeY) && ((Y+imBirdHeight) < (holeY+holeHeight)) ) && ( (Y > holeY) && (Y < (holeY+holeHeight)) )  )
        {
            if (flag == false)
            {
                points = points + 1;
                if (recordPoints < points) recordPoints = points;
                flag = true;
            }
        }
        else
        {
                //if (flag==false) points = points - 1;
                wallSpeed = 0;
                flag2 = true;
                flag = true;
        }
    }

    if (birdHeight >= height/2 - imBirdHeight -2) birdHeight = height/2 - imBirdHeight - 2;

    image(bird, X, birdHeight, imBirdWidth, imBirdHeight);
    //ellipse(X, birdHeight, 20, 20);
}

var constSpeed = -6.5;
function keyPressed() {
    var spaceKeyCode = 32;          // Это кодовое число соответствующее кнопке пробел
    var enterKeyCode = 13;
    if ((keyCode === spaceKeyCode) && (flag2 == false)) { // Есть специальная переменная keyCode, в которой хранится код нажатой кнопки. Пусть птица поднимается выше только когда нажимается пробел
        birdVerticalSpeed = constSpeed;
    }

    if ((keyCode === enterKeyCode) && (flag2 == true) && (flag == true)) {
        flag = false;
        flag2 = false;
        if (recordPoints < points) recordPoints = points;
        birdHeight = 0.0;
        birdVerticalSpeed = 0.0;
        gravityAcceleration = 0.25;
        holeX = width/2-5;
        holeY = holeHeight;
        wallSpeed = constWallSpeed;
        points = 0;
    }
}

function mousePressed() {
    if (flag2 == false) {
        birdVerticalSpeed = constSpeed;
    }
    if ((flag2 == true) && (flag == true)) {
        flag = false;
        flag2 = false;
        birdHeight = 0.0;
        birdVerticalSpeed = 0.0;
        gravityAcceleration = 0.25;
        holeX = width/2-5;
        holeY = holeHeight;
        wallSpeed = constWallSpeed;
        points = 0;
    }
}

function updateBird() {
    if (birdHeight <= (height/2 - imBirdHeight))
    {
        birdHeight = birdHeight + birdVerticalSpeed;
        birdVerticalSpeed += gravityAcceleration;
    }
    else
    {
        if (birdVerticalSpeed == constSpeed)
        {
            birdHeight = height/2 - imBirdHeight - 2;
            //birdHeight = birdHeight + birdVerticalSpeed;
            //birdVerticalSpeed += gravityAcceleration;
        }
    }
        //else fill(bird1);
}

var holeHeight = 180;
var holeWidth = 80;
var holeY = holeHeight;
var wallSpeed;
var delta = 40;

function updateWall() {
    if (holeX <= -width) {          // Если координата x стены вышла за пределы экрана
        holeX = width/2;  // крайнее правое положение
        holeY = delta + Math.random() * (height-holeHeight-delta);
        flag = false;
    } else {
        holeX -= wallSpeed;           // двигаем стену влево
    }
}

function drawWall(fromX, fromY)
{
    push();
    translate(0, -height/2);
    image(tubeDown, fromX, fromY+holeHeight, holeWidth, height);
    image(tubeUp, fromX, fromY-height, holeWidth, height);
    pop();

    /*push();
    translate(0, -height/2);
    fill(0, 0, 0, 0);
    rect(fromX, fromY, holeWidth, holeHeight);
    pop();*/
}