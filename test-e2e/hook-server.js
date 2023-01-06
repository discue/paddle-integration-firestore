'use strict'

const express = require('express')
const app = express()

const { SubscriptionHooks, middleware : Middleware } = require('../lib/index')
const subscriptions  = new SubscriptionHooks('api_client')

const middleware = Middleware(subscriptions)

const port = process.env.PORT || 3456

app.use(require('../lib/body-parser')())
app.use((req, _, next) => {
    console.log('Request', req.method, req.path, req.body.alert_name)
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