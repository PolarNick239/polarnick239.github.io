var width;
var width2;
var height;
var height2;
var holeX;

var bird1;
var bird2;
var bird3;

var bird;

var imBirdHeight;
var imBirdWidth ;
var imBirdDelta ;
var constSpeed;

var back;

var tubeUp;
var tubeDown;

var constWallSpeed;
var holeHeight;
var holeWidth;
var holeY = holeHeight;
var wallSpeed;
var delta;

var birdHeight = 0.0;
var birdVerticalSpeed = 0.0;
var gravityAcceleration;

var points;
var recordPoints;
var flag;
var flag2;
var coeff = 1.0;
var tubeNumber = 1;
var backX;
var backY;

var rand;

function setup() {
    points = 0;
    recordPoints = 0;
    height = windowHeight;//750;
    width2 = 565/755 * height;

    if (windowWidth >= width2) width = width2;
    if (windowWidth <= width2)
    {
        width = windowWidth;
        height2 = 755/565 * windowWidth;

        if (height >= height2) height = height2;
        if (height <= height2) height = windowHeight;
    }

    coeff = height/755;

    imBirdHeight = 60 * coeff;
    imBirdWidth = 70 * coeff;
    imBirdDelta = 10 * coeff;

    holeX = width/2-5;

    constWallSpeed = width/100;
    wallSpeed = constWallSpeed;
    gravityAcceleration = 0.25 * coeff;
    holeHeight = 180 * coeff;
    holeWidth = 100 * coeff;
    delta = 50 * coeff;
    holeY = holeHeight;

    backX = 0;
    backY = 0;

    constSpeed = -6.5 * coeff;

    bird1 = loadImage("bird1.png");  // Load the image
    bird2 = loadImage("bird2.png");
    bird3 = loadImage("bird3.png");

    rand = getRandomInt(1,3);

    if (rand == 1) bird = bird1;
    if (rand == 2) bird = bird2;
    if (rand == 3) bird = bird3;

    back = loadImage("fon3.png");
    tubeUp = loadImage("tubeUp.png");
    tubeDown = loadImage("tubeDown.png");
    flag = false;
    flag2 = false;
    createCanvas(width, height);     // Указываем размер холста
    frameRate(50);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function draw() {
    if (flag2 == false)
    {
        //background(54, 187, 205);            // Указываем цвет фона
        //image(back, 0, 0, width, height);
        updateBack();
        drawBack();

        translate(width/2, height/2);        // Смещаем центр системы координат в центр экрана

        updateWall();
        drawWall(holeX, holeY);

        drawBird(birdHeight);
        updateBird();

        textSize(32 * coeff);
        textStyle(BOLD);
        fill(255, 255, 255);
        text(points, 0, -height/2 + 30 * coeff);
        text("Record: " + recordPoints, -width/2, -height/2 + 30 * coeff);
    }

    else if (flag2 == true)
    {
        //image(back, 0, 0, width, height);
        drawBack();
        //update
        translate(width/2, height/2);        // Смещаем центр системы координат в центр экрана

        drawWall(holeX, holeY);
        updateWall();

        drawBird(birdHeight);
        updateBird();

        textSize(32 * coeff);
        textStyle(BOLD);
        fill(255, 255, 255);
        text(points, 0, -height/2+30 * coeff);
        text("Record: " + recordPoints, -width/2, -height/2+30 * coeff);

        if (birdHeight >= (height/2 - imBirdHeight))
        {
            translate(-width/2, -height/2);        // Смещаем центр системы координат в центр экрана
            //image(back, 0, 0, width, height);
            drawBack();
            translate(width/2, height/2);

            textSize(32 * coeff);
            textStyle(BOLD);
            fill(255, 255, 255);
            text("Your points: " + points, -50, 0);
            textSize(32 * coeff);
            text("Record: " + recordPoints, -width/2, -height/2+30 * coeff);

            textSize(32 * coeff);
            textStyle(BOLD);
            fill(255, 255, 255);
            text("Replay?", -50, 50 * coeff);
            textSize(20 * coeff);
            text("Computer: Enter/ Mouse", -50, 80 * coeff);
            text("Phone: TAP", -50, 110 * coeff);
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
        gravityAcceleration = 0.25 * coeff;
        holeX = width/2-5;
        holeY = holeHeight;
        wallSpeed = constWallSpeed;
        points = 0;

        rand = getRandomInt(1,3);

        if (rand == 1) bird = bird1;
        if (rand == 2) bird = bird2;
        if (rand == 3) bird = bird3;
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
        gravityAcceleration = 0.25 * coeff;
        holeX = width/2-5;
        holeY = holeHeight;
        wallSpeed = constWallSpeed;
        points = 0;

        rand = getRandomInt(1,3);

        if (rand == 1) bird = bird1;
        if (rand == 2) bird = bird2;
        if (rand == 3) bird = bird3;
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

function updateWall() {
    if (holeX <= -width/2 - holeWidth - 1) {// Если координата x стены вышла за пределы экрана
        holeX = width/2;  // крайнее правое положение
        holeY = delta + Math.random() * (height-holeHeight-2*delta);
        tubeNumber = tubeNumber+1;
        flag = false;
    } else {
        holeX -= wallSpeed;           // двигаем стену влево
    }
}

function drawWall(fromX, fromY)
{
    pop();

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


function updateBack() {
    if  ((backX) >= (-width)) backX -= wallSpeed
    else backX = backX + width;
}

function drawBack() {
    image(back, backX, 0, width, height);
    image(back, backX + width, 0, width, height);
    image(back, backX + 2*width, 0, width, height);
}
