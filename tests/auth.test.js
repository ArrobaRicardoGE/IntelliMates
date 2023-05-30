const request = require('supertest');
const app = require('../site');
const sqlite3 = require('sqlite3').verbose();

describe('Log in', () => {
    test('Incomplete fields', async () => {
        const response = await request(app)
            .post('/auth')
            .send({
                username: 'othertest',
            })
            .expect(302);
        expect(response.text).toMatch(/success=false/i);
    });
    test('Incorrect info', async () => {
        const response = await request(app)
            .post('/auth')
            .send({
                username: 'test',
                password: 'nottest',
            })
            .expect(302);
        expect(response.text).toMatch(/success=false/i);
    });
    test('Successful login', async () => {
        const response = await request(app)
            .post('/auth')
            .send({
                username: 'test',
                password: 'test',
            })
            .expect(302);
        expect(response.text).toMatch(/juegos/i);
    });
});
