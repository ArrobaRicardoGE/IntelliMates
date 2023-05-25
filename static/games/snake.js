const mainCanvas = document.getElementById('mainGame');
const nCells = 30;
let canvasSize = Math.min(
    mainCanvas.parentElement.offsetWidth,
    mainCanvas.parentElement.offsetHeight
);
canvasSize -= canvasSize % nCells;
mainCanvas.width = mainCanvas.height = canvasSize;
const ctx = mainCanvas.getContext('2d');
const cellSize = mainCanvas.width / nCells;
const speed = 5;
let snake1 = null,
    snake2 = null,
    apple = null;

let gameOver = true;
let frameRate = 0;

function randomInt(ub) {
    return Math.floor(Math.random() * ub);
}

class Snake {
    constructor(x, y, color) {
        this.size = 1;
        this.body = [[cellSize * x, cellSize * y]];
        this.dir = 0;
        this.requestedDir = 0;
        this.color = color;
    }

    show() {
        // let col = 0;
        // let init = 'rgb(';
        for (let i = 0; i < this.size; i++) {
            // let colorRes = '';
            // colorRes = init + col + ',' + col + ',255)';
            // col = Math.min(col + 5, 255);
            ctx.fillStyle = this.color;
            ctx.fillRect(
                this.body[i][0] + 1,
                this.body[i][1] + 1,
                cellSize - 2,
                cellSize - 2
            );
        }
    }

    advance() {
        for (let i = this.size - 1; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
        }
        if (this.dir == 0) this.body[0][0] += cellSize;
        if (this.dir == 1) this.body[0][1] += cellSize;
        if (this.dir == 2) this.body[0][0] -= cellSize;
        if (this.dir == 3) this.body[0][1] -= cellSize;
    }
}

class Apple {
    constructor() {
        this.x = cellSize * randomInt(mainCanvas.height / cellSize);
        this.y = cellSize * randomInt(mainCanvas.height / cellSize);
    }

    show() {
        ctx.fillStyle = '#FACF13';
        ctx.fillRect(this.x + 1, this.y + 1, cellSize - 2, cellSize - 2);
    }

    randomPos(snake1, snake2) {
        let posiblePos = [];
        for (let i = 0; i < mainCanvas.height / cellSize; i++) {
            for (let j = 0; j < mainCanvas.width / cellSize; j++) {
                let posible = true;
                for (let k = 0; k < snake1.size; k++) {
                    if (
                        i * cellSize == snake1.body[k][0] &&
                        j * cellSize == snake1.body[k][1]
                    ) {
                        posible = false;
                        break;
                    }
                }
                for (let k = 0; k < snake2.size; k++) {
                    if (
                        i * cellSize == snake2.body[k][0] &&
                        j * cellSize == snake2.body[k][1]
                    ) {
                        posible = false;
                        break;
                    }
                }
                if (posible) posiblePos.push([i * cellSize, j * cellSize]);
            }
        }
        let selectedPos = randomInt(posiblePos.length - 1);
        apple.x = posiblePos[selectedPos][0];
        apple.y = posiblePos[selectedPos][1];
    }
}

function resetGame() {
    snake1 = new Snake(0, 0, '#C84191');
    snake2 = new Snake(nCells - 1, nCells - 1, '#594998');
    apple = new Apple();
    frameRate = 0;
}

function checkCollisionBorder(snake) {
    return (
        snake.body[0][0] < 0 ||
        snake.body[0][0] >= mainCanvas.width ||
        snake.body[0][1] < 0 ||
        snake.body[0][1] >= mainCanvas.height
    );
}

function checkCollisionSnake(s1, s2) {
    for (let i = 1; i < s1.size; i++) {
        if (JSON.stringify(s1.body[0]) == JSON.stringify(s1.body[i]))
            return true;
    }
    for (let i = 0; i < s2.size; i++) {
        if (JSON.stringify(s1.body[0]) == JSON.stringify(s2.body[i]))
            return true;
    }
    return false;
}

function checkEatApple(snake) {
    if (snake.body[0][0] == apple.x && snake.body[0][1] == apple.y) {
        snake.body.push([0, 0]);
        snake.size++;
        apple.randomPos(snake1, snake2);
    }
}

function draw() {
    if (frameRate == speed) {
        frameRate = 0;
        ctx.fillStyle = '#282A36';
        ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        apple.show();
        snake1.dir = snake1.requestDir;
        snake1.advance();
        snake2.dir = snake2.requestDir;
        snake2.advance();

        gameOver = gameOver || checkCollisionBorder(snake1);
        gameOver = gameOver || checkCollisionBorder(snake2);

        //Collision between snakes
        gameOver = gameOver || checkCollisionSnake(snake2, snake1);
        gameOver = gameOver || checkCollisionSnake(snake1, snake2);

        snake1.show();
        snake2.show();

        //Eat apple
        checkEatApple(snake1);
        checkEatApple(snake2);
    } else frameRate++;
    if (!gameOver) window.requestAnimationFrame(draw);
    else {
        window.alert('Game over!');
    }
}

function startGame() {
    resetGame();
    gameOver = false;
    window.requestAnimationFrame(draw);
}

document.addEventListener('keydown', function (dir) {
    //37:left 38:up 39:right 40:down
    if (dir.which == 37 && snake1.dir != 0) snake1.requestDir = 2;
    if (dir.which == 38 && snake1.dir != 1) snake1.requestDir = 3;
    if (dir.which == 39 && snake1.dir != 2) snake1.requestDir = 0;
    if (dir.which == 40 && snake1.dir != 3) snake1.requestDir = 1;

    if (dir.which == 65 && snake2.dir != 0) snake2.requestDir = 2;
    if (dir.which == 87 && snake2.dir != 1) snake2.requestDir = 3;
    if (dir.which == 68 && snake2.dir != 2) snake2.requestDir = 0;
    if (dir.which == 83 && snake2.dir != 3) snake2.requestDir = 1;

    if (dir.which == 32) startGame();
});
