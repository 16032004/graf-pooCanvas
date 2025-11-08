// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// -------- Clase Ball (Pelota) ----------
class Ball {
  constructor(x, y, radius, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;

    // Rebote arriba/abajo
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.speedY = -this.speedY;
    }
  }

  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.speedX = -this.speedX;      // cambia dirección en X
  }
}

// -------- Clase Paddle (Paleta) ----------
class Paddle {
  constructor(x, y, width, height, color, isPlayerControlled = false) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.isPlayerControlled = isPlayerControlled;
    this.speed = 7;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(direction) {
    if (direction === 'up' && this.y > 0) {
      this.y -= this.speed;
    } else if (direction === 'down' && this.y + this.height < canvas.height) {
      this.y += this.speed;
    }
  }

  // IA simple (paleta CPU sigue la pelota principal)
  autoMove(targetBall) {
    if (targetBall.y < this.y + this.height / 2 && this.y > 0) {
      this.y -= this.speed;
    } else if (targetBall.y > this.y + this.height / 2 &&
               this.y + this.height < canvas.height) {
      this.y += this.speed;
    }
  }
}

// -------- Clase Game (Controla todo) ----------
class Game {
  constructor() {
    // Varias pelotas de colores y tamaños distintos
    this.balls = [
      new Ball(canvas.width / 2, canvas.height / 2, 6, 4, -3, 'orange'),
      new Ball(canvas.width / 2 + 150, canvas.height / 3, 10, -3, 2, 'blue'),
      new Ball(canvas.width / 3, canvas.height - 80, 14, 3, -2, 'cyan'),
      new Ball(canvas.width - 200, canvas.height - 40, 18, -2, -2, 'gray'),
      new Ball(canvas.width / 2, canvas.height - 10, 3, 5, -4, 'white')
    ];

    // Paletas
    this.paddleLeft = new Paddle(
      40,
      canvas.height / 2 - 60,
      12,
      120,
      'limegreen',
      true   // controlada por el jugador
    );

    this.paddleRight = new Paddle(
      canvas.width - 52,
      canvas.height / 2 - 60,
      12,
      120,
      'red',
      false // CPU
    );

    this.keys = {};
  }

  // Dibuja fondo y líneas blancas
  drawField() {
    // fondo gris oscuro
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // dos líneas verticales
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.lineTo(120, canvas.height);
    ctx.moveTo(canvas.width - 120, 0);
    ctx.lineTo(canvas.width - 120, canvas.height);
    ctx.stroke();
  }

  draw() {
    // limpiar todo
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // fondo y líneas
    this.drawField();

    // pelotas
    this.balls.forEach(ball => ball.draw());

    // paletas
    this.paddleLeft.draw();
    this.paddleRight.draw();
  }

  update() {
    // mover pelotas
    this.balls.forEach(ball => {
      ball.move();

      // colisión con paleta izquierda
      if (
        ball.x - ball.radius <= this.paddleLeft.x + this.paddleLeft.width &&
        ball.y >= this.paddleLeft.y &&
        ball.y <= this.paddleLeft.y + this.paddleLeft.height
      ) {
        ball.speedX = Math.abs(ball.speedX);
      }

      // colisión con paleta derecha
      if (
        ball.x + ball.radius >= this.paddleRight.x &&
        ball.y >= this.paddleRight.y &&
        ball.y <= this.paddleRight.y + this.paddleRight.height
      ) {
        ball.speedX = -Math.abs(ball.speedX);
      }

      // si sale por los lados, se resetea
      if (
        ball.x + ball.radius < 0 ||
        ball.x - ball.radius > canvas.width
      ) {
        ball.reset();
      }
    });

    // movimiento paleta izquierda (jugador) con flechas
    if (this.keys['ArrowUp']) {
      this.paddleLeft.move('up');
    }
    if (this.keys['ArrowDown']) {
      this.paddleLeft.move('down');
    }

    // movimiento paleta derecha (CPU) siguiendo la primera pelota
    this.paddleRight.autoMove(this.balls[0]);
  }

  handleInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  run() {
    this.handleInput();

    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };

    loop();
  }
}

// Crear instancia y arrancar el juego
const game = new Game();
game.run();
