const Runner = require('../test/module-runner.js')
const runner = new Runner()

module.exports = {
    start: () => {
        return runner.start('node', ['./test-e2e/test-page/index.js'], '.', 'test-ui started on', true)
    },
    stop: () => {
        return runner.stop()
    }
}