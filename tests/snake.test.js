const { Snake, Apple } = require('../static/games/snake/classes.js');

describe('Snake class', () => {
    test('Instantiate', () => {
        const snake = new Snake(6, 2, '#FFFFFF', null, 30);
        expect(snake.body.length).toBe(1);
        expect(snake.body[0]).toEqual([6 * 30, 2 * 30]);
    });
    test('Advance snake', () => {
        const snake = new Snake(0, 0, null, null, 30);
        snake.advance();
        expect(snake.body[0]).toEqual([30, 0]);
        snake.dir = 1;
        snake.advance();
        expect(snake.body[0]).toEqual([30, 30]);
    });
});

describe('Apple class', () => {
    test('Instantiate', () => {
        const apple = new Apple(30, 300);
        expect(apple.x).toBeLessThanOrEqual(300);
        expect(apple.y).toBeLessThanOrEqual(300);
    });
    test('Random position', () => {
        const apple = new Apple(30, 300);
        const snake1 = new Snake(6, 2, null, null, 30);
        const snake2 = new Snake(5, 4, null, null, 30);
        apple.randomPos(snake1, snake2);
        expect([apple.x, apple.y]).not.toEqual(snake1.body[0]);
        expect([apple.x, apple.y]).not.toEqual(snake2.body[0]);
    });
});
