const worldWidth = 35;
const worldHeight = 35;
const tileSize = 20;
let world = [];
let frameNum = 42;
const tileType = {
  GRASS: [23, 91, 70, 255],
  SAND: [243, 222, 138, 255],
  WATER: [20, 129, 186, 255],
  MOUNTAIN: [153, 153, 153, 255],
  SNOW: [245, 245, 245, 255],
  FARM: [255, 231, 153, 255],
  ROAD: [163, 123, 115, 200],
};

let iconIMG = {};

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

function grassWorld(xSize, ySize) {
  let world = [];
  for (let x = 0; x < xSize; x++) {
    let worldSlice = [];
    for (let y = 0; y < ySize; y++) {
      worldSlice.push(0.6);
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

  return new Tile(tileType, x, y, tileItem);
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

function worldGen(worldWidth, worldHeight) {
  // const w = pangea(worldWidth, worldHeight);
  const w = grassWorld(worldWidth, worldHeight);

  return buildWorld(
    w,
    elevFunc(worldWidth, worldHeight),
    worldWidth,
    worldHeight
  );
}

function tileToPixels(x, y, tileSize, terrain) {
  // x = 0...200
  // y = 0...200
  colors = tileType[terrain];
  for (let wIndex = 0; wIndex < tileSize; wIndex++) {
    for (let hIndex = 0; hIndex < tileSize; hIndex++) {
      for (let w = 0; w < tileSize; w++) {
        for (let h = 0; h < tileSize; h++) {
          let base =
            x * 4 * tileSize +
            4 * w +
            tileSize * h * 4 * worldWidth +
            y * 4 * tileSize * worldWidth * tileSize;

          let noise = 0.95 + Math.random() * 0.1;
          pixels[base] = colors[0] * noise;
          pixels[base + 1] = colors[1] * noise;
          pixels[base + 2] = colors[2] * noise;
          pixels[base + 3] = colors[3];
        }
      }
    }
  }
}

function renderWorld() {
  // All tiles with new info
  let toUpdate = [];

  loadPixels();
  for (let x = 0; x < world.length; x++) {
    for (let y = 0; y < world[0].length; y++) {
      const tile = world[x][y];
      
      if (tile.updated) {
        tileToPixels(tile.x, tile.y, tileSize, tile.tileType);

        if (!tile.item && tile.indicator === "") {
          tile.setUpdated(false);
        } else {
          toUpdate.push(tile);
        }
      }
    }
  }
  updatePixels();
  log(toUpdate)

  toUpdate.forEach((tile) => {
    // Check if there's an item here
    if (tile.item) {
      image(
        iconIMG[tile.item],
        tile.x * tileSize,
        tile.y * tileSize,
        tileSize,
        tileSize
      );
      tile.setUpdated(false);
    }
    // Check if there's an indicator here
    if (tile.indicator !== "") {
      color(0);
      text(
        tile.indicator,
        tile.x * tileSize + 0.5 * tileSize,
        tile.y * tileSize + 0.5 * tileSize
      );
      tile.indicator = "";
      tile.setUpdated(true);
    }

  });

}

let population = 10;
let houseTiles = [];
let farmTiles = [];
let roadTiles = [];

function popChange(currentPopulation, growthRate, carryingCapacity) {
  return (
    growthRate * currentPopulation * (1 - currentPopulation / carryingCapacity)
  );
}

farmOrRoadNeighbor = (tile) => {
  getNeighbors(tile, world).forEach((neighbor) => {
    if (neighbor.tileType === "ROAD" || neighbor.tileType === "FARM") {
      return true;
    }
  });
  return false;
};

createFields = (n) => {
  for (let index = 0; index < n; index++) {
    placeFarm();
  }
};

function placeFarm() {
  // Find optimal tile - next to other farm or next to a road, close to population center
  const possibleTiles = world.flat().reduce((accumulator, currentValue) => {
    if (
      currentValue.tileType !== "WATER" &&
      currentValue.tileType !== "ROAD" &&
      currentValue.tileType !== "FARM" &&
      currentValue.item !== "HOUSE" &&
      !currentValue.deadEnd
    ) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);

  if (possibleTiles.length > 0) {
    const bestTiles = possibleTiles.sort(
      (tileA, tileB) => tileA.farmCost - tileB.farmCost
    );
    let index = 0;
    let optimalTile = bestTiles[index];
    // If dead end, find next spot
    while (index < bestTiles.length && deadEnd(optimalTile)) {
      optimalTile = bestTiles[index];
      index++;
    }
    // Place farm plot
    optimalTile.setTileType("FARM");
    optimalTile.setUpdated(true);
    farmTiles.push(optimalTile);
    // Update costs
    updateFarmCosts(optimalTile, 5);
  } else {
    // No possible tiles
  }
}

placeRoad = (x, y) => {
  const tile = world[x][y];
  if (tile.tileType !== "ROAD" && tile.item !== "HOUSE") {
    tile.setTileType("ROAD");
    roadTiles.push(tile);
    tile.setUpdated(true);
  }
};

function buildHouse() {
  // Find optimal location
  let optimalTile = world.flat().reduce((accumulator, currentValue) => {
    if (
      currentValue.tileType !== "WATER" &&
      currentValue.tileType !== "ROAD" &&
      currentValue.tileType !== "FARM" &&
      currentValue.item !== "HOUSE" &&
      !currentValue.deadEnd &&
      currentValue.houseCost < accumulator.houseCost
    ) {
      return currentValue;
    } else {
      return accumulator;
    }
  });

  // First house:
  if (houseTiles.length === 0 && roadTiles.length === 0) {
    optimalTile =
      world[Math.round(worldWidth / 2)][Math.round(worldHeight / 2)];
    placeRoad(optimalTile.x, optimalTile.y + 1);
    optimalTile.setItem("HOUSE");
    optimalTile.setUpdated(true);
    houseTiles.push(optimalTile);
  } else {
    // Find nearest road connection
    roads = [...getNeighboringRoads(optimalTile)];
    if (roads.length === 0) {
      // If there are no neighbouring connections, place a new road

      // Sort by distance
      roads = roadTiles.sort((tile) => tile.distance(optimalTile));

      let joinRoad = null;
      // Attempt to join road
      for (let attempt = 0; attempt < 3; attempt++) {
        const path = aStarPath(
          optimalTile.x,
          optimalTile.y,
          roads[attempt].x,
          roads[attempt].y
        );
        if (path.length > 0) {
          // Connection found!
          joinRoad = path;
          break;
        }
      }

      if (joinRoad !== null) {
        // Connect roads
        joinRoad.forEach((step) => {
          placeRoad(step.x, step.y);
        });
        // Place house
        optimalTile.setItem("HOUSE");
        optimalTile.setUpdated(true);
        houseTiles.push(optimalTile);
      } else {
        console.log("cannot place house");
        // No house placed, cannot connect location
        optimalTile.deadEnd = true;
        optimalTile.setHouseCost(Infinity);
      }
    } else {
      // optimalTile has neighbouring road.
      optimalTile.setItem("HOUSE");
      optimalTile.setUpdated(true);
      houseTiles.push(optimalTile);
    }
  }

  // Update cost gradient for houses
  updateHouseCosts(optimalTile, 5);
}

distanceFromCenter = (x, y) => {
  let xCumulative = 0;
  let yCumulative = 0;

  houseTiles.forEach((tile) => {
    xCumulative += tile.x;
    yCumulative += tile.y;
  });

  const xMean = xCumulative / houseTiles.length;
  const yMean = yCumulative / houseTiles.length;

  return Math.sqrt((x - xMean) ** 2 + (y - yMean) ** 2);

  // if (houseTiles.length > 1) {
  //   // Euclidean distance
  //   // return (Math.sqrt((x-xMean)**2 + (y-yMean)**2))

  //   // Walking distance from spot to center
  //   const centralRoads = getNeighboringRoads(
  //     world[Math.floor(xMean)][Math.floor(yMean)]
  //   );

  //   if (centralRoads.length > 0) {
  //     const path = aStarPath(x, y, centralRoads[0].x, centralRoads[0].y);
  //     return path.length > 0 ? path[path.length - 1].g : 0;
  //   } else {
  //     // Fallback to euclidean distance
  //     return Math.sqrt((x - xMean) ** 2 + (y - yMean) ** 2);
  //   }
  // } else {
  //   return 0;
  // }
};

updateHouseCosts = (source, range) => {
  // TODO Expensive, update
  // Function that creates a gradient from a given tile, with lower cost closer in travel distance from origin
  const xPos = source.x;
  const yPos = source.y;
  const xUpperBound =
    xPos + range + 1 < world.length ? xPos + range + 1 : world.length;
  const xLowerBound = xPos - range > 0 ? xPos - range : 0;
  const yUpperBound =
    yPos + range + 1 < world[0].length ? yPos + range + 1 : world[0].length;
  const yLowerBound = yPos - range > 0 ? yPos - range : 0;
  const subRegion = world
    .slice(xLowerBound, xUpperBound)
    .map((col) => col.slice(yLowerBound, yUpperBound));
  const regionDistances = dijkstra(range, range, subRegion);

  regionDistances.flat().forEach((tile) => {
    // COST IS DISTANCE TO NEAREST HOUSE PLUS DISTANCE TO CENTER OF MASS

    // Should also be distance to nearest road
    const xWorldPos = xLowerBound + tile.x;
    const yWorldPos = yLowerBound + tile.y;
    const worldTile = world[xWorldPos][yWorldPos];
    // Check if placing a house on tile will make dead end
    if (worldTile.houseCost !== Infinity && deadEnd(worldTile)) {
      worldTile.deadEnd = true;
      worldTile.setHouseCost(Infinity);
    } else if (!worldTile.deadEnd) {
      // Pretty orderly house placements, good
      // Walking cost from placed house plus euclidean distance from last placed house
      // worldTile.updateHouseCost(
      //   tile.g + Math.sqrt((tile.x - source.x)**2 + (tile.y - source.y)**2)
      // );

      // Todo, should include distance to farm plot

      // Nice, circular pattern.
      worldTile.updateHouseCost(
        tile.g + distanceFromCenter(xWorldPos, yWorldPos)
      );
    }

    // Update farm costs as well
    if (worldTile.getTravelCost() !== Infinity) {
      const neighbors = getNeighbors(worldTile, world);
      const farmNeighbors = neighbors.reduce(
        (accumulator, currentTile) =>
          currentTile.tileType === "FARM" ? accumulator + 1 : accumulator,
        1
      );
      worldTile.updateFarmCost(
        Math.log(distanceFromCenter(xWorldPos, yWorldPos)) / farmNeighbors
      );
    }
  });
};

updateFarmCosts = (source, range) => {
  // TODO Expensive, update
  // Function that creates a gradient from a given tile, with lower cost closer in travel distance from origin
  const xPos = source.x;
  const yPos = source.y;
  const xUpperBound =
    xPos + range + 1 < world.length ? xPos + range + 1 : world.length;
  const xLowerBound = xPos - range > 0 ? xPos - range : 0;
  const yUpperBound =
    yPos + range + 1 < world[0].length ? yPos + range + 1 : world[0].length;
  const yLowerBound = yPos - range > 0 ? yPos - range : 0;
  const subRegion = world
    .slice(xLowerBound, xUpperBound)
    .map((col) => col.slice(yLowerBound, yUpperBound));
  subRegion.flat().forEach((tile) => {
    if (tile.tileType === "GRASS" && tile.getTravelCost() !== Infinity) {
      const xWorldPos = xLowerBound + tile.x;
      const yWorldPos = yLowerBound + tile.y;
      const neighbors = getNeighbors(tile, world);
      const farmNeighbors = neighbors.reduce(
        (accumulator, currentTile) =>
          currentTile.tileType === "FARM" ? accumulator + 1 : accumulator,
        1
      );
      tile.updateFarmCost(
        (Math.log(distanceFromCenter(xWorldPos, yWorldPos)) / farmNeighbors) * 2
      );
    }
  });

  // distanceFromCenter(xWorldPos, yWorldPos)
};

deadEnd = (tile) => {
  // A dead end is a tile that will leave a road with nowhere else to go.
  const roads = getNeighboringRoads(tile);
  if (roads.length === 0) {
    return false;
  } else {
    // for each neighboring road tile
    // count number of inaccessible tiles
    // if they are three, including tile we're checking
    // that's a dead end
    return roads
      .map((roadTile) =>
        getNeighbors(roadTile, world).reduce((accumulator, currentTile) => {
          if (
            currentTile === tile ||
            currentTile.getTravelCost() === Infinity
          ) {
            return accumulator + 1;
          } else {
            return accumulator;
          }
        }, 0)
      )
      .some((blockedTiles) => blockedTiles >= 3);
  }
};

let ignoreHousesHoverPath = false;
// Controls:
// h = build single house
// | = hoverpath ignores houses
// 1 = build path on hover click
keyPressed = () => {
  if (keyCode === 72) {
    renderWorld();
    buildHouse();
  }
  if (keyCode === 172) {
    ignoreHousesHoverPath = !ignoreHousesHoverPath;
  }
  if (keyCode === 49) {
    layRoad = true;
  }
};

getNeighboringRoads = (tile) => {
  return getNeighbors(tile, world).filter((tile) => tile.tileType === "ROAD");
};

function aStarPath(x1, y1, x2, y2, ignoreItems = false) {
  return aStar(x1, y1, x2, y2, world, ignoreItems);
}

let showRoads = false;
let startA = 0;
let startB = 0;
let layRoad = false;

registerClick = () => {
  showRoads = !showRoads;
  if (showRoads) {
    startA = floor(mouseX / tileSize);
    startB = floor(mouseY / tileSize);
    world[startA][startB].indicator = "S";
  } else {
    path.map((tile) => {
      tile.indicator = "";
      if (layRoad) {
        tile.setTileType("ROAD");
        roadTiles.push(tile);
      }
      tile.updated = true;
    });
    oldPath.map((tile) => {
      tile.indicator = "";
      tile.updated = true;
    });
    world[startA][startB].indicator = "";
    world[startA][startB].updated = true;
    layRoad = false;
  }
};

removeHouse = (tile) => {
  tile.setItem(null);
  tile.setUpdated(true);
  const index = houseTiles.find((hTile) => hTile === tile);
  houseTiles.splice(index, 1);
};

randomRoadRebalance = (utilityThreshold) => {
  // Take two random points of road
  const a = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  let b = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  while (b === a) {
    b = roadTiles[Math.round(Math.random() * (roadTiles.length - 1))];
  }

  // Find distance between them
  const path = aStarPath(a.x, a.y, b.x, b.y);
  let standardDistance = 0;
  try {
    standardDistance = path[path.length - 1].g;
  } catch (error) {
    console.log("----------");

    console.log(a.x, a.y, b.x, b.y);

    console.log(path);
  }

  // Find distance between them, ignoring houses
  const noHousePath = aStarPath(a.x, a.y, b.x, b.y, true);
  const noHouseDistance = noHousePath[noHousePath.length - 1].g;

  // Number of houses in no house path
  const housesInPath = noHousePath.reduce(
    (acc, tile) => (world[tile.x][tile.y].item === "HOUSE" ? acc + 1 : acc),
    0
  );

  // Compare costs, see if utility is good enough
  if (standardDistance - noHouseDistance / housesInPath > utilityThreshold) {
    // If utility is good enough, tear down some houses and create that road.
    noHousePath.forEach((step) => {
      const tile = world[step.x][step.y];
      if (tile.item === "HOUSE") {
        removeHouse(tile);
      }

      if (tile.tileType !== "ROAD") {
        placeRoad(step.x, step.y);
      }
    });
  }
};

createVillage = (numHouses, farms, farmsPerHouse) => {
  for (let houseNum = 0; houseNum < numHouses; houseNum++) {
    buildHouse();
    while (farms && farmTiles.length / houseTiles.length <= farmsPerHouse) {
      // If we're building farms and there are not enough of them already, place some more.'
      placeFarm();
    }

    if (houseNum > 0 && houseNum % 50 === 0) {
      // Improve road network every n times
      // Improve a number of roads while we're at it
      for (let times = 0; times < 20; times++) {
        randomRoadRebalance(5);
      }
    }
  }
};

// ---------------------------------Standards---------------------------------
function preload() {
  iconIMG = {
    HILL: loadImage("/hill.png"),
    HOUSE: loadImage("/house.png"),
    TREE: "",
  };
}

function setup() {
  cnv = createCanvas(worldWidth * tileSize, worldHeight * tileSize);
  cnv.mouseClicked(registerClick);
  noiseDetail(2, 0.1);
  noiseSeed(frameNum);
  pixelDensity(1);
  world = worldGen(worldWidth, worldHeight);
  renderWorld();
}

drawPath = (x, y, x1, y1) => {
  aStarPath(x, y, x1, y1).forEach((step) => {
    placeRoad(step.x, step.y);
  });
};

drawMousePosition = () => {
  color(tileType["WATER"]);
  rect(0, 5, 40, 20);
  color(0);
  text(
    "(" + floor(mouseX / tileSize) + "," + floor(mouseY / tileSize) + ")",
    0,
    20
  );
  rect(
    0,
    worldHeight * tileSize - 10,
    worldWidth * tileSize,
    worldHeight * tileSize
  );
}

drawMousePointer = () => {
  const xMouseTile = floor(mouseX / tileSize);
  const yMouseTile = floor(mouseY / tileSize);
  if (
    !(xMouseTile > world.length - 1) &&
    !(yMouseTile > world[0].length - 1)
  ) {
    const tile = world[xMouseTile][yMouseTile];
    tile.indicator = "O";
    tile.setUpdated(true);
  }
}

drawMouseTrail = () => {
  if (showRoads) {
    if (
      endA !== floor(mouseX / tileSize) ||
      endB !== floor(mouseY / tileSize)
    ) {
      // Mouse moved, find new path
      
      endA = floor(mouseX / tileSize);
      endB = floor(mouseY / tileSize);
      path = aStarPath(startA, startB, endA, endB, ignoreHousesHoverPath).map(
        (step) => world[step.x][step.y]
      );

      path.forEach(tile => {
        tile.indicator = "X";
        tile.setUpdated(true);
      });

      world[startA][startB].indicator = "S";
      world[startA][startB].setUpdated(true);

    } else {
      path.forEach(tile => {
        tile.indicator = "X";
        tile.setUpdated(true);
      });

      world[startA][startB].indicator = "S";
      world[startA][startB].setUpdated(true);
    }
  }
}

let path = [];
let oldPath = [];
let hover = null;
let pause = true;
let endA = 0;
let endB = 0;

function draw() {
  drawMousePosition();
  drawMousePointer();
  drawMouseTrail();
  if (
    floor(mouseX) / tileSize < 0 ||
    floor(mouseY / tileSize) < 0 ||
    floor(mouseX) / tileSize > world.length - 1 ||
    floor(mouseY / tileSize) > world[0].length - 1
  ) {
  } else {
    const t = world[floor(mouseX / tileSize)][floor(mouseY / tileSize)];
    text(
      layRoad && showRoads
        ? "PLACING ROAD! "
        : "" +
            houseTiles.length +
            " houses" +
            ", t: " +
            t.tileType +
            (t.item !== null ? ", item: " + t.item : "") +
            ", hCost:" +
            Math.round(t.houseCost) +
            ", tCost:" +
            Math.round(t.getTravelCost()) +
            ", fCost:" +
            Math.round(t.farmCost) +
            (t.deadEnd ? ", dead-end" : ""),
      0,
      worldHeight * tileSize
    );
  }

  // draw houses/ farms
  // update world
  frameNum++;

  if (!pause && frameNum % 10 === 0) {
    buildHouse();
  }

  if (showRoads) {
    if (
      endA !== floor(mouseX / tileSize) ||
      endB !== floor(mouseY / tileSize)
    ) {
      endA = floor(mouseX / tileSize);
      endB = floor(mouseY / tileSize);
      path = aStarPath(startA, startB, endA, endB, ignoreHousesHoverPath).map(
        (step) => world[step.x][step.y]
      );
      path.map((tile) => (tile.indicator = "X"));
      world[startA][startB].indicator = "S";
      oldPath.map((tile) => {
        if (!path.includes(tile)) {
          tile.indicator = "";
          tile.setUpdated(true);
        }
      });

      oldPath = path;
    }
  }

  try {
    if (
      floor(mouseX / tileSize) < world.length &&
      floor(mouseY / tileSize) < world[0].length &&
      hover !== world[floor(mouseX / tileSize)][floor(mouseY / tileSize)]
    ) {
      hover.indicator = "";
      hover.setUpdated(true);
      hover = world[floor(mouseX / tileSize)][floor(mouseY / tileSize)];
      hover.indicator = "O";
      hover.setUpdated(true);
    }
  } catch (error) {
    hover = null;
  }
  renderWorld();
  // renderItems();
  if (hover !== null && hover.indicator !== "X") {
    hover.indicator = "";
    hover.updated = true;
  }

  // if (frameNum % 5 === 0) {
  //   noiseSeed(frameNum);
  //   world = worldGen(worldWidth, worldHeight);

  //   renderWorld()
  // }
}
