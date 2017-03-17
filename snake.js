var COL = 30;
var ROW = 27;

var EMPTY = 0;
var SNAKE = 1;
var FRUIT = 2;

var frame = 0;
var snakeColor = 'gold';
var turbo;

var LEFT = 37; 
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ENTER = 13;

var direction;
var cursor = {};
var score = 0;
var pause;

var grid = {
  width: 20,
  height: 20,
  _grid: [],
  init: function() {
    for (var c=0; c<COL; c++) {
      this._grid[c] = []; 
      for (var r=0; r<ROW; r++) {
        this._grid[c][r] = EMPTY;
      }
    }
  },
  set: function(c, r, val) {
    if (!this._grid[c]) this._grid[c] = [];
    this._grid[c][r] = val;
  },
  get: function(c, r) {
    if (this._grid[c]) return this._grid[c][r];
    return EMPTY;
  }
};

var snake = {
  grid: grid,
  queue: [],
  init: function(c, r) {
    this.queue = [];
    this.insert(c, r);

    this.queue.push({ c: c, r: r+1 });
    this.grid.set(c, r+1, SNAKE);

    this.queue.push({ c: c, r: r+2 });
    this.grid.set(c, r+2, SNAKE);

  },
  insert: function(c, r) {
    this.queue.unshift({ c: c, r: r });
    this.grid.set(c, r, SNAKE);
  },
  getHead: function() {
    return this.queue[0];
  },
  remove: function() {
    var pop = this.queue.pop();
    this.grid.set(pop.c, pop.r, EMPTY);
    return pop;
  }
};

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  loopGrid(function(c, r) {
    switch (grid.get(c, r)) {
      case EMPTY: 
        ctx.fillStyle = '#efefef';
        break;
      case SNAKE:
        ctx.fillStyle = snakeColor;
        break;
      case FRUIT:
        ctx.fillStyle = 'red';
        break;
    }

    ctx.fillRect(c*grid.width, r*grid.height, grid.width, grid.height);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(c*grid.width, r*grid.height, grid.width, grid.height);
    ctx.closePath();
  });

  ctx.font = '24px Helvetica';
  ctx.fillStyle = '#000';
  ctx.fillText('SCORE: '+score, grid.width, canvas.height-grid.height);
}

function loopGrid(callback) {
  for (var c=0; c<COL; c++) {
    for (var r=0; r<ROW; r++) {
      callback(c, r);
    }
  }
}

function spawnSnake() {
  snake.init(Math.floor(COL/2)-1, Math.floor(ROW/2)-1);
}


function spawnFruit() {
  var emptyGrid = [];

  loopGrid(function(c, r) {
      if (grid.get(c,r) === EMPTY)
        emptyGrid.push({ c: c, r: r });
  });

  var randomGrid = emptyGrid[Math.floor(Math.random() * emptyGrid.length)];

  grid.set(randomGrid.c, randomGrid.r, FRUIT);
}

function init() {

  pause = true;
  score = 0;
  grid.init();
  spawnSnake();
  spawnFruit();
  direction = UP;
}

function update(dt) {
  console.log(pause);
  if (pause) return;
  if (cursor[UP] && !cursor[DOWN] && !cursor[LEFT] && !cursor[RIGHT] && direction !== DOWN) direction = UP;
  if (cursor[RIGHT] && !cursor[UP] && !cursor[DOWN] && !cursor[LEFT] && direction !== LEFT) direction = RIGHT;
  if (cursor[DOWN] && !cursor[UP] && !cursor[LEFT] && direction !== UP) direction = DOWN;
  if (cursor[LEFT] && !cursor[UP] && !cursor[DOWN] && direction !== RIGHT) direction = LEFT;

  turbo = cursor[SPACE];
  snakeColor = turbo ? 'orange' : 'gold';

  var head;
  var newC;
  var newR;


  var nextFrame = turbo ? 2 : 8;

  if (frame%nextFrame === 0) {
    head = snake.getHead();
    newC = head.c;
    newR = head.r;

    if (direction === UP) newR--;
    if (direction === RIGHT) newC++;
    if (direction === LEFT) newC--;
    if (direction === DOWN) newR++;

    // die
    if (grid.get(newC, newR) === SNAKE || newC > COL || newR > ROW || newC < 0 || newR < 0) {
      return init();
    }
    if (grid.get(newC, newR) === FRUIT) {
      // eat fruit
      spawnFruit();
      score += 10;
    }
    if (grid.get(newC, newR) === EMPTY) {
      snake.remove(head.c, head.r);
    }


    snake.insert(newC, newR);
  }

  frame++;
}

function loop(elapsed) {
  window.requestAnimationFrame(loop);

  var dt = ((elapsed||1) - (this.lastElapsed||0))/1000;
  this.lastElapsed = elapsed;

  update(dt);
  draw();
}

function main() {
  canvas.width = grid.width * COL;
  canvas.height = grid.height * ROW;
  document.body.appendChild(canvas);

  document.addEventListener('keydown', function(e) {
    cursor[e.keyCode] = true;
    if (e.keyCode === ENTER) {
      pause = !pause;
    }
  });

  document.addEventListener('keyup', function(e) {
    cursor[e.keyCode] = false;
  });

  init();
  loop();
}

main();
