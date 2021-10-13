// class CanvasDisplay {
//   constructor(parent) {
//     this.canvas = document.createElement("canvas");
//     this.width = 400;
//     this.height = 400;
//     this.canvas.width = this.width; //window.innerWidth;
//     this.canvas.height = this.height; //window.innerHeight;
//     this.boxWidth = 10;
//     parent.appendChild(this.canvas);
//     this.ctx = this.canvas.getContext("2d");
//   }
//   clear() {
//     this.canvas.remove();
//   }
//   resizeDisplay() {
//     //todo implement the functionality
//   }
//   syncState(state) {
//     this.ctx.clearRect(0, 0, this.width, this.height);
//     this.ctx.strokeStyle = "#003049";
//     this.ctx.fillStyle = "#003049";
//     const cellSize = this.boxWidth;
//     state.grid.forEach((rows, i) => {
//       rows.forEach((cell, j) => {
//         if (!cell)
//           this.ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
//         else this.ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
//       });
//     });
//   }
// }

// class State {
//   constructor(display, grid, cellSize) {
//     if (grid) {
//       this.rows = grid.length;
//       this.columns = grid[0].length;
//       this.cellWidth = cellSize;
//       this.grid = grid;
//       return;
//     }
//     this.rows = Math.floor(display.height / display.boxWidth);
//     this.columns = Math.floor(display.width / display.boxWidth);
//     this.cellWidth = display.boxWidth;
//     this.grid = Array.from(new Array(this.columns).keys()).map((_) =>
//       Array.from(new Array(this.rows).keys()).map((_) => 0)
//     );
//   }
//   updateState(event) {
//     const x = Math.floor(event.offsetX / this.cellWidth);
//     const y = Math.floor(event.offsetY / this.cellWidth);
//     this.grid[y][x] = 1;
//     return new State(null, this.grid, this.cellWidth);
//   }
//   proceedToNextGeneration() {
//     console.log(this);

//     function countLiveNeighbors(x, y, grid) {
//       let count = 0;
//       for (
//         let i = Math.max(0, x - 1);
//         i <= Math.min(grid.rows - 1, x + 1);
//         i++
//       ) {
//         for (
//           let j = Math.max(0, y - 1);
//           j <= Math.min(grid.columns - 1, y + 1);
//           j++
//         ) {
//           if (grid[i][j] === 0 || (i === x && j === y)) continue;
//           count++;
//         }
//       }
//       return count;
//     }

//     const newGrid = Array.from(this.grid);
//     for (let i = 0; i < this.rows; i++) {
//       for (let j = 0; j < this.columns; j++) {
//         const neighbors = countLiveNeighbors(i, j, this.grid);
//         if (neighbors < 2 || neighbors > 3) newGrid[i][j] = 0;
//         else if (neighbors === 2) newGrid[i][j] = this.grid[i][j];
//         else newGrid[i][j] = 1;
//       }
//     }

//     this.grid = newGrid;
//     return new State(null, newGrid, this.cellWidth);
//   }
// }

// // function init() {
// const parent = document.querySelector(".parent");
// const display = new CanvasDisplay(parent);
// let state = new State(display);
// display.syncState(state);
// display.canvas.addEventListener("mousedown", handleMouseDown);
// function handleMouseDown(event) {
//   state = state.updateState(event);
//   display.syncState(state);
// }
// console.log(state);

// const startButton = document.querySelector("#start");
// startButton.addEventListener("click", () => {
//   console.log(state);
//   state = state.proceedToNextGeneration();
//   display.syncState(state);
// });
// function startSimulation(event) {}
// // }

// // window.addEventListener("DOMContentLoaded", init);
// // ============Rules================
// // 1. Any live cell with fewer than 2 or more than 3 live neighbors dies
// // 2. Any live cell with 2 or 3 live neighbors lives
// // 3. Any dead cell with exactly 3 live neighbors becomes alive

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const boxWidth = 10;
let canvasWidth =
  Math.floor((window.innerWidth - 20 * 2) / boxWidth) * boxWidth;
