const { spawn } = require('child_process')
const { platform } = require('os')

const isUnix = platform().includes('win') ? false : true

module.exports = class Runner {
    start(binary, args, cwd, waitFor, logOutput = true) {
        this._binary = binary
        this._args = args

        return new Promise((resolve) => {
            console.log(`${binary} ${args.join(' ')} | spawning`)

            this._process = spawn(binary, args, { windowsHide: true, env: null, cwd })

            this._waitForOutputAndCallBack(this._process.stdout, waitFor, resolve)

            if (logOutput) {
                this._process.stdout.on('data', (data) => {
                    process.stdout.write(`${binary} | ${data.toString()}`)
                });
            }

            this._process.stderr.on('data', (data) => {
                process.stderr.write(`${binary} | ${data.toString()}`)
            });

            process.on('SIGHUP', () => {
                this.stop()
            })
        })
    }

    _waitForOutputAndCallBack(stream, message, callback) {
        stream.on('data', function fn(data) {
            if (data.toString('utf-8').indexOf(message) >= 0) {
                stream.removeListener('data', fn)
                callback()
            }
        })
    }

    stop() {
        console.log(`${this._binary} ${this._args.join(' ')} | stopping`)
        if (isUnix) {
            return this._stopUnix()
        } else {
            return this._stopWin()
        }
    }

    _stopUnix() {
        return new Promise((resolve) => {
            if (!this._process.killed) {
                const kill = spawn('kill', [this._process.pid]);
                kill.on('exit', resolve)
            }
        })
    }

    _stopWin() {
        return new Promise((resolve) => {
            if (!this._process.killed) {
                const kill = spawn("taskkill", ["/pid", this._process.pid, '/f', '/t']);
                kill.on('exit', resolve)
            }
        })
    }
}