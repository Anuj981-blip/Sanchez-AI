console.log("If you are reading this message, we are all good brotha!");

const gameBoard = document.getElementById("game-board");
const ctx = gameBoard.getContext("2d");
let frames = 0;
let requestId = 0;
let pauseGame = false;
const themeSong = new Audio('src/audio/theme.mp3');
const hitMorty = new Audio('src/audio/tiny-rick.wav');
const shoot = new Audio('src/audio/shot.mp3');
const portal = new Audio('src/audio/portal.mp3');

let background = new Image();
background.src = 'src/images/background-canvas.png';
ctx.drawImage(background, 0, 0, gameBoard.width, gameBoard.height);

const pauseNow = () => {
  pauseGame = !pauseGame;
    if(!pauseGame){
      requestId = requestAnimationFrame(engine);
    }else {
      ctx.font = '200px Ricks';
      ctx.fillStyle = 'lightseagreen';
      ctx.fillText('PAUSE', (gameBoard.width / 2) - 200, gameBoard.height / 2);
      cancelAnimationFrame(requestId);
      themeSong.pause();
    }
}

const bigRick = new Rick("blue");

const clearGameBoard = () => {
  ctx.drawImage(background, 0, 0, gameBoard.width, gameBoard.height);
}

let moveLeft = false;
let moveRight = false;
let moveBackward = false;

document.onkeydown = function(e) {
  switch (e.keyCode) {
    case 38: // up arrow
      bigRick.speedY -= 15;
      break;
    case 40: // down arrow
      moveBackward = true;
      bigRick.speedY += 15;
      break;
    case 37: // left arrow
      moveLeft = true;
      bigRick.speedX -= 15;
      break;
    case 39: // right arrow
    moveRight = true;
      bigRick.speedX += 15;
      break;
    case 32: // spacebar
      shoot.play();
      addNewBulletsToBulletsArray();
      break;
    case 80: //P button
      pauseNow();
    default:
      console.log(`${e.key} is not a valid key!`);
  }
};

document.onkeyup = function(e) {
  moveLeft = false;
  moveRight = false;
  moveBackward = false;
  bigRick.speedX = 0;
  bigRick.speedY = 0;
};

const gameScore = () => {
  let score = Math.floor(frames / 60);
  ctx.font = "20px Ricks";
  ctx.fillStyle = "#97ce4c";
  ctx.fillText(
    `Survival time: ${score}s`,
    (gameBoard.width / 4) * 3.20,
    (gameBoard.height / 100) * 4.5
  );
    return score;
  };

const updateRickLife = () => {
  let rickLifes = bigRick.lifes;
  ctx.font = "20px Ricks";
  ctx.fillStyle = "#97ce4c";
  ctx.fillText(
    `Lifes: ${rickLifes}`,
    (gameBoard.width / 4) * 3.4,
    (gameBoard.height / 100) * 10
  );
  enemiesArray.forEach((element, idx) => {
    if (element.y > gameBoard.height) {
      portal.play();
      bigRick.lifes -= 1;
      enemiesArray.splice(idx, 1);
    }
  })
};

const checkGameOver = () => {
  if (bigRick.lifes < 1) {
    ctx.font = "150px Ricks";
    ctx.fillStyle = "plum";
    ctx.fillText("GAME OVER", (gameBoard.width / 2) - 300, gameBoard.height / 2);
    ctx.font = "60px Ricks";
    ctx.fillStyle = "palegreen";
    ctx.fillText(`You survived: ${gameScore()}s`, (gameBoard.width / 2) - 60, gameBoard.height - 180);
    window.cancelAnimationFrame(requestId);
    themeSong.pause();
  }
};

const engine = () => {
  console.log("updating...");
  clearGameBoard();
  bigRick.drawRick();
  bigRick.rickNewPos();
  addNewEnemiesToEnemiesArray();
  createNewEnemies();
  createNewBullets();
  updateRickLife();
  gameScore();
  enemyHitByBullet(enemiesArray, bulletsArray);
  rickHitByEnemy(enemiesArray);
  themeSong.play();
  frames += 1;
  requestId = window.requestAnimationFrame(engine);
  checkGameOver();;
};  

window.onload = function () {
  document.getElementById("start-button").onclick = function (event) {
    window.requestAnimationFrame(engine);
    event.target.disabled = true;
  };
  document.getElementById("pause-button").onclick = function () {
    pauseNow();
  }
  document.getElementById("restart-button").onclick = function () {
    location.reload();
  }
}