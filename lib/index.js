'use strict'

/**
 * @typedef {Object} PaddleIntegrationFirestore
 * @property {import('./subscription-hook-storage.js')} SubscriptionsHooks
 * @property {import('./subscription-hydration.js')} SubscriptionsHydration
 * @property {import('./subscription-info.js')} SubscriptionInfo
 * @property {import('./paddle/api.js')} Api
 * @property {import('./middleware.js')} middleware
 * @property {import('./body-parser.js')} bodyParser
 * @property {import('./html-encoder.js')} htmlEncoder
 */

/**
 * @type PaddleIntegrationFirestore
 */
const exp = {
    SubscriptionsHooks: require('./subscription-hook-storage'),
    SubscriptionsHydration: require('./subscription-hydration'),
    SubscriptionInfo: require('./subscription-info'),
    middleware: require('./middleware'),
    bodyParser: require('./body-parser'),
    htmlEncoder: require('./html-encoder')
}

function loadApi() {
    import('./paddle/api.js').then((module) => {
        exp.Api = module.default
    })
}

loadApi()

/**
 * @type PaddleIntegrationFirestore
 */
module.exports = new Proxy({}, {
    get: (_, key) => {
        return exp[key]
    }
})