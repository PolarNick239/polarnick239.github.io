var img;
var img1;
var img2;
var img0;

function setup() {
    img0 = loadImage("ree.jpg");
    createCanvas(windowWidth, windowHeight);     // Указываем размер холста
    background(54, 187, 205);   // Указываем цвет фона
    frameRate(25);
    image(img0, 0, 0 , windowWidth, windowHeight);
    img = loadImage("unicorn.png ");  // Load the image
    img1 = loadImage("hghghfgvtyety.png");
    img2 = loadImage("hghghfgv.png");
    holeX = windowWidth*2/3;
    birdHeight = windowHeight/3;
}
 var birdHeight;
 var birdVerticalSpeed = 0.0;
 var gravityAcceleration = 1.0;
 var timer = 0;

function draw() {
    if (timer > 0){
            noStroke();
            var inside = color(204, 102, 0);
            fill(inside);
            createCanvas(windowWidth, windowHeight);     // Указываем размер холста
            background(250, 0, 0);   // Указываем цвет фона
            text("you lost :(");
            timer -= 1;
            }
    else{
        image(img0, 0, 0 , windowWidth, windowHeight);
        image(img, windowWidth/3, birdHeight, img.width/2, img.height/2);
        updateBird();
        updateWall();
        drawWall();
        check();
        }
}
    var holeHight = 130.0;
    var holeX;
    var holeY = 300;

function drawWall() {
    image(img1, holeX, 0, 95, holeY);
    //rect(holeX, 0, 15, holeY);
    image(img2, holeX, holeY + holeHight, 95, windowHeight - holeHight - holeY);
    //rect(holeX, holeY + holeHight, 15, 470);
}

function keyPressed() {
    var spaceKeyCode = 32;          // Это кодовое число соответствующее кнопке пробел
    if (keyCode === spaceKeyCode) { // Есть специальная переменная keyCode, в которой хранится код нажатой кнопки. Пусть птица поднимается выше только когда нажимается пробел
        jump();
    }
}

function mousePressed() {
    jump();
}

function jump() {
        birdVerticalSpeed = -10;           // Выше птица - меньше координата, т.к. в системе координат графики y-ось направлена вниз
}

function updateBird() {
    birdHeight = birdHeight + birdVerticalSpeed;
    if (birdHeight > windowHeight - img.height/2)
        birdHeight = windowHeight - img.height/2;
    birdVerticalSpeed += gravityAcceleration;
}

function updateWall() {
  if (holeX < -95) {
          holeX = windowWidth;
          holeY = 50.0 + Math.random() * 240.0;
      } else {
          holeX -= windowWidth/300; // двигаем стену влево
      }
}

function check () {

  if ((abs(holeX - windowWidth/3) < windowWidth/300/2)) {
    if ((holeY > birdHeight) || (holeY + 100 < birdHeight )) {
        timer = 25;
      }
  }
}