/**IMPORTANT: To pass this test, you must populate intellimates.dev.db using the
 * populate.dev.sql script, otherwise it could fail. More info on the wiki.
 * */

const sqlite3 = require('sqlite3').verbose();
let db = null;

beforeAll(() => {
    db = new sqlite3.Database('intellimates.dev.db');
});

afterAll(() => {
    db.close();
});

describe('Connection to database', () => {
    test('Query games', (done) => {
        db.all('SELECT * FROM `games`', [], (err, rows) => {
            try {
                expect(err).toBe(null);
                expect(rows.length).toBeGreaterThanOrEqual(1);
                expect(rows[0].name).toBe('Snake Game');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
    test('Query algorithms', (done) => {
        db.all('SELECT * FROM `algorithms`', [], (err, rows) => {
            try {
                expect(err).toBe(null);
                expect(rows.length).toBeGreaterThanOrEqual(5);
                expect(rows[0].name).toBe('Testing algorithm 1');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
    test('Query users', (done) => {
        db.all('SELECT * FROM `users`', [], (err, rows) => {
            try {
                expect(err).toBe(null);
                expect(rows.length).toBeGreaterThanOrEqual(1);
                expect(rows[0].username).toBe('test');
                done();
            } catch (error) {
                done(error);
            }
        });
    });
});
