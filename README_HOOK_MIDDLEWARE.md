# Webhooks Middleware
The middleware component is necessary to receive and store payment related hooks from [paddle.com](https://www.paddle.com/). Currently supported hooks are:
- subscription_created
- subscription_updated
- subscription_cancelled
- subscription_payment_succeeded
- subscription_payment_refunded
- subscription_payment_failed

Can be used like any old [ExpressJS](https://expressjs.com/) [middleware](https://expressjs.com/en/guide/using-middleware.html). 

## Example
```js
'use strict'

const express = require('express')
const app = express()
const port = process.env.PORT || 3456

const paddleIntegration = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionHooks('api_clients')

// register body parser first and middleware second
app.use('/_/payments', paddleIntegration.bodyparser())
app.post('/_/payments', paddleIntegration.middleware(subscriptions))

module.exports = app.listen(port)
```