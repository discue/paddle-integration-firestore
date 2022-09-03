const Runner = require('../test/module-runner.js')
const runner = new Runner()

module.exports = {
    start: () => {
        return runner.start('node', ['./node_modules/localtunnel/bin/lt.js', '--port', '3456', '--subdomain', 'xxrrii533vj7h9qipggbkbze'], '.', 'your url is', true)
    },
    stop: () => {
        return runner.stop()
    }
}