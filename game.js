class CanvasDisplay {
  constructor(parent) {
    this.canvas = document.createElement("canvas");
    this.width = 400;
    this.height = 400;
    this.canvas.width = this.width; //window.innerWidth;
    this.canvas.height = this.height; //window.innerHeight;
    this.boxWidth = 10;
    parent.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
  }
  clear() {
    this.canvas.remove();
  }
  resizeDisplay() {
    //todo implement the functionality
  }
  syncState(state) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = "#003049";
    this.ctx.fillStyle = "#003049";
    const cellSize = this.boxWidth;
    state.grid.forEach((rows, i) => {
      rows.forEach((cell, j) => {
        if (cell)
          this.ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });
  }
}

class State {
  constructor(grid, cellSize) {
    this.rows = grid.length;
    this.columns = grid[0].length;
    this.cellWidth = cellSize;
    this.grid = grid;
  }
  static fromDisplay(display) {
    const rows = Math.floor(display.height / display.boxWidth);
    const columns = Math.floor(display.width / display.boxWidth);
    const cellWidth = display.boxWidth;
    const grid = Array.from(new Array(columns).keys()).map((_) =>
      Array.from(new Array(rows).keys()).map((_) => 0)
    );
    return new State(grid, cellWidth);
  }
  updateState(event) {
    event.preventDefault();
    let x, y;
    //todo use regex like this - /touch/.exec(event.type)
    if (event.type === "touchstart" || event.type === "touchmove") {
      x = Math.floor((event.touches[0].clientX - 20) / this.cellWidth);
      y = Math.floor((event.touches[0].clientY - 20) / this.cellWidth);
    } else {
      x = Math.floor(event.offsetX / this.cellWidth);
      y = Math.floor(event.offsetY / this.cellWidth);
    }
    const grid = this.grid.map((rows) => rows.map((cols) => cols));
    grid[y][x] = 1;
    return new State(grid, this.cellWidth);
  }
  _countLiveNeighbors(x, y) {
    let count = 0;
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        let row = i < 0 ? this.rows - 1 : i >= this.rows ? 0 : i;
        let col = j < 0 ? this.columns - 1 : j >= this.columns ? 0 : j;
        if (this.grid[row][col] === 0 || (i === x && j === y)) continue;
        count++;
        // sum += this.grid[row][col];
      }
    }
    // return { count, color: Math.round(sum / count) };
    return count;
  }
  proceedToNextGeneration() {
    const grid = Array.from(new Array(this.columns).keys()).map((_) =>
      Array.from(new Array(this.rows).keys()).map((_) => 0)
    );
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const neighbors = this._countLiveNeighbors(i, j);
        if (neighbors < 2 || neighbors > 3) grid[i][j] = 0;
        else if (neighbors === 2) grid[i][j] = this.grid[i][j];
        else grid[i][j] = 1;
      }
    }
    return new State(grid, this.cellWidth);
  }
}

const init = () => {
  const parent = document.querySelector(".parent");
  const startButton = document.querySelector(".start");
  const stopButton = document.querySelector(".stop");
  const clearButton = document.querySelector(".clear");
  const nextButton = document.querySelector(".next");
  const slider = document.querySelector("#range");

  let painting = false;
  let running = null;
  let timeout = slider.value * 50;

  //! Not a closure but a pure function
  const updateAndSyncState = (event, currentState, canvasDisplay) => {
    const state = currentState.updateState(event);
    canvasDisplay.syncState(state);
    return state;
  };

  const simulate = () => {
    state = state.proceedToNextGeneration();
    display.syncState(state);
  };

  const display = new CanvasDisplay(parent);
  let state = State.fromDisplay(display);
  display.syncState(state);

  //! Beware Closure but Not a pure function
  const startPopulatingGrid = (event) => {
    painting = true;
    state = updateAndSyncState(event, state, display);
  };

  const populateGrid = (event) => {
    if (!painting) return;
    state = updateAndSyncState(event, state, display);
  };

  const stopDrawing = (event) => {
    event.preventDefault();
    painting = false;
  };

  display.canvas.addEventListener("mousedown", startPopulatingGrid);
  display.canvas.addEventListener("mousemove", populateGrid);
  display.canvas.addEventListener("mouseup", stopDrawing);

  display.canvas.addEventListener("touchstart", startPopulatingGrid);
  display.canvas.addEventListener("touchmove", populateGrid);
  display.canvas.addEventListener("touchend", stopDrawing);
  display.canvas.addEventListener("touchcancel", stopDrawing);

  startButton.addEventListener("click", () => {
    if (running) return;
    running = setInterval(simulate, timeout);
    startButton.disabled = true;
    stopButton.disabled = false;
  });
  stopButton.addEventListener("click", () => {
    if (!running) return;
    clearInterval(running);
    running = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  });
  clearButton.addEventListener("click", () => {
    state = State.fromDisplay(display);
    display.syncState(state);
    clearInterval(running);
    running = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  });
  nextButton.addEventListener("click", simulate);
};

