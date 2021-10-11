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
        if (!cell)
          this.ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        else this.ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });
  }
}

class State {
  constructor(display, grid, cellSize) {
    if (grid) {
      this.rows = grid.length;
      this.columns = grid[0].length;
      this.cellWidth = cellSize;
      this.grid = grid;
      return;
    }
    this.rows = Math.floor(display.height / display.boxWidth);
    this.columns = Math.floor(display.width / display.boxWidth);
    this.cellWidth = display.boxWidth;
    this.grid = Array.from(new Array(this.columns).keys()).map((_) =>
      Array.from(new Array(this.rows).keys()).map((_) => 0)
    );
  }
  updateState(event) {
    const x = Math.floor(event.offsetX / this.cellWidth);
    const y = Math.floor(event.offsetY / this.cellWidth);
    this.grid[y][x] = 1;
    return new State(null, this.grid, this.cellWidth);
  }
  proceedToNextGeneration() {
    console.log(this);

    function countLiveNeighbors(x, y, grid) {
      let count = 0;
      for (
        let i = Math.max(0, x - 1);
        i <= Math.min(grid.rows - 1, x + 1);
        i++
      ) {
        for (
          let j = Math.max(0, y - 1);
          j <= Math.min(grid.columns - 1, y + 1);
          j++
        ) {
          if (grid[i][j] === 0 || (i === x && j === y)) continue;
          count++;
        }
      }
      return count;
    }

    const newGrid = Array.from(this.grid);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const neighbors = countLiveNeighbors(i, j, this.grid);
        if (neighbors < 2 || neighbors > 3) newGrid[i][j] = 0;
        else if (neighbors === 2) newGrid[i][j] = this.grid[i][j];
        else newGrid[i][j] = 1;
      }
    }

    this.grid = newGrid;
    return new State(null, newGrid, this.cellWidth);
  }
}

// function init() {
const parent = document.querySelector(".parent");
const display = new CanvasDisplay(parent);
let state = new State(display);
display.syncState(state);
display.canvas.addEventListener("mousedown", handleMouseDown);
function handleMouseDown(event) {
  state = state.updateState(event);
  display.syncState(state);
}
console.log(state);

const startButton = document.querySelector("#start");
startButton.addEventListener("click", () => {
  console.log(state);
  state = state.proceedToNextGeneration();
  display.syncState(state);
});
function startSimulation(event) {}
// }

// window.addEventListener("DOMContentLoaded", init);
// ============Rules================
// 1. Any live cell with fewer than 2 or more than 3 live neighbors dies
// 2. Any live cell with 2 or 3 live neighbors lives
// 3. Any dead cell with exactly 3 live neighbors becomes alive
