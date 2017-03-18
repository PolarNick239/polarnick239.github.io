
var img;
var hole;
var button;
var birdVerticalSpeed = 0.0;
var gravityAcceleration = 0.5;
var birdHeight;

var holeHeight = 20.0;
var holeWeight = 150.0;
var holePointY = 260;
var holePointX;
var wallSpeed;


function setup() {
     createCanvas(windowWidth, windowHeight);     // Указываем размер холста
      img = loadImage("kek_01.png");
      hole= loadImage("kek_02.png");
      button =loadImage("kek_05.png");
      birdHeight = windowHeight/2;
      holePointX = windowWidth;
      wallSpeed = windowWidth / 100;
     frameRate(25);
}

function draw() {
   image(button, 0,0,windowWidth, windowHeight);
    drawBird(birdHeight);
    drawWall(holeHeight, holePointX, holePointY);

    updateWall();
    updateBird();

    //Control();
}
function drawBird(birdHeight){
image(img, windowWidth/2, birdHeight, img.width/5, img.height/5);

}
function drawWall(holeHeight, holePointX, holePointY){
//rect(holePointX-20, holePointY, holeHeight, holeWeight);
image(hole, holePointX,holePointY, hole.width/5, hole.height/5);

}

function updateWall() {
    if (holePointX<-hole.width/5) {
        holePointX = windowWidth;
        holePointY = 50.0 + Math.random() * windowHeight/2;
    } else {
        holePointX -= wallSpeed; // двигаем стену влево
    }
}

function keyPressed() {
    var spaceKeyCode = 32;          // Это кодовое число соответствующее кнопке пробел
    if (keyCode === spaceKeyCode) { // Есть специальная переменная keyCode, в которой хранится код нажатой кнопки. Пусть птица поднимается выше только когда нажимается пробел
        birdVerticalSpeed=-10;
        }
}

function mousePressed() {
    birdVerticalSpeed=-10;
}

function updateBird() {
    birdHeight = birdHeight + birdVerticalSpeed;
    if (birdHeight > windowHeight - img.height/5)
        birdHeight = windowHeight - img.height/5;
    birdVerticalSpeed += gravityAcceleration;
    if (abs(holePointX - windowWidth/2) < wallSpeed/2){
        if ((holePointY>birdHeight)|| (holePointY+150<birdHeight)) {
          background(0, 255, 0);
        }
    }
}














