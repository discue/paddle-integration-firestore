const Runner = require('../test/module-runner.js')
const runner = new Runner()

module.exports = {
    start: () => {
        return runner.start('node', ['./test-e2e/hook-server.js'], '.', 'running on port', true)
    },
    stop: () => {
        return runner.stop()
    }
}