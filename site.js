const express = require('express');
const bunyan = require('bunyan');
const sqlite3 = require('sqlite3').verbose();

/**
 * Used for logging errors, warnings and information
 */
const logger = bunyan.createLogger({
    name: 'IntelliMates',
    streams: [
        {
            level: 'info',
            path: 'logs/info.log',
        },
        {
            level: 'warn',
            path: 'logs/warn.log',
        },
        {
            level: 'error',
            path: 'logs/error.log',
        },
    ],
});

/**
 * Instantiate the app.
 *
 * Uses: json, url encoding, EJS engine, an static directory and serves the
 * monaco editor package from node_modules
 */
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));
app.use(
    '/monaco-editor',
    express.static(__dirname + '/node_modules/monaco-editor')
);

app.set('view engine', 'ejs');

/**Open the database */
const db = new sqlite3.Database('intellimates.db');

// To load monaco stylesheet from client
const monaco_css = `
rel=stylesheet
data-name=vs/editor/editor.main
href=/monaco-editor/min/vs/editor/editor.main.css`;

/**
 * GET /landpage
 *
 * Responds with the landpage for IntelliMates.
 */

app.use('/landing_assets', express.static(__dirname + '/landing_assets'));

app.get('/', (request, response) => {
    response.render('landing');
});

/**
 * GET /sandbox
 *
 * Responds with the sandbox for IntelliMates.
 */

app.get('/sandbox', (request, response) => {
    // Query the algorithms from the database to show them in the sandbox page
    db.all('SELECT * FROM `algorithms`', [], (err, rows) => {
        if (err) {
            logger.error(err);
            response.status(500).send('Internal sever error');
        } else {
            logger.info('Access to sandbox', request.ip);
            response.render('sandbox', {
                title: 'Sandbox',
                other_links: monaco_css,
                algorithm_list: rows,
            });
        }
    });
});

/**GET /juegos
 *
 * Renders the game view page
 */
app.get('/juegos', (request, response) => {
    db.all('SELECT * FROM `games`', [], (err, rows) => {
        if (err) {
            logger.error(err);
            response.status(500).send('Internal sever error');
        } else {
            logger.info('Access to game page', request.ip);
            response.render('gamelist', {
                title: 'Games',
                game_list: rows,
                other_links: null,
            });
        }
    });
});
/**
 * GET /runner
 *
 * Starts code execution and returns the resulting simulation.
 */
app.get('/runner', (request, response) => {
    // Temporarily, this just returns whatever was sent in json
    // The sleep is used to simulate the execution (whatever it may take)
    function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    sleep(3000).then(() => {
        response.json({ aid: request.query.aid, code: request.query.code });
    });
});

module.exports = app;
