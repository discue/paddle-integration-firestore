
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
- access to the Paddle API.

It does **not** 
- validate webhook content. Use and register [paddle-webhook-validator](https://github.com/discue/paddle-webhook-validator) in your application to validate webhooks before storing them.

## Installation
```bash
npm install @discue/paddle-integration-firestore
```

## Components
- <a href="README_HOOK_BODY_PARSER.md">Webhooks Body Parser</a>
- <a href="README_HOOK_MIDDLEWARE.md">Webhooks Middleware</a>
- <a href="README_SUBSCRIPTION_INFO.md">Subscription Info</a>
- <a href="README_SUBSCRIPTION_HYDRATION.md">Subscription Hydration</a>
- <a href="README_SUBSCRIPTION_API.md">Subscriptions API</a>

### Preparing a New Subscription
For the webhooks integration to work and to be able to correlate incoming hooks with the correct subscription, a placeholder needs to be created **before the checkout** and - afterward - a specific value must be passed to the [Checkout API](https://developer.paddle.com/guides/ZG9jOjI1MzU0MDQz-pass-parameters-to-the-checkout) via the `passthrough` parameter. This value will be returned by the `addSubscriptionPlaceholder` method.

You can see in the example below, the Subscriptions constructor is called with the name of the target `collection` and the id of the target document. The id could be your `user` or `api_client` id. Remember: the target document must exist before creating the placeholder.

```js
'use strict'

const readApiClient = require('./lib/your-application/read-api-client')
const paddleIntegration = require('@discue/paddle-firebase-integration')
// pass the path to the collection here
const subscriptions = new paddleIntegration.SubscriptionHooks('api_clients')

module.exports = async (req, res, next) => {
    // requires application to read api_client information 
    // based on incoming information like a JWT or a cookie
    const { id } = readApiClient(req)

    // create subscription placeholder
    const { passthrough } = await subscriptions.addSubscriptionPlaceholder([id])
    // return the passthrough to the frontend app
    res.status(200).send(JSON.stringify({ passthrough }))
}
```

## Run E2E Tests

To run tests, run the following command

```bash
./test-e2e.sh
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

