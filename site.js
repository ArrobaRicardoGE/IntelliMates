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

// To load monaco stylesheet from client
const monaco_css = `
rel=stylesheet
data-name=vs/editor/editor.main
href=/monaco-editor/min/vs/editor/editor.main.css`;

/**
 * GET /sandbox
 *
 * Responds with the sandbox for IntelliMates.
 */
app.get('/sandbox', (request, response) => {
    logger.info('Access to sandbox', request.ip);
    response.render('sandbox', { title: 'Sandbox', other_links: monaco_css });
});

module.exports = app;
