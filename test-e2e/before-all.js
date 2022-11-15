'use strict'

const emulatorRunner = require('../test/emulators-runner')
const hookRunner = require('./hook-server-runner')
const hookTunnelRunner = require('./hook-tunnel-runner')
const testPageRunner = require('./test-page-runner')

module.exports = async () => {
    await testPageRunner.start()
    await hookTunnelRunner.start()
    await hookRunner.start()
    await emulatorRunner.start()
}