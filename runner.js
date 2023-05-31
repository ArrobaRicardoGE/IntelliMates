const { spawn } = require('node:child_process');

/**Converts from array buffer to string*/
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

/**
 * Spawns a child process that runs the backend for the selected game.
 *
 * Parameters:  algorithm_path (string): path to the selected algorithms
 *              output_path (string): path to the generated output file
 *              callback_success (fn): callback to run when the process returns
 *                  data or closes with status 1
 *              callback_error (fn): callback to run when the process writes to
 *                  stderr
 */
function run(
    algorithm1_path,
    algorithm2_path,
    output_path,
    callback_success,
    callback_error
) {
    let child = spawn(
        'wsl',
        [
            'bash',
            '-l',
            '-c',
            'cd',
            '/mnt/d/ricar/Documents/UP/8/IngSoftware/3/IntelliMates/gameBackend',
            '&&',
            './Main',
            '2',
            './snakeGame/worlds/world_30_30_2_players_corners.txt',
            output_path,
            '2',
            '300',
            algorithm1_path,
            algorithm2_path,
        ],
        {
            cwd: 'D:\\ricar\\Documents\\UP\\8\\IngSoftware\\3\\IntelliMates\\gameBackend',
            timeout: 10000,
        }
    );
    child.stdout.on('data', (data) => {
        console.log(ab2str(data));
        callback_success(ab2str(data));
    });

    child.on('close', (code) => {
        console.log(code);
        callback_success(code);
    });

    child.stderr.on('data', (data) => {
        callback_error(ab2str(data));
    });
}

module.exports = { run };
