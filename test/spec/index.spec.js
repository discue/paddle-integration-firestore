'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')
const paymentSucceded = require('../fixtures/payment-succeeded')
const paymentFailed = require('../fixtures/payment-failed')
const paymentRefunded = require('../fixtures/payment-refunded')

const PaddleIntegration = require('../../lib/index')
const paddleIntegration = new PaddleIntegration('subscriptions')
const storage = require('../../lib/firestore/nested-firestore-resource')({ documentPath: 'subscriptions', resourceName: 'subscriptions' })

const { expect } = require('chai')

describe('PaddleIntegration', () => {

    let ids

    beforeEach(async () => {
        ids = [uuid()]
        await paddleIntegration.addSubscriptionPlaceholder(ids)
    })

    describe('.addSubscription', () => {
        it('creates an aactive subscription', async () => {
            const createPayload = Object.assign({}, subscriptionCreated, { passthrough: JSON.stringify({ ids }) })

            await paddleIntegration.addSubscription(createPayload)
            const sub = await storage.get(ids)
            const isActive = await paddleIntegration.isSubscriptionActive(sub)
            expect(isActive).to.be.true
        })
        it('stores subscription related info', async () => {
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: uuid(), passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const sub = await storage.get(ids)
            expect(sub.cancel_url).to.equal(createPayload.cancel_url)
            expect(sub.checkout_id).to.equal(createPayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(2)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(createPayload.update_url)
            expect(sub.subscription_id).to.equal(createPayload.subscription_id)
            expect(sub.subscription_plan_id).to.equal(createPayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(createPayload.user_id)

            const status = sub.status[1]
            expect(status.alert_id).to.equal(createPayload.alert_id)
            expect(status.alert_name).to.equal(createPayload.alert_name)
            expect(status.currency).to.equal(createPayload.currency)
            expect(status.description).to.equal(createPayload.status)
            expect(status.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status.unit_price).to.equal(createPayload.unit_price)
            expect(status.quantity).to.equal(createPayload.quantity)
            expect(status.start_at).to.equal(createPayload.event_time)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.addSubscription(null).then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.updateSubscription', () => {
        it('updates subscription related info', async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const updatePayload = Object.assign({}, subscriptionUpdated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.updateSubscription(updatePayload)

            const sub = await storage.get(ids)
            expect(sub.cancel_url).to.equal(updatePayload.cancel_url)
            expect(sub.checkout_id).to.equal(updatePayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(3)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(updatePayload.update_url)
            expect(sub.subscription_id).to.equal(updatePayload.subscription_id)
            expect(sub.subscription_plan_id).to.equal(updatePayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(updatePayload.user_id)

            const status0 = sub.status[0]
            expect(status0.description).to.equal('pre-checkout-placeholder')

            const status1 = sub.status[1]
            expect(status1.alert_id).to.equal(createPayload.alert_id)
            expect(status1.alert_name).to.equal(createPayload.alert_name)
            expect(status1.currency).to.equal(createPayload.currency)
            expect(status1.description).to.equal(createPayload.status)
            expect(status1.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status1.unit_price).to.equal(createPayload.unit_price)
            expect(status1.quantity).to.equal(createPayload.quantity)
            expect(status1.start_at).to.equal(createPayload.event_time)

            const status2 = sub.status[2]
            // ensure we changed these values
            expect(status2.currency).to.not.equal(createPayload.currency)
            expect(status2.next_bill_date).to.not.equal(createPayload.next_bill_date)
            expect(status2.unit_price).to.not.equal(createPayload.unit_price)
            expect(status2.quantity).to.not.equal(createPayload.quantity)
            expect(status2.start_at).to.not.equal(createPayload.event_time)
            // these values must be equal to update payload values
            expect(status2.alert_id).to.equal(updatePayload.alert_id)
            expect(status2.alert_name).to.equal(updatePayload.alert_name)
            expect(status2.currency).to.equal(updatePayload.currency)
            expect(status2.description).to.equal(updatePayload.status)
            expect(status2.next_bill_date).to.equal(updatePayload.next_bill_date)
            expect(status2.unit_price).to.equal(updatePayload.new_unit_price)
            expect(status2.quantity).to.equal(updatePayload.new_quantity)
            expect(status2.start_at).to.equal(updatePayload.event_time)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.updateSubscription(null).then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.cancelSubscription', () => {
        it('cancels a subscription', async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString()
                }
            )
            await paddleIntegration.cancelSubscription(payload)

            const sub = await storage.get(ids)
            const isActive = await paddleIntegration.isSubscriptionActive(sub)
            expect(isActive).to.be.false
        })
        it('updates subscription related info', async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const cancelPayload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString()
                }
            )
            await paddleIntegration.cancelSubscription(cancelPayload)

            const sub = await storage.get(ids)
            expect(sub.cancel_url).to.equal(createPayload.cancel_url)
            expect(sub.checkout_id).to.equal(createPayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(3)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(createPayload.update_url)
            expect(sub.subscription_id).to.equal(createPayload.subscription_id)
            // this is the only value that might get changed
            // at least potentially, it doesnt make huge sense from business perspective
            expect(sub.subscription_plan_id).to.equal(cancelPayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(createPayload.user_id)

            const status = sub.status[2]
            expect(status.alert_id).to.equal(cancelPayload.alert_id)
            expect(status.alert_name).to.equal(cancelPayload.alert_name)
            expect(status.currency).to.equal(cancelPayload.currency)
            expect(status.description).to.equal(cancelPayload.status)
            expect(status.unit_price).to.equal(cancelPayload.unit_price)
            expect(status.quantity).to.equal(cancelPayload.quantity)
            expect(status.start_at).to.equal(cancelPayload.cancellation_effective_date)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.cancelSubscription(null).then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.addSuccessfulPayment', () => {
        it('stores webhook payload', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSubscription(createPayload)

            let sub = await storage.get(ids)
            expect(sub.payments).to.have.length(0)

            const paymentPayload = Object.assign({}, paymentSucceded, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSuccessfulPayment(paymentPayload)

            sub = await storage.get(ids)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_succeeded')
        })
    })

    describe('.addRefundedPayment', () => {
        it('stores webhook payload', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSubscription(createPayload)

            const paymentPayload = Object.assign({}, paymentRefunded, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addRefundedPayment(paymentPayload)

            const sub = await storage.get(ids)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_refunded')

        })
    })

    describe('.addFailedPayment', () => {
        it('stores webhook payload', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSubscription(createPayload)

            const paymentPayload = Object.assign({}, paymentFailed, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addFailedPayment(paymentPayload)

            const sub = await storage.get(ids)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_failed')
        })
    })

    describe('.isSubscriptionActive', () => {
        it('takes the most recent status into account', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )
            await paddleIntegration.cancelSubscription(payload)

            const sub = await storage.get(ids)
            const isActive = await paddleIntegration.isSubscriptionActive(sub)
            expect(isActive).to.be.false
        })
        it('ignores a status that starts in the future', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await paddleIntegration.cancelSubscription(payload)

            const sub = await storage.get(ids)
            const isActive = await paddleIntegration.isSubscriptionActive(sub)
            expect(isActive).to.be.true
        })
        it('accepts a second parameter that changes the target date', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscription(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await paddleIntegration.cancelSubscription(payload)

            const sub = await storage.get(ids)
            const isActive = await paddleIntegration.isSubscriptionActive(sub, new Date(new Date().getTime() + 5000))
            expect(isActive).to.be.false
        })
    })
})