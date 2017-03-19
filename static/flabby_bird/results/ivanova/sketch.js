function setup() {
    createCanvas(1370, 710);
    frameRate(10);
}

var birdHeight = 0.0;
var birdVerticalSpeed = 0.0;
var gravityAcceleration = 10.0;
var wallSpeed = 28;
var wallGravity = 0.05;
var holeWidth = 100.0;
var holeHeight = 200.0;
var holeX1 = 1370.0;
var holeX2 = 1370 + 490;
var holeX3 = 1370 + 980;
var x = 485;
var y = 355;
var color = 0;
var random1 = Math.random();
var random2 = Math.random();
var random3 = Math.random();
var score = 0;
var bestscore = 0;
var cos, sin;
var x, y;

function draw() {
    bestscore = max(score, bestscore);
    background(119, 252, 255);
    translate(x, y);
    updateBird();
    drawBird();
    translate(-x, -y);
    updateWall();
    drawWall();
    textSize(64);
    fill(14, 24, 211);
    text("Score: " + score, 10, 60);
    text("Best score: " + bestscore, 10, 120);
}

function drawBird() {
    var angle = 0;

    angle = PI / 8 * birdVerticalSpeed / 25;

    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    rotate(angle);
    if (color == 1) {
        birdHeight = 0.0;
        birdVerticalSpeed = 0.0;
        gravityAcceleration = 10.0;
        holeWidth = 100.0;
        holeHeight = 200.0;
        holeX1 = 1370.0;
        holeX2 = 1370 + 490;
        holeX3 = 1370 + 980;
        x = 485;
        y = 355;
        wallSpeed = 28;
        wallGravity = 0.05;
        color = 0;
        random1 = Math.random();
        random2 = Math.random();
        random3 = Math.random();
        score = 0;
    }

    fill(247, 49, 105);


    var bx = 0;
    var by = birdHeight;

    var x1 = bx * cos + by * sin;
    var y1 = -bx * sin + by * cos;

    var nx1 = x1 + 20;
    var ny1 = y1 - 10;
    var nx2 = x1 + 20;
    var ny2 = y1 + 10;
    var nx3 = x1 + 37.3;
    var ny3 = y1;

    triangle(nx1, ny1, nx2, ny2, nx3, ny3);

    fill(255, 206, 250);

    ellipse(x1, y1, 53, 50);

    var e1x = x1 + 10;
    var e1y = y1 - 10;
    var e2x = x1 + 12;
    var e2y = y1 - 8;


    fill("white");
    ellipse(e1x, e1y, 20, 20);

    fill(75, 20, 94);
    ellipse(e2x, e2y, 10, 10);

    var xa = x1 - 15;
    var ya = y1;

    fill(196, 141, 244);
    if (birdVerticalSpeed >= 0) {
        arc(xa, ya, 35, 40, 0, PI - 0.4, CHORD);
    } else {
        arc(xa, ya, 35, 35, 0, PI, CHORD);
    }
    rotate(-angle);
}

function updateBird() {
    birdHeight = birdHeight + birdVerticalSpeed;
    birdVerticalSpeed += gravityAcceleration;
}

function keyPressed() {
    var spaceKeyCode = 32;
    if (keyCode === spaceKeyCode) {
        birdVerticalSpeed = -40;
    }
}

function drawWall() {
    fill(240, 255, 206);
    rect(holeX1, 0, holeWidth, holeHeight + (random1 - 0.5) * 400);
    rect(holeX1, 710, holeWidth, -holeHeight + (random1 - 0.5) * 400);
    rect(holeX1 - 20, holeHeight + (random1 - 0.5) * 400 - 30, holeWidth + 40, 30);
    rect(holeX1 - 20, 710 - holeHeight + (random1 - 0.5) * 400 - 30, holeWidth + 40, 30);
    rect(holeX2, 0, holeWidth, holeHeight + (random2 - 0.5) * 400);
    rect(holeX2, 710, holeWidth, -holeHeight + (random2 -0.5) * 400);
    rect(holeX2 - 20, holeHeight + (random2 - 0.5) * 400 - 30, holeWidth + 40, 30);
    rect(holeX2 - 20, 710 - holeHeight + (random2 - 0.5) * 400 - 30, holeWidth + 40, 30);
    rect(holeX3, 0, holeWidth, holeHeight + (random3 - 0.5) * 400);
    rect(holeX3, 710, holeWidth, -holeHeight + (random3 - 0.5) * 400);
    rect(holeX3 - 20, holeHeight + (random3 - 0.5) * 400 - 30, holeWidth + 40, 30);
    rect(holeX3 - 20, 710 - holeHeight + (random3 - 0.5) * 400 - 30, holeWidth + 40, 30);
}

function updateWall() {
    if (holeX1 < -100) {
        holeX1 = 1370;
        random1 = Math.random();
    } else {
        holeX1 -= wallSpeed;
    }
    if (holeX3 < 500.0 - 100 && holeX3 > 500 - wallSpeed - 100) {
        score++;
        bestscore = max(score, bestscore);
    }
    if (x + 53 >= holeX1 && x - 53 <= holeX1 + 100 && (birdHeight + y - 40 <= holeHeight + (random1 - 0.5) * 400 || birdHeight + y + 40 >= 710 - holeHeight + (random1 - 0.5) * 400)) {
        color = 1;
    }
    if (holeX2 < -100) {
        holeX2 = 1370;
        random2 = Math.random();
    } else {
        holeX2 -= wallSpeed;
    }
    if (holeX1 < 500.0 - 100 && holeX1 >= 500 - wallSpeed - 100) {
        score++;
        bestscore = max(score, bestscore);
    }
    if (x + 53 >= holeX2 && x - 53 <= holeX2 + 100 && (birdHeight + y - 40 <= holeHeight + (random2 - 0.5) * 400 || birdHeight + y + 40 >= 710 - holeHeight + (random2 - 0.5) * 400)) {
        color = 1;
    }
    if (holeX3 < -100) {
        holeX3 = 1370;
        random3 = Math.random();
    } else {
        holeX3 -= wallSpeed;
    }
    if (holeX2 < 500.0 - 100 && holeX2 >= 500 - wallSpeed - 100) {
        score++;
        bestscore = max(score, bestscore);
    }
    if (x + 53 >= holeX3 && x - 53 <= holeX3 + 100 && (birdHeight + y - 40 <= holeHeight + (random3 - 0.5) * 400 || birdHeight + y + 40 >= 710 - holeHeight + (random3 - 0.5) * 400)) {
        color = 1;
    }
    wallSpeed += wallGravity;
}

