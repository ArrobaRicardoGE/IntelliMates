const request = require('supertest');
const app = require('../site');

describe('GET /sandbox', () => {
    test('Sandbox responds', async () => {
        const response = await request(app).get('/sandbox');
        expect(response.status).toBe(200);
    });
    test('Sandbox contains editor and supports python', async () => {
        const response = await request(app).get('/sandbox');
        expect(response.text).toMatch(/monaco-editor/i);
        expect(response.text).toMatch(/python/i);
    });
});
