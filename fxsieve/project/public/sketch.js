

const tiles = [];
const tileImages = [];

// Current state of the grid
let grid = [];

// Width and height of each cell
const DIM = 35;


const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58ToNumber(base58Str) {
  let number = 0;
  for (let i = 0; i < fxhash.length; i++) {
    const char = base58Str[i];
    const charValue = base58Chars.indexOf(char);
    if (charValue < 0) {
      throw new Error(`Invalid character for Base58 encoding: ${char}`);
    }
    number = Math.floor(number * 58 + charValue) % 4294967296;
  }
  return number;
}
const seeded = base58ToNumber(fxhash) / 100000000;
const floored = Math.floor(seeded);




function hashState(grid) {
  // Serialize the state into a string.
  let stateString = '';
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].options.length; j++) {
      stateString += grid[i].options[j];
    }
  }

  // Convert to Base64 as a simple form of "hashing"
  let hash = btoa(stateString);

  // Some characters in a base64 string aren't URL-safe, so replace them with URL-safe characters.
  hash = hash.replace(/\+/g, '-');
  hash = hash.replace(/\//g, '_');
  hash = hash.replace(/=/g, '');

  return hash;
}

function createImageFromArray(array) {
  const width = array[0].length;
  const height = array.length;

  const buffer = createGraphics(width, height);
  buffer.pixelDensity(1); // Ensure one-to-one mapping between array and pixels

  buffer.loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixelValue = array[y][x];
      const grayscaleValue = map(pixelValue, 0, 3, 0, 255);
      let col;

      if (grayscaleValue === 0) {
        // If grayscaleValue is 0 (black), make it fully transparent
        col = color(0, 0, 0, 0);
      } else {
        // Otherwise, make it grayscale with no transparency
        col = color(255, 255, 255, 0);
      }

      buffer.set(x, y, col);
    }
  }

  buffer.updatePixels();

  const image = buffer.get();
  return image;
}


function preload() {
  const pgmArrays = [
    [[0, 0, 0], [0, 0, 0], [0, 0, 0]], //0
    [[3, 3, 3], [3, 3, 3], [3, 3, 3]], //1
    [[3, 3, 3], [3, 1, 0], [3, 3, 3]], //3    
    [[3, 3, 3], [1, 1, 1], [3, 3, 3]], //4
    [[0, 3, 3], [0, 1, 0], [0, 3, 3]], //5
    [[0, 3, 3], [3, 3, 3], [3, 3, 3]], //6
    [[3, 3, 3], [0, 0, 0], [3, 3, 3]], //7
    [[3, 1, 3], [0, 1, 0], [3, 1, 3]], //8
    [[3, 1, 3], [3, 1, 3], [3, 0, 3]], //9
    [[3, 0, 3], [0, 0, 0], [3, 3, 3]], //00
    [[3, 0, 3], [0, 3, 0], [3, 0, 3]], //00
    [[3, 0, 3], [3, 3, 0], [3, 3, 3]], //01
    [[3, 3, 3], [0, 1, 0], [3, 3, 3]], //03
  ];

  for (let i = 0; i < pgmArrays.length; i++) {
    tileImages[i] = createImageFromArray(pgmArrays[i]);
  }
}





function setup() {
  fxpreview();
  const c = createCanvas(innerWidth, innerHeight, WEBGL ^ 2);

  c.id('p5canvas'); // Give the p5 canvas an ID for positioning
  // Create and label the tiles
  tiles[0] = new Tile(tileImages[0], ["AAA", "AAA", "AAA", "AAA"]);
  tiles[1] = new Tile(tileImages[1], ["BBB", "BBB", "BBB", "BBB"]);
  tiles[2] = new Tile(tileImages[2], ["BBB", "BCB", "BBB", "BBB"]);
  tiles[3] = new Tile(tileImages[3], ["BBB", "BDB", "BBB", "BDB"]);
  tiles[4] = new Tile(tileImages[4], ["ABB", "BCB", "BBA", "AAA"]);
  tiles[5] = new Tile(tileImages[5], ["ABB", "BBB", "BBB", "BBA"]);
  tiles[6] = new Tile(tileImages[6], ["BBB", "BCB", "BBB", "BCB"]);
  tiles[7] = new Tile(tileImages[7], ["BDB", "BCB", "BDB", "BCB"]);
  tiles[8] = new Tile(tileImages[8], ["BDB", "BBB", "BCB", "BBB"]);
  tiles[9] = new Tile(tileImages[9], ["BCB", "BCB", "BBB", "BCB"]);
  tiles[10] = new Tile(tileImages[10], ["BCB", "BCB", "BCB", "BCB"]);
  tiles[11] = new Tile(tileImages[11], ["BCB", "BCB", "BBB", "BBB"]);
  tiles[12] = new Tile(tileImages[12], ["BBB", "BCB", "BBB", "BCB"]);

  // Rotate tiles
  // TODO: eliminate redundancy
  for (let i = 2; i < 14; i++) {
    for (let j = 1; j < 4; j++) {
      tiles.push(tiles[i].rotate(j));
    }
  }

  // Generate the adjacency rules based on edges
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    tile.analyze(tiles);
  }

  // Start over
  startOver();
}

