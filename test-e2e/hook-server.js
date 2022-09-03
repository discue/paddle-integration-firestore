'use strict'

const express = require('express')
const app = express()

const Subscriptions = require('../lib/index')
const subscriptions = new Subscriptions('subscriptions')

const Middleware = require('../lib/middleware')
const middleware = Middleware(subscriptions)

const port = process.env.PORT || 3456

app.use(require('../lib/body-parser')())
app.use((req, _, next) => {
    console.log('Request')
    console.log('>>', req.method, req.path)
    console.log('>>', req.body.alert_name)
    console.log()
    next()
})

app.use((req, res, next) => {
    const { method, path, body } = req
    const { alert_id: id } = body
    const start = Date.now()
    res.on('close', function () {
        let code = this.statusCode
        const durationMs = Date.now() - start
        console.log(`${method} ${path} ${id} ${code} ${durationMs}`)
    })

    next()
})

app.post('/', middleware)

const server = app.listen(port, () => {
    console.log('Payment hook server running on port', port)
})

module.exports = server