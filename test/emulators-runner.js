const Runner = require('./module-runner.js')
const runner = new Runner()

module.exports = {
    start: () => {
        return runner.start('node', ['./node_modules/firebase-tools/lib/bin/firebase.js', 'emulators:start'], '.', 'All emulators ready', true)
    },
    stop: () => {
        return runner.stop()
    }
}