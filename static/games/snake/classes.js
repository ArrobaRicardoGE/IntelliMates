/**Main class for the snake
 *
 * Contains the logic for drawing and moving a snake entity in the game.
 *
 * Parameters: x (int) the initial x coordinate
 *             y (int) the initial y coordinate
 *             color (string) the color of the snake
 */
class Snake {
    constructor(x, y, color, ctx, cellSize) {
        this.size = 1;
        this.body = [[cellSize * x, cellSize * y]];
        this.dir = 0;
        this.requestedDir = 0;
        this.color = color;
        this.ctx = ctx;
        this.cellSize = cellSize;
    }

    /**Draws the snake in the current context */
    show() {
        for (let i = 0; i < this.size; i++) {
            this.ctx.fillStyle = this.color;
            this.ctx.fillRect(
                this.body[i][0] + 1,
                this.body[i][1] + 1,
                this.cellSize - 2,
                this.cellSize - 2
            );
        }
    }

    /**Moves the snake body towards the current direction */
    advance() {
        for (let i = this.size - 1; i > 0; i--) {
            this.body[i][0] = this.body[i - 1][0];
            this.body[i][1] = this.body[i - 1][1];
        }
        if (this.dir == 0) this.body[0][0] += this.cellSize;
        if (this.dir == 1) this.body[0][1] += this.cellSize;
        if (this.dir == 2) this.body[0][0] -= this.cellSize;
        if (this.dir == 3) this.body[0][1] -= this.cellSize;
    }
}

function randomInt(ub) {
    return Math.floor(Math.random() * ub);
}

/**Main class for the apple
 *
 * Contains the logic for drawing and choosing a random position for the apple
 * to spawn
 */
class Apple {
    constructor(cellSize, dim) {
        this.cellSize = cellSize;
        this.dim = dim;
        this.x = this.cellSize * randomInt(dim / cellSize);
        this.y = this.cellSize * randomInt(dim / cellSize);
    }

    /**Draws the apple in the current context */
    show() {
        ctx.fillStyle = '#FACF13';
        ctx.fillRect(
            this.x + 1,
            this.y + 1,
            this.cellSize - 2,
            this.cellSize - 2
        );
    }

    /**Places the apple in a random position, validating that it doesn't
     * overlap a position currently occupied by a snake.
     */
    randomPos(snake1, snake2) {
        let posiblePos = [];
        for (let i = 0; i < this.dim / this.cellSize; i++) {
            for (let j = 0; j < this.dim / this.cellSize; j++) {
                let posible = true;
                for (let k = 0; k < snake1.size; k++) {
                    if (
                        i * this.cellSize == snake1.body[k][0] &&
                        j * this.cellSize == snake1.body[k][1]
                    ) {
                        posible = false;
                        break;
                    }
                }
                for (let k = 0; k < snake2.size; k++) {
                    if (
                        i * this.cellSize == snake2.body[k][0] &&
                        j * this.cellSize == snake2.body[k][1]
                    ) {
                        posible = false;
                        break;
                    }
                }
                if (posible)
                    posiblePos.push([i * this.cellSize, j * this.cellSize]);
            }
        }
        let selectedPos = randomInt(posiblePos.length - 1);
        this.x = posiblePos[selectedPos][0];
        this.y = posiblePos[selectedPos][1];
    }
}

module.exports = {
    Snake,
    Apple,
};
