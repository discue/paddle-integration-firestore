# Subscription Hydration
High level wrapper that allows proactively sourcing payment- and subscription-related information from Paddle API. Decouples the application from Paddle and the timely arrival of Webhooks. E.g. after a user signs up you don't want to wait for the Webhook to arrive to allow the user access. 

Due to limitations of the Paddle API some assumptions will be made, like deriving the end of an subscription by checking the last successful payment and the payment interval. Manages locally stored data and interacts with Paddle API if necessary.

- [Subscription Hydration](#subscription-hydration)
  - [Hydrate subscription created](#hydrate-subscription-created)

:information_source: The API component of this module will be loaded asynchronously to preserve backwards compatibility with commonjs. This is achieved by returning a proxy for the entire `paddle-integration-firestore` module. The reactivity a proxy provides allows us to add the API module then at a later point to the module instance. The drawback is, we do not return named exports and, therefore, cannot not enable destructuring in ES modules.

## Hydrate subscription created
Fetches subscription-related information from Paddle API to initialize the local storage. Has various safety measures to ensure users **cannot** hydrate their own subscriptions from already existing ones. 

Uses the `subscription_id` to contact Paddle API and checks whether the given local API Client ID equals the API Client ID that was passed to Paddle API during checkout. 

```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
// initialize api and subscription hooks first
const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
const hookStorage = new paddleIntegration.SubscriptionHooks('api_clients')
const subscriptions = new paddleIntegration.SubscriptionHydration('api_clients', { api, hookStorage })

router.post('/subscriptions/initialize', async (req, res) => {
    const { _dsq: { clientId } = {}, body } = req
    const { subscription_id, checkout_id } = body

    await errorHandler(res, async () => {
        try {
            await subscriptionInfo.hydrateSubscriptionCreated([clientId], { subscription_id }, checkout_id)
            sendOkNoContent({ res })
        } catch (e) {
            console.error(`Hydration failed with ${e} at ${e.stack}}`)
            return sendError.conflict(res)
        }
    })
})

```

In your front end application, use the `customData` function of this module to create the validation object, that is required during hydration. The `usePaddleCheckout` below will populate the `checkoutOptions` object with necessary values and open the Paddle checkout.
```js
import { customData as createCustomData } from '@discue/paddle-integration-firestore/client'

export const checkoutDefaults = {
    allowQuantity: false,
    disableLogout: true,
    frameTarget: 'paddle',
    frameInitialHeight: 700,
    frameStyle: 'position: relative; width: 100%;',
    method: 'inline'
}

/**
 * Open a paddle checkout. All checkoutOptions will be forwarded to Paddle.Checkout.open
 * 
 * The following values will be updated:
 * - customData will receive a _pi object
 * - passthrough will also receive a _pi object
 * 
 * Both additions are necessary to enable the paddle integration on the server side.
 * 
 * @param {Array} ids target ids pointing to the target api client
 * @param {object} checkoutOptions Paddle checkout compatible options
 */
export const usePaddleCheckout = (ids, checkoutOptions) => {
    const { customData, passthrough } = checkoutOptions

    if ((customData && customData._pi) || (passthrough && passthrough._pi)) {
        throw new Error('Do not use the reserved keyword _pi inside customData or passthrough.')
    }

    const subscriptionValidationObject = createCustomData(ids)
    Object.entries(checkoutDefaults).forEach(([key, defaultValue]) => {
        checkoutOptions[key] = checkoutOptions[key] ?? defaultValue
    })

    checkoutOptions.customData = Object.assign(customData ?? {}, subscriptionValidationObject)
    checkoutOptions.passthrough = Object.assign(passthrough ?? {}, subscriptionValidationObject)

    Paddle.Checkout.open(checkoutOptions)
}
```