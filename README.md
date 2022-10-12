
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
- a body parser function
- a middleware function to receive and store [Paddle Webhooks](https://developer.paddle.com/getting-started/ef9af9f700849-working-with-paddle-webhooks)

It does **not** 
- validate webhook content. Use and register [paddle-webhook-validator](https://github.com/discue/paddle-webhook-validator) in your application to validate webhooks before storing them.
- provide a component or methods to query payment-related information. 

## Installation
```bash
npm install @discue/paddle-integration-firestore
```

## Usage
### Webhooks Middleware
The middleware component is necessary to receive and store payment related hooks from [paddle.com](https://www.paddle.com/). Currently supported hooks are:
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
const subscriptions = new Subscriptions('api_clients')

// register body parser first and middleware second
app.use('/_/payments', bodyparser())
app.post('/_/payments', middleware(subscriptions))

module.exports = app.listen(port)
```

### Preparing a New Subscription
For the webhooks integration to work and to be able to correlate incoming hooks with the correct subscription, a placeholder needs to be created **before the checkout** and - afterward - a specific value must be passed to the [Checkout API](https://developer.paddle.com/guides/ZG9jOjI1MzU0MDQz-pass-parameters-to-the-checkout) via the `passthrough` parameter. This value will be returned by the `addSubscriptionPlaceholder` method.

You can see in the example below, the Subscriptions constructor is called with the name of the target `collection` and the id of the target document. The id could be your `user` or `api_client` id. Remember: the target document must exist before creating the placeholder.

```js
'use strict'

const uuid = require('crypto').randomUUID

const { Subscriptions } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new Subscriptions('api_clients')

module.exports = async (req, res, next) => {
    // requires application to read api_client information 
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

### Geting subscription infos
Returns all available information about a subscription. Will include the `start` and (optionally) `end` date, the `status_trail`, and the `payments_trail` and a property indicating whether the subscription is currently `active`.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to provide the target ids of the
    // subscription document. This can be e.g. the api client id
    const targetIds = getSubscriptionIds(targetIds)

    const info = await subscriptions.getSubscriptionInfo(targetIds)
    //    {
    //        '8': {
    //        start: '2022-08-30T07:59:44.326Z',
    //        end: '2022-09-30T07:59:44.404Z',
    //        status_trail: [Array],
    //        payments_trail: [Array],
    //        active: false
    //        }
    //    }
}
```

### Checking Subscription Status
Will return the status for all subscriptions associated with the given user/api_client.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient

    const status = await subscriptions.getAllSubscriptionsStatus(subscription)
    if (!status[PREMIUM_SUBSCRIPTION_PLAN_ID]) {
        // subscription is not active anymore or never was
        res.status(422).send('Subscription needed!')
    } else {
        // subscription is active
        next()
    }
}
```

### Get list of payment events
Returns list of payments for for all subscriptions associated with the given user/api_client.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient

    const payments = await subscriptions.getPaymentsTrail(subscription)
    // payments = {
    //    "123": [
    //       { event_time: "2021-08-08 11:49:59", type: subscription_payment_failed", ...},
    //       { event_time: "2021-08-09 11:49:59", type: subscription_payment_succeeded", ...},
    //    ]
    // }
}
```

### Get list of subscription status events
Returns list of payments for for all subscriptions associated with the given user/api_client.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient

    const status = await subscriptions.getStatusTrail(subscription)
    // status = {
    //    "123": [
    //       { start_at: "2021-08-08 11:49:59", type: "subscription_created", ... },
    //       { start_at: "2021-08-09 11:49:59", type: "subscription_cancelled", ... },
    //    ]
    // }
}
```

### Cancelling a subscription
Cancels a specific subscription plan. The subscription plan id must be passed.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient
    const subscriptionPlanId = '35141'

    await subscriptions.cancelSubscription(subscription subscriptionPlanId)
}
```

### Updateing a subscription plan
Updates a subscription plan. The previous one will be cancelled and the new one will become active immediately. Customers will be charged immediately.

```js
'use strict'

const { SubscriptionInfo } = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new SubscriptionInfo('api_clients')

const PREMIUM_SUBSCRIPTION_PLAN_ID = '123'

module.exports = (req,res,next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const apiClient = readApiClient(req)
    const { subscription } = apiClient
    const subscriptionPlanId = '35141'
    const newSubscriptionPlanId = '55123'

    await subscriptions.updateSubscription(subscription subscriptionPlanId, newSubscriptionPlanId)
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

