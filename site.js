const express = require('express');
const session = require('express-session');
const bunyan = require('bunyan');
const sqlite3 = require('sqlite3').verbose();
const { run } = require('./runner');
const fs = require('fs');

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
app.use(
    '/landing_style',
    express.static(__dirname + '/node_modules/startbootstrap-freelancer/dist')
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

app.get('/', (request, response) => {
    response.render('landing');
});

/**
 * GET /login
 *
 * Responds with the log in page for IntelliMates.
 */

app.get('/login', (request, response) => {
    response.render('log_in', { error: request.query.success });
});

/**
 * GET /signup
 *
 * Responds with the log in page for IntelliMates.
 */

app.get('/signup', (request, response) => {
    response.render('signup', { status: request.query.status });
});

/**
 * GET /sandbox
 *
 * Responds with the sandbox for IntelliMates.
 */

app.get('/sandbox', (request, response) => {
    if (!request.session.loggedin) {
        response.redirect('/');
        response.end();
        return;
    }
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
                session: request.session,
            });
        }
    });
});

/**GET /juegos
 *
 * Renders the game view page
 */
app.get('/juegos', (request, response) => {
    if (!request.session.loggedin) {
        response.redirect('/');
        response.end();
        return;
    }
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
                session: request.session,
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
    const code = request.query.code;
    const algorithm_id = request.query.aid;

    // write code to file
    const filename = `${request.session.uid}-${Date.now()}`;
    fs.writeFile(
        __dirname + `/usergen/algorithms/${filename}.py`,
        'from playerCommands import get_world, send_move\n' + code,
        (err) => {
            if (err) {
                console.log(err);
                response.json({ err: err });
            } else {
                logger.info('New file added', filename);
            }
        }
    );

    db.all(
        'SELECT * FROM `algorithms` where `algorithm_id` = ?',
        [algorithm_id],
        (err, rows) => {
            if (err) {
                console.log(err);
                response.json({ err: err });
            } else {
                const apath = rows[0].filepath;
                // execute algorithms
                run(
                    '..' + apath,
                    `../usergen/algorithms/${filename}.py`,
                    `../usergen/output/${filename}.txt`,
                    (out) => {
                        if (out == 0) {
                            fs.readFile(
                                __dirname + `/usergen/output/${filename}.txt`,
                                'utf-8',
                                (err, data) => {
                                    if (err) {
                                        console.log(err);
                                        response.json({ err: err });
                                        return;
                                    }
                                    response.json({ data: data });
                                }
                            );
                        } else response.json({ err: 'Unexpected error' });
                    },
                    (err) => {
                        response.json({ err: err });
                    }
                );
            }
        }
    );
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
    function validatePassword(password){
        var pattern = /^(?=.*[a-z])(?=.*[A-Z]).{12,}$/;
        return pattern.test(password);
    }
    let username = request.body.username;
    let email = request.body.email;
    let password1 = request.body.password1;
    let password2 = request.body.password2;
    if (username && email && password1 && password2) {
        if (password1 != password2) {
            response.redirect('/signup?status=1');
            response.end();
            // response.status(701).send();
            return;
        }
        if(!validatePassword(password1)){
            response.redirect('/signup?status=4');
            response.end();
            return;
        }
        db.run(
            'INSERT INTO `users` (username, password, email, created_on) VALUES (?, ?, ?, unixepoch())',
            [username, password1, email],
            function (err, rows) {
                if (err) {
                    logger.error('Unable to write record to the database');
                    response.redirect('/signup?status=2');
                    response.end();
                    // response.status(702).send();
                    return;
                }
                logger.info('Succesful sign up for new user', username);
                // response.status(200).send();
                response.redirect('/signup?status=3');
                response.end();
            }
        );
    } else {
        response.redirect('/signup?status=0');
        response.end();
        // response.status(700).send();
    }
});

/**
 * POST /auth
 *
 * Performs user authentication by:
 *  - Validating that all fields were captured
 *  - Verifying that they match the record in the database
 *  - Creating the session and storing the username
 *  - Redirecting to index page
 */
app.post('/auth', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    if (username && password) {
        db.all(
            'SELECT * FROM `users` WHERE `username` = ? AND `password` = ?',
            [username, password],
            function (err, rows) {
                if (err) {
                    logger.error('Unable to reach database', err);
                    throw err;
                }
                if (rows && rows.length > 0) {
                    logger.info('Succesful authentication for user', username);
                    request.session.loggedin = true;
                    request.session.username = username;
                    request.session.uid = rows[0].user_id;
                    response.redirect('/juegos');
                } else {
                    logger.warn('Authentication failed for user', username);
                    response.redirect('/login?success=false');
                }
                response.end();
            }
        );
    } else {
        response.redirect('/login?success=false');
        response.end();
    }
});

module.exports = app;
