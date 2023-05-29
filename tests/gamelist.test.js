const request = require('supertest');
const app = require('../site');

describe('GET /games', () => {
    test('Game list responds', async () => {
        const response = await request(app).get('/juegos');
        expect(response.status).toBe(200);
    });
    test('Game list shows snake game', async () => {
        const response = await request(app).get('/juegos');
        expect(response.text).toMatch(/gid=1/i);
    });
});