function startOver() {
  // Create cell for each spot on the grid
  for (let i = 0; i < DIM * DIM; i++) {
    grid[i] = new Cell(tiles.length);
  }
}

// Check if any element in arr is in valid, e.g.
// VALID: [0, 2]
// ARR: [0, 1, 2, 3, 4]
// result in removing 1, 3, 4
// Could use filter()!
function checkValid(arr, valid) {
  for (let i = arr.length - 1; i >= 0; i--) {
    let element = arr[i];
    if (!valid.includes(element)) {
      arr.splice(i, 1);
    }
  }
}

function draw() {
  background(0, 0, 0, 0);
  clear();


  
  function draw() {
    // Iterate over each nested grid
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const nestedGrid = nestedGrids[i][j];

        // Update the nested grid in the nestedGrids array
        nestedGrids[i][j] = nextNestedGrid;
      }
    }
  }

  // Draw the grid
  const w = width / DIM;
  const h = height / DIM;
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let cell = grid[i + j * DIM];
      if (cell.collapsed) {
        let index = cell.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
      } else {
        fill(0);
        stroke(0);
        rect(i * w, j * h, w, h);
        rotate(Math.PI / 2);
      }
    }
  }


  // Make a copy of grid
  let gridCopy = grid.slice();
  // Remove any collapsed cells
  gridCopy = gridCopy.filter((a) => !a.collapsed);

  // The algorithm has completed if everything is collapsed
  if (grid.length == 0) {
    return;
  }

  // Pick a cell with least entropy

  // Sort by entropy
  gridCopy.sort((a, b) => {
    return a.options.length - b.options.length;
  });

  // Keep only the lowest entropy cells
  let len = gridCopy[0].options.length;
  let stopIndex = 0;
  for (let i = 1; i < gridCopy.length; i++) {
    if (gridCopy[i].options.length > len) {
      stopIndex = i;
      break;
    }
  }
  if (stopIndex > 0) gridCopy.splice(stopIndex);


  // Collapse a cell

  const cell = random(gridCopy);
  cell.collapsed = true;
  const pick = random(cell.options);
  if (pick === undefined) {
    startOver();
    return;
  }
  cell.options = [pick];

  // Calculate entropy
  const nextGrid = [];
  for (let j = 0; j < DIM; j++) {
    for (let i = 0; i < DIM; i++) {
      let index = i + j * DIM;
      if (grid[index].collapsed) {
        nextGrid[index] = grid[index];
      } else {
        let options = new Array(tiles.length).fill(0).map((x, i) => i);
        // Look up
        if (j > 0) {
          let up = grid[i + (j - 1) * DIM];
          let validOptions = [];
          for (let option of up.options) {
            let valid = tiles[option].down;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look right
        if (i < DIM - 1) {
          let right = grid[i + 1 + j * DIM];
          let validOptions = [];
          for (let option of right.options) {
            let valid = tiles[option].left;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look down
        if (j < DIM - 1) {
          let down = grid[i + (j + 1) * DIM];
          let validOptions = [];
          for (let option of down.options) {
            let valid = tiles[option].up;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }
        // Look left
        if (i > 0) {
          let left = grid[i - 1 + j * DIM];
          let validOptions = [];
          for (let option of left.options) {
            let valid = tiles[option].right;
            validOptions = validOptions.concat(valid);
          }
          checkValid(options, validOptions);
        }

        // I could immediately collapse if only one option left?
        nextGrid[index] = new Cell(options);
      }
    }
  }

  // Check if all cells have collapsed
  if (grid.every(cell => cell.collapsed)) {
    // If so, generate a hash of the current grid state and print it
    let hash = hashState(grid);
    console.log(hash);
  }

  // Check if more than 50% of the cells have collapsed
  let collapsedCells = grid.filter(cell => cell.collapsed);
  if (collapsedCells.length > (grid.length /4)) {
    startOver();
    return;
  }

  grid = nextGrid;
}
