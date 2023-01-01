# Webhooks Body Parser
The body parser middleware component is necessary to receive and store payment related hooks from [paddle.com](https://www.paddle.com/). There is nothing special to this body parser. It merely enables parsing of `urlencoded` parameters in request bodies.

Can be used like any old [ExpressJS](https://expressjs.com/) [middleware](https://expressjs.com/en/guide/using-middleware.html). 

## Example
```js
'use strict'

const express = require('express')
const app = express()
const port = process.env.PORT || 3456

const paddleIntegrationFirestore = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new paddleIntegrationFirestore.Subscriptions('api_clients')

// register body parser first and middleware second
app.use('/_/payments', paddleIntegrationFirestore.bodyparser())
app.post('/_/payments', paddleIntegrationFirestore.middleware(subscriptions))

module.exports = app.listen(port)
```