let canvasHeight =
  Math.floor(Math.min(400, window.innerHeight - 20 * 2) / boxWidth) * boxWidth;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let numberOfHorizontalBox = Math.floor(canvasWidth / boxWidth);
let numberOfVerticalBox = Math.floor(canvasHeight / boxWidth);

let table = Array.from(new Array(numberOfHorizontalBox).keys()).map((_) =>
  Array.from(new Array(numberOfVerticalBox).keys()).map((_) => 0)
);

const startButton = document.querySelector(".start");
const stopButton = document.querySelector(".stop");
const clearButton = document.querySelector(".clear");
const slider = document.querySelector("#range");

const timeoutValue = document.querySelector(".range-value");

window.addEventListener("resize", (event) => {
  canvasWidth =
    Math.floor((event.currentTarget.innerWidth - 20 * 2) / boxWidth) * boxWidth;
  canvas.width = canvasWidth;
  numberOfHorizontalBox = Math.floor(canvasWidth / boxWidth);
  clear();
});

let running = null;
let painting = false;
let timeout = slider.value;
let cellColor = "#d62828";

slider.addEventListener("input", (event) => {
  timeout = event.target.value * 50;
  timeoutValue.innerText = timeout + "s";
  if (running) {
    clearInterval(running);
    running = setInterval(startSimulation, timeout);
  }
});

function startSimulation() {
  draw(nextGeneration(table));
  table = nextGeneration(table);
}

startButton.addEventListener("click", (event) => {
  if (running) return;

  running = setInterval(startSimulation, timeout);
  startButton.disabled = true;
  stopButton.disabled = false;
});

stopButton.addEventListener("click", (event) => {
  if (!running) return;
  clearInterval(running);
  running = null;
  startButton.disabled = false;
  stopButton.disabled = true;
});

function clear() {
  table = Array.from(new Array(numberOfHorizontalBox).keys()).map((_) =>
    Array.from(new Array(numberOfVerticalBox).keys()).map((_) => 0)
  );
  draw(table);
  clearInterval(running);
  running = null;
  startButton.disabled = false;
  stopButton.disabled = true;
}

clearButton.addEventListener("click", clear);

canvas.addEventListener("mousedown", (event) => {
  painting = true;
  const x = Math.floor(event.offsetX / boxWidth);
  const y = Math.floor(event.offsetY / boxWidth);
  table[y][x] = 1;
  draw(table);
});

canvas.addEventListener("mousemove", (event) => {
  if (!painting) return;
  const x = Math.floor(event.offsetX / boxWidth);
  const y = Math.floor(event.offsetY / boxWidth);
  table[y][x] = 1;
  draw(table);
});

canvas.addEventListener("mouseup", (event) => {
  painting = false;
});

function draw(arr) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = cellColor;
  arr.forEach((array, i) => {
    array.forEach((element, j) => {
      if (element) ctx.fillRect(j * boxWidth, i * boxWidth, boxWidth, boxWidth);
    });
  });
}

function countLiveNeighbors(x, y, table) {
  let count = 0;
  for (
    let i = Math.max(0, x - 1);
    i <= Math.min(numberOfVerticalBox - 1, x + 1);
    i++
  ) {
    for (
      let j = Math.max(0, y - 1);
      j <= Math.min(numberOfHorizontalBox - 1, y + 1);
      j++
    ) {
      if (table[i][j] === 0 || (i === x && j === y)) continue;
      count++;
    }
  }
  return count;
}

function nextGeneration(table) {
  const grid = Array.from(new Array(numberOfHorizontalBox).keys()).map((_) =>
    Array.from(new Array(numberOfVerticalBox).keys()).map((_) => 0)
  );
  for (let i = 0; i < numberOfVerticalBox; i++) {
    for (let j = 0; j < numberOfHorizontalBox; j++) {
      const neighbors = countLiveNeighbors(i, j, table);
      if (neighbors < 2 || neighbors > 3) grid[i][j] = 0;
      else if (neighbors === 2) grid[i][j] = table[i][j];
      else grid[i][j] = 1;
    }
  }
  return grid;
}

draw(table);
