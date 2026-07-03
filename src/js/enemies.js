//Enemies array
let enemiesArray = [];
let enemiesImg = new Image();

class Enemies {
  constructor() {
    this.image = Math.round((Math.random() * 12));
    this.color = "red";
    this.width = 70;
    this.height = 80;
    this.x = Math.floor(Math.random() * (gameBoard.width - this.width));
    this.y = 0;
    this.speedY = 1+ Math.floor(Math.random() * 6);
  }

  drawEnemies() {
    if (this.image === 1){
      enemiesImg.src = 'src/images/pocket-morty.png';
    }
    else if (this.image === 2){
      enemiesImg.src = 'src/images/evil-morty.png';
    }
    else if (this.image === 3){
      enemiesImg.src = 'src/images/wizard-morty.png';
    }
    else if (this.image === 4){
      enemiesImg.src = 'src/images/spooky-morty.png';
    }
    else if (this.image === 5){
      enemiesImg.src = 'src/images/punk-morty.png';
    }
    else if (this.image === 6){
      enemiesImg.src = 'src/images/renegade-morty.png';
    }
    else if (this.image === 7){
      enemiesImg.src = 'src/images/animatronic-morty.png';
    }
    else if (this.image === 8){
      enemiesImg.src = 'src/images/spliced-morty.png';
    }
    else if (this.image === 9){
      enemiesImg.src = 'src/images/pizza-morty.png';
    }
    else if (this.image === 10){
      enemiesImg.src = 'src/images/dracula-morty.png';
    }
    else if (this.image === 11){
      enemiesImg.src = 'src/images/ghost-morty.png';
    }
    else if (this.image === 12){
      enemiesImg.src = 'src/images/angry-morty.png';
    }
    this.y += this.speedY;
    ctx.drawImage(enemiesImg, this.x, this.y, this.width, this.height);
  }

  top() {
    return this.y;
  }
  bottom() {
    return this.y + this.height;
  }
  left() {
    return this.x;
  }
  right() {
    return this.x + this.width;
  }

  crashWith() {
    return !((this.bottom() < bullet.top()) && (this.left() < bullet.right()) && (this.right() > bullet.left()));
}
}

const addNewEnemiesToEnemiesArray = () => {
  if (frames % 120 === 0) {
    enemiesArray.push(new Enemies());
  }
};

const createNewEnemies = () =>
  enemiesArray.forEach(element => element.drawEnemies());