window.addEventListener("DOMContentLoaded", init);

function startSimulation(event) {}

//! ============Rules================
//* 1. Any live cell with fewer than 2 or more than 3 live neighbors dies
//* 2. Any live cell with 2 or 3 live neighbors lives
//* 3. Any dead cell with exactly 3 live neighbors becomes alive

//todo follow these steps for easing the canvas frames
// link => https://css-tricks.com/easing-animations-in-canvas/

// const cellSizeInput = document.querySelector("#cell-size");
// const cellColorInput = document.querySelector("#cell-color");
// const bgColorInput = document.querySelector("#bg-color");

// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");
// let bgColor = bgColorInput.value;
// let boxWidth = parseInt(cellSizeInput.value);
// let canvasWidth;
// if (window.innerWidth > 768) {
//   canvasWidth =
//     Math.floor((window.innerWidth - 20 * 2 - 300) / boxWidth) * boxWidth;
// } else {
//   canvasWidth = Math.floor((window.innerWidth - 20 * 2) / boxWidth) * boxWidth;
// }
// let canvasHeight =
//   Math.floor((window.innerHeight * 0.75 - 20 * 2) / boxWidth) * boxWidth;
// canvas.width = canvasWidth;
// canvas.height = canvasHeight;
// let numberOfHorizontalBoxes = Math.floor(canvasWidth / boxWidth);
// let numberOfVerticalBoxes = Math.floor(canvasHeight / boxWidth);

// bgColorInput.addEventListener("change", (event) => {
//   bgColor = event.target.value;
//   draw(table);
// });

// cellSizeInput.addEventListener("change", (event) => {
//   clear();
//   boxWidth = parseInt(event.target.value);
//   if (window.innerWidth > 768) {
//     canvasWidth =
//       Math.floor((window.innerWidth - 20 * 2 - 300) / boxWidth) * boxWidth;
//   } else {
//     canvasWidth =
//       Math.floor((window.innerWidth - 20 * 2) / boxWidth) * boxWidth;
//   }
//   canvasHeight =
//     Math.floor((window.innerHeight * 0.75 - 20 * 2) / boxWidth) * boxWidth;
//   canvas.width = canvasWidth;
//   canvas.height = canvasHeight;
//   numberOfHorizontalBoxes = Math.floor(canvasWidth / boxWidth);
//   numberOfVerticalBoxes = Math.floor(canvasHeight / boxWidth);
//   table = generateEmptyGrid();
//   draw(table);
// });

// function generateEmptyGrid() {
//   return Array.from(new Array(numberOfVerticalBoxes).keys()).map((_) =>
//     Array.from(new Array(numberOfHorizontalBoxes).keys()).map((_) => 0)
//   );
// }

// let table = generateEmptyGrid();

// const startButton = document.querySelector(".start");
// const stopButton = document.querySelector(".stop");
// const clearButton = document.querySelector(".clear");
// const nextButton = document.querySelector(".next");
// const slider = document.querySelector("#range");

// const timeoutValue = document.querySelector(".range-value");

