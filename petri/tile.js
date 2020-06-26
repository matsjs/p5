const tileTypeCost = {
  GRASS: 0,
  SAND: 1,
  WATER: Infinity,
  MOUNTAIN: 10,
  SNOW: Infinity,
  FARM: 20,
  ROAD: Infinity,
};

class Tile {
  constructor (tileType, x, y, item=null) {
    this.tileType = tileType;
    this.x = x;
    this.y = y;
    this.item = item;
    this.houseCost = tileTypeCost[tileType];
  }

  setItem = (item) => {
    this.item = item;
    if (item === "HOUSE") {
      this.houseCost = Infinity;
    }
  }

  distance = (other) => {
    if (other instanceof Tile) {
      return Math.sqrt((self.x-other.x)**2 + (self.y-other.y)**2)
    } else {
      return Infinity
    }
  }
}