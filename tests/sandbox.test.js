const request = require('supertest');
const app = require('../site');

describe('GET /sandbox', () => {
    test('Sandbox responds', async () => {
        const response = await request(app).get('/sandbox');
        expect(response.status).toBe(200);
    });
});
