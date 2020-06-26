const tileType = {
  GRASS: [23, 91, 70, 255],
  SAND: [243, 222, 138, 255],
  WATER: [20, 129, 186, 255],
  MOUNTAIN: [153, 153, 153, 255],
  SNOW: [245, 245, 245, 255],
  FARM: [255, 231, 153, 255],
  ROAD: [29, 26, 5, 255],
};

let iconIMG = {};

function drawIMG (img, x, y) {
  img.forEach((row, rowIndex) => {
    row.forEach((pixel, pixelIndex) => {
      if (pixel.some(num => num !== 0)) {
        fill(color(pixel))
        rect(x+pixelIndex, y+rowIndex,1,1)
      }
    });
  });
} 

function elevFunc(xSize, ySize) {
  // Input world size
  // Outputs a blank world
  let hmap = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let hSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom
      hSlice.push(null);
      // TODO better mountaingen

      // const elev = noise(y * 0.015, x * 0.015) * 1.75;
      // if (elev > 0.95) {
      //   hSlice.push("SNOW");
      // } else if (elev > 0.8) {
      //   hSlice.push("MOUNTAIN");
      // } else if (elev > 0.7) {
      //   hSlice.push("HILL");
      // } else {
      //   hSlice.push(null);
      // }
    }

    hmap.push(hSlice);
  }
  return hmap;
}

function pangea(xSize, ySize) {
  // Input world size
  // Outputs a blank world
  let world = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let worldSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom
      const distance =
        Math.sqrt((x - xSize / 2) ** 2 + (y - ySize / 2) ** 2) /
        Math.sqrt((xSize / 2) ** 2 + (ySize / 2) ** 2);

      const lVal = distance * 1.2 + noise(y * 0.1, x * 0.1) * 0.8;

      worldSlice.push(lVal);
    }

    world.push(worldSlice);
  }
  return world;
}

function createTile(continent, elevation, x, y) {
  const tileVal = continent[x][y];
  const height = elevation[x][y];
  let tileType = "";
  let tileItem = null;

  if (tileVal > 0.8) {
    tileType = "WATER";
  } else {
    if (height === null) {
      tileType = tileVal > 0.65 ? "SAND" : "GRASS";
    } else if (height === "HILL") {
      tileType = tileVal > 0.65 ? "SAND" : "GRASS";
      // tileItem = "HILL"
    } else {
      tileType = height;
    }
  }

  return new Tile(tileType, x, y, tileItem)
}

function terrainType(x, y) {
  const landVal = continent[x][y];
  const elev = elevation[x][y];
  if (landVal > 0.8) {
    return color(cSEA);
  } else if (landVal > 0.65) {
    return elev !== null ? color(elev) : color(cSAND);
  } else {
    return elev !== null ? color(elev) : color(cGRASS);
  }
}

function buildWorld(continent, elevation, xSize, ySize) {
  let items = [];

  for (let x = 0; x < xSize; x++) {
    // Slices of world from left to right
    let worldSlice = [];

    for (let y = 0; y < ySize; y++) {
      // Pieces of world from top to bottom

      worldSlice.push(createTile(continent, elevation, x, y));
    }

    items.push(worldSlice);
  }
  return items;
}

const worldWidth = 300;
const worldHeight = 200;
const tileSize = 10;
let world = [];
let frameNum = 42;

function worldGen(worldWidth, worldHeight) {
  return buildWorld(pangea(worldWidth, worldHeight), elevFunc(worldWidth, worldHeight), worldWidth, worldHeight);

}



function tileToPixels(x, y, tileSize, terrain) {
  // x = 0...200
  // y = 0...200
  colors = tileType[terrain];
  for (let wIndex = 0; wIndex < tileSize; wIndex++) {
    for (let hIndex = 0; hIndex < tileSize; hIndex++) {
      for (let w = 0; w < tileSize; w++) {
        for (let h = 0; h < tileSize; h++) {
          let base = x*4*tileSize + 4*w + tileSize*h*4*worldWidth + y*4*tileSize*worldWidth*tileSize
          pixels[base]=colors[0]
          pixels[base+1]=colors[1]
          pixels[base+2]=colors[2]
          pixels[base+3]=colors[3]
          
        }
        
      }
    }
  }  
}

function renderWorld() {
  
  loadPixels()
  for (let x = 0; x < worldWidth; x++) {
    for (let y = 0; y < worldHeight; y++) {
      tileToPixels(x,y,10,world[x][y].tileType);
    }
  }
  updatePixels();
}

function renderItems() {
  for (let x = 0; x < worldWidth; x++) {
    for (let y = 0; y < worldHeight; y++) {
      world[x][y].item !== null
      ? image(iconIMG[world[x][y].item], x * tileSize, y * tileSize, tileSize,  tileSize)
      : null;
    }
  }
}

let population = 10
let houseCount = 0;

function popChange(currentPopulation, growthRate, carryingCapacity) {
  return growthRate*currentPopulation*(1-currentPopulation/carryingCapacity)
}

function buildHouse() {
  // Find optimal location
  // const optimalTile = Math.min.apply(Math, world.flat().map(tile => { return tile.houseCost; }))
  const optimalTile = world.flat().reduce((res, obj) => obj.houseCost < res.houseCost ? obj : res); 
  
  // Find nearest road connection
  //  nearestRoad =  Math.min.apply(Math, world.map(tile => (tile.tileType === "ROAD" ? optimalTile.distance(tile) : Infinity)))
  let nearestRoad = world.flat().reduce((res, obj) => obj.distance(optimalTile) < res.distance(optimalTile) ? obj : res); 

  // First house:
  nearestRoad = nearestRoad < Infinity ? nearestRoad : world[optimalTile.x][optimalTile.y + 1];

  // Place house and roads
  optimalTile.setItem("HOUSE");
  houseCount ++;

  // Update cost gradient
}

function buildRoad(a, b) {

}

function aStarPath(a,b) {
  var graph = new Graph([
    [1,1,1,1],
    [0,1,1,0],
    [0,0,1,1]
  ]);
  var start = graph.grid[0][0];
  var end = graph.grid[1][2];
  var result = astar.search(graph, start, end);
}

// ---------------------------------Standards---------------------------------
function preload(){
  iconIMG = {
    HILL: loadImage("/hill.png"),
    HOUSE: loadImage("/house.png"),
    TREE: "",
  };
}

function setup() {
  createCanvas(worldWidth * tileSize, worldHeight * tileSize);
  noiseDetail(2, 0.1);
  noiseSeed(frameNum);
  frameRate(1)
  pixelDensity(1)
  world = worldGen(worldWidth, worldHeight);
  renderWorld();

}

function draw() {
  // draw houses/ farms
  // update world
  frameNum++;
  // population += popChange(population, 2, 10000);
  // const numNewHouses = ceil((population / 10) - houseCount);
  // if (numNewHouses >= 1) {
  //   for (let index = 0; index < numNewHouses; index++) {
  //     buildHouse()
  //   }
  // } 
  // renderItems()
  // console.log(population);
  // console.log(houseCount);
  
  
  // if (frameNum % 5 === 0) {
  //   noiseSeed(frameNum);
  //   world = worldGen(worldWidth, worldHeight);

  //   renderWorld()
  // }
}
