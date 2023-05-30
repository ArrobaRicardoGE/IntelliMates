const request = require('supertest');
const app = require('../site');
const sqlite3 = require('sqlite3').verbose();
const util = require('util');

describe('Sign up', () => {
    test('Incomplete fields', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'othertest',
                email: 'test@mail.com',
                password1: '12345',
            })
            .expect(302);
        expect(response.text).toMatch(/status=0/i);
    });
    test('Non-matching passwords', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'othertest',
                email: 'test@mail.com',
                password1: '12345',
                password2: '12344',
            })
            .expect(302);
        expect(response.text).toMatch(/status=1/i);
    });
    test('Duplicate username', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'test',
                email: 'test@mail.com',
                password1: '12345',
                password2: '12345',
            })
            .expect(302);
        expect(response.text).toMatch(/status=2/i);
    });
    test('Successful registration', async () => {
        const response = await request(app)
            .post('/register')
            .send({
                username: 'unittestuser',
                email: 'test@mail.com',
                password1: '12345',
                password2: '12345',
            })
            .expect(302);
        expect(response.text).toMatch(/status=3/i);

        db = new sqlite3.Database('intellimates.db');
        const run_delete = (...args) => {
            return new Promise((resolve, reject) => {
                db.run(...args, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        };
        await run_delete(
            'DELETE FROM `users` WHERE `username` = ?',
            'unittestuser'
        );
    });
});
