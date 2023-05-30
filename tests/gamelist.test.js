const request = require('supertest');
const app = require('../site');
const server = request.agent(app);

describe('GET /games', () => {
    test('Login user', async () => {
        await server
            .post('/auth')
            .send({ username: 'test', password: 'test' })
            .expect(302);
    });
    test('Game list responds', async () => {
        const response = await server.get('/juegos');
        expect(response.status).toBe(200);
    });
    test('Game list shows snake game', async () => {
        const response = await server.get('/juegos');
        expect(response.text).toMatch(/gid=1/i);
    });
});
