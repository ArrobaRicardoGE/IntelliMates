const express = require('express');
const bunyan = require('bunyan');

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
 * Uses: json, url encoding and EJS engine.
 */
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('static'));

app.set('view engine', 'ejs');

/**
 * GET /sandbox
 *
 * Responds with the sandbox for IntelliMates.
 */
app.get('/sandbox', (request, response) => {
    logger.info('Access to sandbox', request.ip);
    response.render('sandbox', { title: 'Sandbox' });
});

module.exports = app;
