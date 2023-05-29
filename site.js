const express = require('express');
const session = require('express-session');
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
 * Uses: json, url encoding, EJS engine, session management, an static
 * directory and serves the monaco editor package from node_modules
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

app.use(
    session({
        secret: 'superdupersecuresecret',
        resave: true,
        saveUninitialized: true,
    })
);

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

/**
 * POST /register
 *
 * Registers new users by:
 *  - Validating that all fields were captured
 *  - Validating that password verification matches
 *  - Writing to database and checking for any errors (i.e. username taken)
 */
app.post('/register', (request, response) => {
    let username = request.body.username;
    let email = request.body.email;
    let password1 = request.body.password1;
    let password2 = request.body.password2;
    if (username && email && password1 && password2) {
        if (password1 != password2) {
            // response.redirect('/signup?status=1');
            // response.end();
            response.status(701).send();
            return;
        }
        db.run(
            'INSERT INTO `users` (username, password, email, created_on) VALUES (?, ?, ?, unixepoch())',
            [username, password1, email],
            function (err, rows) {
                if (err) {
                    logger.error('Unable to write record to the database');
                    // response.redirect("/signup?status=2");
                    // response.end();
                    response.status(702).send();
                    return;
                }
                logger.info('Succesful sign up for new user', username);
                response.status(200).send();
                // response.redirect("/signup?status=3");
                // response.end();
            }
        );
    } else {
        // response.redirect("/signup?status=0");
        // response.end();
        response.status(700).send();
    }
});

module.exports = app;
