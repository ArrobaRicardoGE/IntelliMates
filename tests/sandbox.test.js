const request = require('supertest');
const app = require('../site');
const server = request.agent(app);

describe('GET /sandbox', () => {
    test('Login user', async () => {
        await server
            .post('/auth')
            .send({ username: 'test', password: 'test' })
            .expect(302);
    });
    test('Sandbox responds', async () => {
        const response = await server.get('/sandbox');
        expect(response.status).toBe(200);
    });
    test('Sandbox contains editor and supports python', async () => {
        const response = await server.get('/sandbox');
        expect(response.text).toMatch(/monaco-editor/i);
        expect(response.text).toMatch(/python/i);
    });
    test('Sandbox contains game', async () => {
        const response = await server.get('/sandbox');
        expect(response.text).toMatch(/mainGame/i);
    });
});
