//! ============Game Rules============
//? 1. Any live cell with fewer than 2 or more than 3 live neighbors dies
//? 2. Any live cell with 2 or 3 live neighbors lives
//? 3. Any dead cell with exactly 3 live neighbors becomes alive

class CanvasDisplay {
  constructor(canvas, width, height, boxWidth, colors) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.boxWidth = boxWidth;
    this.ctx = this.canvas.getContext("2d");
    this.colors = colors;
    this.backgroundColor = "#ffffff";
  }
  set bgColor(color) {
    this.backgroundColor = color;
  }
  set cellColor(color) {
    this.colors = [...this.colors, color];
  }
  set cellSize(size) {
    this.boxWidth = size;
  }
  static start(parent, boxWidth, cellColor) {
    const canvas = document.createElement("canvas");
    const width =
      Math.floor(
        (window.innerWidth - 20 * 2 - (window.innerWidth > 768 ? 300 : 0)) /
          boxWidth
      ) * boxWidth;
    const height =
      Math.floor((window.innerHeight * 0.75 - 20 * 2) / boxWidth) * boxWidth;
    canvas.width = width;
    canvas.height = height;
    parent.appendChild(canvas);
    return new CanvasDisplay(canvas, width, height, boxWidth, [cellColor]);
  }
  clear() {
    this.canvas.remove();
  }
  resizeDisplay() {
    const windowWidth = window.innerWidth;
    const width =
      Math.floor(
        (windowWidth - 20 * 2 - (windowWidth > 768 ? 300 : 0)) / this.boxWidth
      ) * this.boxWidth;
    const height =
      Math.floor((window.innerHeight * 0.75 - 20 * 2) / this.boxWidth) *
      this.boxWidth;
    return new CanvasDisplay(
      this.canvas,
      width,
      height,
      this.boxWidth,
      this.colors
    );
  }
  syncState(state) {
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    const cellSize = this.boxWidth;
    state.grid.forEach((rows, i) => {
      rows.forEach((cell, j) => {
        this.ctx.fillStyle = this.colors[Math.max(cell - 1, 0)];
        if (cell)
          this.ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });
  }
}

class State {
  constructor(grid, cellSize, pointer) {
    this.rows = grid.length;
    this.columns = grid[0].length;
    this.cellWidth = cellSize;
    this.grid = grid;
    this.pointer = pointer;
  }
  set colorPointer(value) {
    this.pointer = value;
  }
  static fromDisplay(display, pointer) {
    const rows = Math.floor(display.height / display.boxWidth);
    const columns = Math.floor(display.width / display.boxWidth);
    const cellWidth = display.boxWidth;
    const grid = Array.from(new Array(rows).keys()).map((_) =>
      Array.from(new Array(columns).keys()).map((_) => 0)
    );
    return new State(grid, cellWidth, pointer);
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
    grid[y][x] = this.pointer + 1;
    return new State(grid, this.cellWidth, this.pointer);
  }
  _countLiveNeighbors(x, y) {
    let count = 0,
      sum = 0;
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        let row = i < 0 ? this.rows - 1 : i >= this.rows ? 0 : i;
        let col = j < 0 ? this.columns - 1 : j >= this.columns ? 0 : j;
        if (this.grid[row][col] === 0 || (i === x && j === y)) continue;
        count++;
        sum += this.grid[row][col];
      }
    }
    return { count, color: Math.round(sum / count) };
  }
  proceedToNextGeneration() {
    const grid = Array.from(new Array(this.rows).keys()).map((_) =>
      Array.from(new Array(this.columns).keys()).map((_) => 0)
    );
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        const liveNeighbors = this._countLiveNeighbors(i, j);
        const numOfLiveNeighbors = liveNeighbors.count;
        if (numOfLiveNeighbors < 2 || numOfLiveNeighbors > 3) grid[i][j] = 0;
        else if (numOfLiveNeighbors === 2) grid[i][j] = this.grid[i][j];
        else grid[i][j] = liveNeighbors.color;
      }
    }
    return new State(grid, this.cellWidth, this.pointer);
  }
}

const init = () => {
  const parent = document.querySelector(".canvas");
  const startButton = document.querySelector(".start");
  const stopButton = document.querySelector(".stop");
  const clearButton = document.querySelector(".clear");
  const nextButton = document.querySelector(".next");
  const slider = document.querySelector("#range");
  const timeoutDisplay = document.querySelector(".range-value");
  const cellSizeInput = document.querySelector("#cell-size");
  const cellColorInput = document.querySelector("#cell-color");
  const bgColorInput = document.querySelector("#bg-color");

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

  let display = CanvasDisplay.start(
    parent,
    cellSizeInput.value,
    cellColorInput.value
  );
  let state = State.fromDisplay(display, 0);
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
    state = State.fromDisplay(display, state.pointer);
    display.syncState(state);
    clearInterval(running);
    running = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  });
  nextButton.addEventListener("click", simulate);

  window.addEventListener("resize", () => {
    display = display.resizeDisplay();
    state = State.fromDisplay(display, state.pointer);
  });

  slider.addEventListener("input", (event) => {
    timeout = event.target.value * 50;
    timeoutDisplay.innerText = timeout + "ms";
    if (running) {
      clearInterval(running);
      running = setInterval(simulate, timeout);
    }
  });
  cellColorInput.addEventListener("change", (event) => {
    state.colorPointer = state.pointer + 1;
    display.cellColor = event.target.value;
  });
  bgColorInput.addEventListener("change", (event) => {
    display.bgColor = event.target.value;
    display.syncState(state);
  });
  cellSizeInput.addEventListener("change", (event) => {
    display.cellSize = event.target.value;
    state = State.fromDisplay(display, state.pointer);
    display.syncState(state);
  });
};

window.addEventListener("DOMContentLoaded", init);

//todo follow these steps for easing the canvas frames
// link => https://css-tricks.com/easing-animations-in-canvas/