// window.addEventListener("resize", (event) => {
//   const windowWidth = event.currentTarget.innerWidth;
//   if (windowWidth > 768) {
//     canvasWidth =
//       Math.floor((windowWidth - 20 * 2 - 300) / boxWidth) * boxWidth;
//   } else {
//     canvasWidth = Math.floor((windowWidth - 20 * 2) / boxWidth) * boxWidth;
//   }
//   canvasHeight =
//     Math.floor((event.currentTarget.innerHeight * 0.75 - 20 * 2) / boxWidth) *
//     boxWidth;
//   canvas.width = canvasWidth;
//   canvas.height = canvasHeight;
//   numberOfHorizontalBoxes = Math.floor(canvasWidth / boxWidth);
//   numberOfVerticalBoxes = Math.floor(canvasHeight / boxWidth);
//   clear();
// });

// let running = null;
// let painting = false;
// let timeout = slider.value * 50;
// let cellColors = [];
// cellColors.push(cellColorInput.value);
// let pointer = 0;

// cellColorInput.addEventListener("change", (event) => {
//   cellColors.push(event.target.value);
//   pointer++;
// });

// slider.addEventListener("input", (event) => {
//   timeout = event.target.value * 50;
//   timeoutValue.innerText = timeout + "ms";
//   if (running) {
//     clearInterval(running);
//     running = setInterval(startSimulation, timeout);
//   }
// });

// function startSimulation() {
//   table = nextGeneration(table);
//   draw(table);
// }

// startButton.addEventListener("click", (event) => {
//   if (running) return;

//   running = setInterval(startSimulation, timeout);
//   startButton.disabled = true;
//   stopButton.disabled = false;
// });

// stopButton.addEventListener("click", (event) => {
//   if (!running) return;
//   clearInterval(running);
//   running = null;
//   startButton.disabled = false;
//   stopButton.disabled = true;
// });

// function clear() {
//   table = generateEmptyGrid();
//   draw(table);
//   clearInterval(running);
//   running = null;
//   startButton.disabled = false;
//   stopButton.disabled = true;
// }

// clearButton.addEventListener("click", clear);
// nextButton.addEventListener("click", (event) => {
//   table = nextGeneration(table);
//   draw(table);
// });

//
// canvas.addEventListener("touchstart", startPopulatingGrid);
// canvas.addEventListener("touchmove", populateGrid);
// canvas.addEventListener("touchend", stopDrawing);
// canvas.addEventListener("touchcancel", stopDrawing);
// canvas.addEventListener("mousedown", startPopulatingGrid);
// canvas.addEventListener("mousemove", populateGrid);
// canvas.addEventListener("mouseup", stopDrawing);

// function draw(arr) {
//   ctx.fillStyle = bgColor;
//   ctx.fillRect(0, 0, canvasWidth, canvasHeight);
//   arr.forEach((array, i) => {
//     array.forEach((element, j) => {
//       ctx.fillStyle = cellColors[Math.max(element - 1, 0)];
//       if (element) ctx.fillRect(j * boxWidth, i * boxWidth, boxWidth, boxWidth);
//     });
//   });
// }

// function countLiveNeighbors(x, y, table) {
//   let count = 0;
//   let sum = 0;
//   for (let i = x - 1; i <= x + 1; i++) {
//     for (let j = y - 1; j <= y + 1; j++) {
//       let row =
//         i < 0 ? numberOfVerticalBoxes - 1 : i >= numberOfVerticalBoxes ? 0 : i;
//       let col =
//         j < 0
//           ? numberOfHorizontalBoxes - 1
//           : j >= numberOfHorizontalBoxes
//           ? 0
//           : j;
//       // console.log(row, col);
//       if (table[row][col] === 0 || (i === x && j === y)) continue;
//       count++;
//       sum += table[row][col];
//     }
//   }
//   return { count, color: Math.round(sum / count) };
// }

// function nextGeneration(table) {
//   let grid = generateEmptyGrid();
//   for (let i = 0; i < numberOfVerticalBoxes; i++) {
//     for (let j = 0; j < numberOfHorizontalBoxes; j++) {
//       const neighbors = countLiveNeighbors(i, j, table);
//       const numOfNeighbors = neighbors.count;
//       if (numOfNeighbors < 2 || numOfNeighbors > 3) grid[i][j] = 0;
//       else if (numOfNeighbors === 2) grid[i][j] = table[i][j];
//       //todo need to plan the color swaps
//       else grid[i][j] = neighbors.color;
//     }
//   }
//   return grid;
// }

// draw(table);
