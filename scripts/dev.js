const chokidar = require('chokidar');
const path = require('path');
const child_process = require('child_process')
const source = path.join(__dirname, '../src')
const watcher = chokidar.watch(`${source}/**/*`);


watcher.on('change', () => {
    const cp = child_process.exec('yarn compile', {
        cwd: path.join(__dirname, '..')
    })
    cp.on('exit', e => {
        console.log('Compile Done')
    })
})