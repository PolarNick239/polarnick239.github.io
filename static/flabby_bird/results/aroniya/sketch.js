
var img;
var hole;
var button;
var birdVerticalSpeed = 0.0;
var gravityAcceleration = 0.5;
var birdHeight = 240.0;

var holeHeight = 20.0;
var holeWeight = 150.0;
var holePointY = 260;
var holePointX = 640;
var wallSpeed=5;


function setup() {
     createCanvas(640, 480);     // Указываем размер холста
      img = loadImage("kek_01.png");
      hole= loadImage("kek_02.png");
      button =loadImage("kek_05.png");
     frameRate(25);
}

function draw() {
   image(button, 0,0,640,480);
    drawBird(birdHeight);
    drawWall(holeHeight, holePointX, holePointY);

    updateWall();
    updateBird();

    //Control();
}
function drawBird(birdHeight){
image(img, 320, birdHeight, img.width/5, img.height/5);

}
function drawWall(holeHeight, holePointX, holePointY){
//rect(holePointX-20, holePointY, holeHeight, holeWeight);
image(hole, holePointX,holePointY, hole.width/5, hole.height/5);

}

function updateWall() {
    if (holePointX<0 ) {
        holePointX = 620;
        holePointY = 50.0 + Math.random() * 240.0;
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

function updateBird() {
    birdHeight = birdHeight + birdVerticalSpeed;
    birdVerticalSpeed += gravityAcceleration;
    if (holePointX==330){
        if ((holePointY>birdHeight)|| (holePointY+150<birdHeight)) {
          background(0, 255, 0);
        }
    }
}














