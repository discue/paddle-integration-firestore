'use strict'

const emulatorRunner = require('../test/emulators-runner')
const hookRunner = require('./hook-server-runner')
const hookTunnelRunner = require('./hook-tunnel-runner')
const testPageRunner = require('./test-page-runner')

module.exports = async () => {
    await testPageRunner.stop()
    await hookTunnelRunner.stop()
    await hookRunner.stop()
    await emulatorRunner.stop()
}