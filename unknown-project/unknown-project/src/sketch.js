class Segment {
  GRAVITY = 10;

  // int, int, vector
  constructor (length, anchorWeight, top) {
    this.length = length;
    this.anchorWeight = anchorWeight;
    this.top = top;
    this.bottom = createVector(top.x, top.y + length);
    this.bottomVelocity = createVector(0, 0);
  }

  // vector, vector
  newBottomPosition (topPos, bottomPos) {
    // Angle from top to old bottom
    let angle = createVector(1, 0).angleBetween(createVector(topPos.x - bottomPos.x, topPos.y - bottomPos.y));

    return createVector(topPos.x - (cos(angle)*this.length), topPos.y - (sin(angle)*this.length));
  }


  // vector, vector, vector
  applyForce(oldBot, newBot, currentVelocity) {
    // Movement force
    let movementVel = p5.Vector.sub(newBot, oldBot);
    // // Gravity
    let gravity = createVector(0, - this.GRAVITY);

    // Apply forces
    let sumForce = currentVelocity.copy().add(movementVel).sub(gravity).limit(this.length);

    return sumForce;
  }

  // vector, vector, vector
  applyResistance(oldBot, newBot, velocity) {
    let movement = p5.Vector.sub(newBot, oldBot);
    let x = velocity.x > 0 ? velocity.x - (movement.x**2/2) : velocity.x + (movement.x**2/2);
    let y = velocity.y > 0 ? velocity.y - (movement.y**2/2) : velocity.y + (movement.y**2/2);

    return createVector(min(x,0), min(y,0));
  }

  // vector
  updatePosition(newTop){
    // New bottom position
    let newBot = this.newBottomPosition(this.top, this.bottom);
    // Calc velocity of bottom
    let forces = this.applyForce(this.top, newTop, this.bottomVelocity);

    stroke('purple'); // Change the color
    strokeWeight(10);
    point(newBot.x + this.bottomVelocity.x, newBot.y + this.bottomVelocity.y);
    stroke('black'); // Change the color
    strokeWeight(1);

    this.bottomVelocity = this.applyResistance(this.bottom, newBot, forces);
    let newestBot = this.newBottomPosition(this.top, createVector(newBot.x + this.bottomVelocity.x, newBot.y + this.bottomVelocity.y));
    text(this.bottomVelocity, 0,20)

    // Update positions
    this.top = newTop;
    this.bottom = newestBot;

  }

  draw(){
    line(this.top.x, this.top.y, this.bottom.x, this.bottom.y)
  }

  // vector
  drawAndUpdate(topPosition){
    this.updatePosition(topPosition);
    this.draw();
  }
}


let WIDTH = 500;
let HEIGHT = 500;
let rope;
function setup() {
  // put setup code here
  createCanvas(WIDTH, HEIGHT);
  angleMode(DEGREES);
  rope = new Segment(50, 1, createVector(mouseX || WIDTH/2, mouseY || HEIGHT/2));
}

function draw() {
  // put drawing code here
  background(200);
  rope.drawAndUpdate(createVector(mouseX || WIDTH/2, mouseY || HEIGHT/2));
}
