'use strict'

const paddleIntegration = require('./lib/index.js')

async function run() {
    const api = new paddleIntegration.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()

    const subscriptions = await api.listSubscriptions()

    for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i]
        console.log('cancelling', JSON.stringify(subscription, null, 2))
        await api.cancelSubscription(subscription)
    }

    console.log(`Cancelled ${subscriptions.length} subscriptions`)
}

setTimeout(run, 1000)