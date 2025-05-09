const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

let particles = [];
let ballX, ballY, ballRadius, dx, dy, paddleHeight, paddleWidth, paddleX;
let brickRowCount, brickColumnCount, brickWidth, brickHeight, brickPadding, brickOffsetTop, brickOffsetLeft, bricks;
let rightPressed, leftPressed;
let animation;
let confetti = [];
let gameStatus = "playing"; // 'playing', 'gameover', 'win'

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight * 0.8;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function initGame() {
  ballRadius = 8;
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;

  const angle = (Math.random() * Math.PI) / 2 + Math.PI / 4; // entre 45° e 135°
  const speed = 5;
  dx = speed * Math.cos(angle);
  dy = -speed * Math.sin(angle);


  paddleHeight = 12;
  paddleWidth = canvas.width * 0.2;
  paddleX = (canvas.width - paddleWidth) / 2;

  brickRowCount = 4;
  brickColumnCount = 6;
  brickWidth = (canvas.width * 0.9) / brickColumnCount - 10;
  brickHeight = 20;
  brickPadding = 10;
  brickOffsetTop = 30;
  brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2;

  bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  rightPressed = false;
  leftPressed = false;
  confetti = [];
  gameStatus = "playing";
}

document.addEventListener("keydown", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  if (e.key === "Left"  || e.key === "ArrowLeft")  leftPressed = true;
});
document.addEventListener("keyup", e => {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  if (e.key === "Left"  || e.key === "ArrowLeft")  leftPressed = false;
});

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        let brickX = brickOffsetLeft + c * (brickWidth + brickPadding);
        let brickY = brickOffsetTop + r * (brickHeight + brickPadding);
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = "#f00";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
          dy = -dy;
          b.status = 0;
          createParticles(b.x, b.y);
        }
      }
    }
  }
}


function checkWin() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) return false;
    }
  }
  return true;
}

function drawConfetti() {
  for (let i = 0; i < confetti.length; i++) {
    let c = confetti[i];
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.closePath();

    c.x += c.speedX;
    c.y += c.speedY;

    if (c.y > canvas.height) {
      c.y = 0;
      c.x = Math.random() * canvas.width;
    }
  }
}

function createConfetti() {
  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 5 + 3,
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 3 + 2,
      color: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`
    });
  }
}

function createParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x: x + brickWidth / 2,
      y: y + brickHeight / 2,
      size: Math.random() * 4 + 2,
      speedX: (Math.random() - 0.5) * 6,
      speedY: (Math.random() - 0.5) * 6,
      color: "#f00",
      life: 60  // frames até desaparecer
    });
  }
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.closePath();

    p.x += p.speedX;
    p.y += p.speedY;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}



function drawGameOverText(text) {
  ctx.font = "40px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawParticles(); 
  drawBricks();
  drawBall();
  drawPaddle();

  if (gameStatus === "playing") {
    collisionDetection();

    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
    if (ballY + dy < ballRadius) dy = -dy;
    else if (ballY + dy > canvas.height - ballRadius - 10) {
      if (ballX > paddleX && ballX < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        gameStatus = "gameover";
      }
    }

    if (checkWin()) {
      gameStatus = "win";
      createConfetti();
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
    else if (leftPressed && paddleX > 0) paddleX -= 7;

    ballX += dx;
    ballY += dy;
  }

  if (gameStatus === "gameover") {
    drawGameOverText("GAME OVER");
  } else if (gameStatus === "win") {
    drawConfetti();
    drawGameOverText("VOCÊ VENCEU!");
  }

  animation = requestAnimationFrame(draw);
}

restartBtn.addEventListener("click", () => {
  cancelAnimationFrame(animation);
  initGame();
  draw();
});

initGame();
draw();
