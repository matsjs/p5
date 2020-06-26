let HEIGHT;
let WIDTH;





class ShootingStar {
  constructor() {
    this.arcStart = 3.2 + 0.8 * Math.random();
    this.dist = 1 + 1.5 * Math.random();
    this.posX = Math.random()*WIDTH
    this.posY = Math.random()*HEIGHT
    this.stop = this.arcStart
    this.start = this.arcStart
    this.shoot = true;
    this.inc = 0.5
    this.w = 1500;
    this.h = 200;
    this.color = color(255,255,136, Math.random() *255)
  }
  
  
  updatePosition = () => {
    if (this.stop < this.arcStart + this.dist) {
      
      this.stop += this.inc
    } else if (this.start + 2*this.inc <= this.stop) {
      this.start += this.inc
    } else {
      // reset arc
      this.start = this.arcStart
      this.stop = this.arcStart + 0.01
      // new posisiton
      this.posX = Math.random()*WIDTH
      this.posY = Math.random()*HEIGHT
      // new color
      this.color = color(255,255,136, Math.random() *255)
      // reset stroke
    }
    // this.strokeWeight -= 0.10;
  }

  draw = () => {
    const {posY, posX, w, h, start, stop} = this;
    this.updatePosition()
    stroke(this.color)
    strokeWeight(2)
    noFill()
    arc(posY, posX, w, h, start, stop);
  }
}

let star;
function setup() {
  HEIGHT = windowHeight;
  WIDTH = windowWidth;
  createCanvas(WIDTH, HEIGHT);
  frameRate(30)
  star =  new ShootingStar();
}

let counter = 0

function draw() {
  // put drawing code here
  background(color(0,12,24));

  star.draw()

}