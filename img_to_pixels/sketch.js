const scale = 1;

let toPixelize;
let xSize = 10;
let ySize = 10;

let pixelized = [];

function preload() {
  toPixelize = loadImage("/imgs/house.png");
  console.log(toPixelize);

}

imgToPixels = (path) => {
  toPixelize = loadImage(path);
  console.log(toPixelize);
  
  toPixelize.loadPixels();
  for (let y = 0; y < toPixelize.height; y++) {
    for (let x = 0; x < toPixelize.width; x++) {
      let index = (x + y * toPixelize.width) * 4;
      pixelized = pixelized.concat([
        toPixelize.pixels[index],
        toPixelize.pixels[index + 1],
        toPixelize.pixels[index + 2],
        toPixelize.pixels[index + 3],
      ]);
    }
  }
  return pixelized;
}

function setup() {
  createCanvas(xSize, ySize);
  pixelDensity(1);
  console.log(toPixelize);

  toPixelize.loadPixels();
  console.log(toPixelize);

  for (let y = 0; y < toPixelize.height; y++) {
    for (let x = 0; x < toPixelize.width; x++) {
      let index = (x + y * toPixelize.width) * 4;
      pixelized = pixelized.concat([
        toPixelize.pixels[index],
        toPixelize.pixels[index + 1],
        toPixelize.pixels[index + 2],
        toPixelize.pixels[index + 3],
      ]);
    }
  }

  console.log(pixelized);
}

function draw() {
  // put drawing code here
  // image(toPixelize, 0, 0, 100, 100);
  loadPixels();
  for (let y = 0; y < ySize; y++) {
    for (let x = 0; x < xSize; x++) {
      let index = (x + y * xSize) * 4;
      pixels[index + 0] = pixelized[index + 0];
      pixels[index + 1] = pixelized[index + 1];
      pixels[index + 2] = pixelized[index + 2];
      pixels[index + 3] = pixelized[index + 3];
    }
  }

  updatePixels();
  noLoop();
}
