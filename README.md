
<p align="center">
<a href="https://www.discue.io/" target="_blank" rel="noopener noreferrer"><img width="128" src="https://www.discue.io/icons-fire-no-badge-square/web/icon-192.png" alt="Vue logo">
</a>
</p>

<br/>
<div align="center">

[![GitHub tag](https://img.shields.io/github/tag/discue/paddle-integration-firestore?include_prereleases=&sort=semver&color=blue)](https://github.com/discue/paddle-integration-firestore/releases/)
[![Latest Stable Version](https://img.shields.io/npm/v/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
[![License](https://img.shields.io/npm/l/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
<br/>
[![NPM Downloads](https://img.shields.io/npm/dt/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
[![NPM Downloads](https://img.shields.io/npm/dm/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
<br/>
[![contributions - welcome](https://img.shields.io/badge/contributions-welcome-blue)](/CONTRIBUTING.md "Go to contributions doc")
[![Made with Node.js](https://img.shields.io/badge/Node.js->=12-blue?logo=node.js&logoColor=white)](https://nodejs.org "Go to Node.js homepage")

</div>

# paddle-integration-firestore

[paddle.com](https://www.paddle.com/) payments integration for [Google Cloud Firestore](https://cloud.google.com/firestore).

This module provides 
- a middleware function
- a body parser function
- a component that stores payment-related information.

It does **not** provide a component or methods to query payment-related information. 

The module stores payment-related information in aollection of the target application like e.g. `api-clients`, or `api-users` and expects the application to read this information anyhow for every request. Therefore, no extra costly read is required.

## Installation
```bash
npm install @discue/paddle-integration-firestore
```

## Usage
### Webhooks Middleware
Necessary to receive and store payment related hooks from [paddle.com](https://www.paddle.com/). Currently supported hooks are
- subscription_created
- subscription_updated
- subscription_cancelled
- subscription_payment_succeeded
- subscription_payment_refunded
- subscription_payment_failed

Can be used like any old [ExpressJS](https://expressjs.com/) [middleware](https://expressjs.com/en/guide/using-middleware.html). 


```js
'use strict'

const express = require('express')
const app = express()
const port = process.env.PORT || 3456

const { bodyparser, middleware,Subscriptions } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new Subscriptions('api_clients/subscriptions')

// register body parser first and middleware second
app.use('/_/payments', bodyparser())
app.post('/_/payments', middleware(subscriptions))

module.exports = app.listen(port)
```

### Preparing a New Subscription
For the webhooks integration to work and to be able to correlate incoming hooks with the correct subscription, a placeholder needs to be created **first**. Additionally, a specific value must be passed via the `passthrough` parameter to the [Checkout API](https://developer.paddle.com/guides/ZG9jOjI1MzU0MDQz-pass-parameters-to-the-checkout). This value will be returned by the `addSubscriptionPlaceholder` method.

To create a subscription placeholder, you need to pass the id of the target parent document. The placeholder will be created and the method will return the required `passthrough` value.

```js
'use strict'

const uuid = require('crypto').randomUUID

const { Subscriptions } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new Subscriptions('api_clients')

module.exports = async (req, res, next) => {
    // require application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    // get id of target client
    const { id } = apiClient

    // create subscription placeholder
    const { passthrough } = await subscriptions.addSubscriptionPlaceholder([id])
    // return the passthrough to the frontend app
    res.status(200).send(JSON.stringify({ passthrough }))
}
```

### Checking Subscription Status
Expects the parent application to read the actual subscription from the database. The subscription object can then be passed without modification to the `isSubscriptionActive` method.

```js
'use strict'

const { Subscriptions } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new Subscriptions('api_clients')

module.exports = (req,res,next) => {
    // require application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient

    const isActive = await subscriptions.isSubscriptionActive(subscription)
    if (!isActive) {
        // subscription is not active anymore or never was
        res.status(422).send('Subscription needed!')
    } else {
        // subscription is active
        next()
    }
}
```

## Run Tests

To run tests, run the following command

```bash
./test.sh
```

## Run E2E Tests

To run tests, run the following command

```bash
./test-e2e.sh
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

