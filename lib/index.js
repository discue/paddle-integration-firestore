'use strict'

const exp = {
    SubscriptionsHooks: require('./subscription-hook-storage'),
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

module.exports = new Proxy({}, {
    get: (_, key) => {
        return exp[key]
    }
})
