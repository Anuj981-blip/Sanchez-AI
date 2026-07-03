let pickle = new Image();

let bulletsArray = [];

class Bullets {
  constructor(){
    this.color = "ligthgreen";
    this.img = new Image();
    this.width = 25;
    this.height = 50;
    this.x = bigRick.x + bigRick.width/2 - this.width/2;
    this.y = bigRick.y;
    this.speedX = 0;
    this.speedY = 5;
  }
  drawBullets() {
    pickle.src = 'src/images/pickle2.png';
    ctx.drawImage(pickle, this.x, this.y, this.width, this.height);
  }
  bulletNewPos() {
    if(this.speedY > 0){
      this.y -= this.speedY;
    }
      }
  
  removeBullets(idx, arr) {
    if(this.y < 0){
      arr.splice(idx, 1);
    }
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
};

const addNewBulletsToBulletsArray = () => {
  let bullets = new Bullets();
  bulletsArray.push(bullets);
};

const enemyHitByBullet = (arr1, arr2) => {
  for (let i = 0; i < arr2.length; i += 1){
    for (let j = 0; j < arr1.length; j += 1){
      if((arr1[j].bottom() > arr2[i].top()) && (arr1[j].left() < arr2[i].right()) && (arr1[j].right() > arr2[i].left())){
        hitMorty.play();
        arr1.splice(j, 1);
        arr2.splice(i, 1);
    }
  }
  }
}

const createNewBullets = () => {
  bulletsArray.forEach((element, idx) => {
    element.drawBullets()
    element.bulletNewPos();
    element.removeBullets(idx, bulletsArray);
  });
}