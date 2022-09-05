/* eslint-disable indent */
'use strict'

module.exports = (subscriptions) => {
    return async (req, res) => {
        const { body } = req

        if (!body || !body.alert_name) {
            return res.status(400).send()
        }

        switch (body.alert_name) {
            case 'subscription_created': {
                await subscriptions.addSubscriptionCreatedStatus(body)
                res.status(200).send()
                break
            }
            case 'subscription_updated': {
                await subscriptions.addSubscriptionUpdatedStatus(body)
                res.status(200).send()
                break
            }
            case 'subscription_cancelled': {
                await subscriptions.addSubscriptionCancelledStatus(body)
                res.status(200).send()
                break
            }
            case 'subscription_payment_succeeded': {
                await subscriptions.addSuccessfulPayment(body)
                res.status(200).send()
                break
            }
            case 'subscription_payment_refunded': {
                await subscriptions.addFailedPayment(body)
                res.status(200).send()
                break
            }
            case 'subscription_payment_failed': {
                await subscriptions.addRefundedPayment(body)
                res.status(200).send()
                break
            }
            default: {
                console.log('Received unknown alert name', body.alert_name)
                res.status(400).send()
            }
        }
    }
}