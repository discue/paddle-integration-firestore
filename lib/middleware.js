/* eslint-disable indent */
'use strict'

const errorHandler = require('./error-handler')

module.exports = (subscriptions) => {
    return async (req, res) => {
        const { body } = req

        if (!body || !body.alert_name) {
            return res.status(400).send()
        }

        switch (body.alert_name) {
            case 'subscription_created': {
                await errorHandler(res, async () => {
                    await subscriptions.addSubscriptionCreatedStatus(body)
                    res.status(200).send()
                })
                break
            }
            case 'subscription_updated': {
                await errorHandler(res, async () => {
                    await subscriptions.addSubscriptionUpdatedStatus(body)
                    res.status(200).send()
                })
                break
            }
            case 'subscription_cancelled': {
                await errorHandler(res, async () => {
                    await subscriptions.addSubscriptionCancelledStatus(body)
                    res.status(200).send()
                })
                break
            }
            case 'subscription_payment_succeeded': {
                await errorHandler(res, async () => {
                    await subscriptions.addSuccessfulPayment(body)
                    res.status(200).send()
                })
                break
            }
            case 'subscription_payment_failed': {
                await errorHandler(res, async () => {
                    await subscriptions.addFailedPayment(body)
                    res.status(200).send()
                })
                break
            }
            case 'subscription_payment_refunded': {
                await errorHandler(res, async () => {
                    await subscriptions.addRefundedPayment(body)
                    res.status(200).send()
                })
                break
            }
            default: {
                console.log('Received unknown alert name', body.alert_name)
                res.status(400).send()
            }
        }
    }
}