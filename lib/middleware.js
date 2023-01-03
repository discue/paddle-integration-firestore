/* eslint-disable indent */
'use strict'

const errorHandler = require('./error-handler')
const events = require('./event-emitter.js')

async function handler(req, res, callback) {
    await errorHandler(res, async () => {
        await callback()
        events.emit(req.body.alert_name, req.body)
        res.status(200).send()
    })
}

module.exports = (subscriptions) => {
    return async (req, res) => {
        const { body } = req

        if (!body || !body.alert_name) {
            return res.status(400).send()
        }

        switch (body.alert_name) {
            case 'subscription_created': {
                await handler(req, res, async () => {
                    await subscriptions.addSubscriptionCreatedStatus(body)
                })
                break
            }
            case 'subscription_updated': {
                await handler(req, res, async () => {
                    await subscriptions.addSubscriptionUpdatedStatus(body)
                })
                break
            }
            case 'subscription_cancelled': {
                await handler(req, res, async () => {
                    await subscriptions.addSubscriptionCancelledStatus(body)
                })
                break
            }
            case 'subscription_payment_succeeded': {
                await handler(req, res, async () => {
                    await subscriptions.addSuccessfulPayment(body)
                })
                break
            }
            case 'subscription_payment_failed': {
                await handler(req, res, async () => {
                    await subscriptions.addFailedPayment(body)
                })
                break
            }
            case 'subscription_payment_refunded': {
                await handler(req, res, async () => {
                    await subscriptions.addRefundedPayment(body)
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