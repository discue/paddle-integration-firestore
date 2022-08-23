const emulator = require('./emulators-runner')
before(function () {
    this.timeout(60_000) // it's real slow sometimes on windows
    return emulator.start()
})
after(emulator.stop)