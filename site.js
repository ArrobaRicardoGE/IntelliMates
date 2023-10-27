const express = require('express');
const session = require('express-session');
const bunyan = require('bunyan');
const sqlite3 = require('sqlite3').verbose();
const { run } = require('./runner');
const util = require('util');
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

console.log(__dirname);

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
    console.log(request.session)
    // Query the algorithms from the database to show them in the sandbox page
    db.all('SELECT * FROM `algorithms` WHERE owner_id = 1', [], (err, rows) => {
        if (err) {
            console.log(err);
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

app.get('/eval', async (request, response) => {
    db.customAll = util.promisify(db.all);

    const code = request.query.code;
    const uid = request.session.uid;
    const algorithmName = request.query.algorithmName;
    const gameId = 1; //snake game

    // write code to file
    const filename = `${request.session.uid}-${Date.now()}`;
    fs.writeFileSync(
        __dirname + `/usergen/algorithms/${filename}.py`,
        'from playerCommands import get_world, send_move\n' + code,
    );

    const algorithm_id = Date.now();
    const rows = await db.customAll(`INSERT INTO algorithms
        (algorithm_id, name, owner_id, game_id, filepath, submitted_on) 
        VALUES (?, ?, ?, ?, ?, ?)`, [algorithm_id, algorithmName, uid, gameId, filename, Date.now()]);

    console.log('Before update');
    await db.customAll(`UPDATE users
                        SET algorithm_id = ?
                        WHERE user_id = ?`, [algorithm_id, uid]);

    const apath = '../test_algorithms/mayweather_snake.py';
    run(
        apath,
        `../usergen/algorithms/${filename}.py`,
        `../usergen/output/${filename}.txt`,
        (out) => {
            console.log('out', out);
        },
        (error) => {
            console.log('error', error);
        }
    );

    console.log('Before match save');
    await db.customAll(`INSERT INTO matches
                        (match_id, player_1, player_2, game_id, match_path, winner)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [ algorithm_id, 1, uid, 1, `/usergen/output/${filename}.txt`,1]);

    console.log('Before insert');
    await db.customAll(`INSERT INTO algorithm_score 
                        (id, algorithm_id, best_win, best_loss, worst_loss)
                        VALUES (?, ?, ?, ?, ?)`,
                        [algorithm_id, algorithm_id, algorithm_id, algorithm_id, algorithm_id]);
    
    response.status(200).send('');
    console.log('after status');
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
                console.log('No file');
                console.log(err);
                logger.error(err);
                response.json({ err: err });
            } else {
                console.log('New file');
                logger.info('New file added', filename);
            }
        }
    );

    db.all(
        'SELECT * FROM `algorithms` where `algorithm_id` = ?',
        [algorithm_id],
        (err, rows) => {
            if (err) {
                logger.error(err);
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
                                        logger.error(err);
                                        response.json({ err: err });
                                        return;
                                    }
                                    response.json({ data: data });
                                }
                            );
                        }
                    },
                    (err) => {
                        logger.error(err);
                        response.json({ err: err });
                    }
                );
            }
        }
    );
});

/*
 * GET. /replay
 * Shows a replay of the game selected
 */

app.get('/replay/:id', async (request, response) => {
   /*if (!request.session.loggedin) {
        response.redirect('/');
        response.end();
        return;
    }
   */
  
    db.customAll = util.promisify(db.all);
    try {
        const replayId = request.params.id;



        console.log('Replay GET');
        const rows = await db.customAll('SELECT * FROM matches WHERE match_id = ?', [replayId]);
        if(rows.length != 1){
            console.log('row', rows);
            logger.error('replay not found');
            response.status(500).send('Internal sever error');
            return;
        }
        console.log('Rows queried');

    logger.info('Access to replay', request.ip);
    console.log(rows, 'rows data');
    const game = await fs.promises.readFile(__dirname + rows[0].match_path, 'utf8');
    console.log('File Read');
    const p1Row = await db.customAll('SELECT username FROM users WHERE user_id = ?', [rows[0].player_1]);
    const p2Row = await db.customAll('SELECT username FROM users WHERE user_id = ?', [rows[0].player_2]);

    response.render('replay', {
        title: 'Replay',
        other_links: monaco_css,
        session: request.session,
        game: game,
        player_1: p1Row[0].username,
        player_2: p2Row[0].username,
    });
    } catch (error) {
        console.error('Error GET REPLAYS', error);
    }
});

app.get('/profile/:id', async (request, response) => {
   /*if (!request.session.loggedin) {
        response.redirect('/');
        response.end();
        return;
    }*/
  
    db.customAll = util.promisify(db.all);
    try {
        const userId = request.params.id;
        const userInfo = await db.customAll('SELECT username, created_on, path_to_img, elo, algorithm_id FROM users WHERE user_id = ?', [userId]);
        const bestAlgorithm = await db.customAll(`SELECT best_win, best_loss, worst_loss, name
                FROM algorithms 
                INNER JOIN algorithm_score ON algorithms.algorithm_id = algorithm_score.algorithm_id 
                WHERE algorithms.algorithm_id = ?`,
                [userInfo[0].algorithm_id]);
        console.log(bestAlgorithm, 'bestAlgorithms');
        console.log('userElo', userInfo[0].elo);
        const date = new Date(userInfo[0].created_on * 1000);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = date.toLocaleString(undefined, options);
        const replayUrl = 'http://localhost:3000/replay/';
        const user = {
            username: userInfo[0].username,
            dateCreated: formattedDate,
            profileImage: userInfo[0].path_to_img,
            algorithmName: bestAlgorithm[0].name,
            urls: {
                bestWin: replayUrl + bestAlgorithm[0].best_win,
                worstLoss: replayUrl + bestAlgorithm[0].worst_loss,
                bestLoss: replayUrl + bestAlgorithm[0].best_loss,
            },
            elo: userInfo[0].elo
        };
        response.render('public_profile', {
            user,
            title: 'Profile',
            other_links: monaco_css,
            session: request.session,
        });
    }
    catch (error) {
        console.error('Error in profile', error);
    }
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
    function validatePassword(password) {
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
        if (!validatePassword(password1)) {
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
