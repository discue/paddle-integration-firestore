# Subscription Info
High level wrapper for Paddle API. Manages locally stored data and interacts with Paddle API if necessary.

- [Subscription Info](#subscription-info)
  - [Get subscription infos](#get-subscription-infos)
  - [Get list of payment events](#get-list-of-payment-events)
  - [Get list of subscription status events](#get-list-of-subscription-status-events)
  - [Check subscription status](#check-subscription-status)
  - [Cancel a subscription](#cancel-a-subscription)
  - [Update a subscription plan](#update-a-subscription-plan)

:information_source: The API component of this module will be loaded asynchronously to preserve backwards compatibility with commonjs. This is achieved by returning a proxy for the entire `paddle-integration-firestore` module. The reactivity a proxy provides allows us to add the API module then at a later point to the module instance. The drawback is, we do not return named exports and, therefore, cannot not enable destructuring in ES modules.

## Get subscription infos
Returns all available information about a subscription. Will include the `start` and (optionally) `end` date, the `status_trail`, and the `payments_trail` and a property indicating whether the subscription is currently `active`.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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

## Get list of payment events
Returns list of payments for for all subscriptions associated with the given user/api_client.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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

## Get list of subscription status events
Returns list of payments for for all subscriptions associated with the given user/api_client.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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

## Check subscription status
Will return the status for all subscriptions associated with the given user/api_client.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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

## Cancel a subscription
Cancels a specific subscription plan. The subscription plan id must be passed.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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

## Update a subscription plan
Updates a subscription plan. The previous one will be cancelled and the new one will become active immediately. Customers will be charged immediately.

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionInfo('api_clients', { api })

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