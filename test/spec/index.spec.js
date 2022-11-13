'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')
const paymentSucceded = require('../fixtures/payment-succeeded')
const paymentFailed = require('../fixtures/payment-failed')
const paymentRefunded = require('../fixtures/payment-refunded')

const { SubscriptionsHooks, htmlEncoder, SubscriptionInfo } = require('../../lib/index')
const paddleIntegration = new SubscriptionsHooks('api_client')
const subscriptionInfo = new SubscriptionInfo('api_client', { hookStorage: paddleIntegration })
const storage = require('../../lib/firestore/nested-firestore-resource')({ documentPath: 'api_client', resourceName: 'api_clients' })

const { expect } = require('chai')

describe('PaddleIntegration', () => {

    let ids

    beforeEach(async () => {
        ids = [uuid()]
        await storage.put(ids, {})
        await paddleIntegration.addSubscriptionPlaceholder(ids)
    })

    describe('.addSubscription', () => {
        it('creates an aactive subscription', async () => {
            const createPayload = Object.assign({}, subscriptionCreated, { passthrough: JSON.stringify({ ids }) })

            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)
            const { subscription: sub } = await storage.get(ids)
            const status = await subscriptionInfo.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.true
        })
        it('stores subscription related info', async () => {
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: uuid(), passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const { subscription: sub } = await storage.get(ids)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(2)

            const status = sub.status[1]
            expect(status.alert_id).to.equal(createPayload.alert_id)
            expect(status.alert_name).to.equal(createPayload.alert_name)
            expect(status.currency).to.equal(createPayload.currency)
            expect(status.description).to.equal(createPayload.status)
            expect(status.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status.quantity).to.equal(createPayload.quantity)
            expect(status.event_time).to.equal(createPayload.event_time)
            expect(status.cancel_url).to.equal(htmlEncoder(createPayload.cancel_url))
            expect(status.checkout_id).to.equal(createPayload.checkout_id)
            expect(status.source).to.equal(createPayload.source)
            expect(status.update_url).to.equal(htmlEncoder(createPayload.update_url))
            expect(status.subscription_id).to.equal(createPayload.subscription_id)
            expect(status.subscription_plan_id).to.equal(createPayload.subscription_plan_id)
            expect(status.vendor_user_id).to.equal(createPayload.user_id)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.addSubscriptionCreatedStatus(null).then(() => {
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
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const updatePayload = Object.assign({}, subscriptionUpdated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionUpdatedStatus(updatePayload)

            const { subscription: sub } = await storage.get(ids)
            expect(sub.payments).to.have.length(0)
            // 1. placeholder
            // 2. subscription created
            // 3. perpetual status subscription 
            expect(sub.status).to.have.length(4)

            const status0 = sub.status[0]
            expect(status0.description).to.equal('pi/pre-checkout-placeholder')

            const status1 = sub.status[1]
            expect(status1.alert_id).to.equal(createPayload.alert_id)
            expect(status1.alert_name).to.equal(createPayload.alert_name)
            expect(status1.currency).to.equal(createPayload.currency)
            expect(status1.description).to.equal(createPayload.status)
            expect(status1.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status1.quantity).to.equal(createPayload.quantity)
            expect(status1.event_time).to.equal(createPayload.event_time)
            expect(status1.cancel_url).to.equal(htmlEncoder(createPayload.cancel_url))
            expect(status1.checkout_id).to.equal(createPayload.checkout_id)
            expect(status1.source).to.equal(createPayload.source)
            expect(status1.update_url).to.equal(htmlEncoder(createPayload.update_url))
            expect(status1.subscription_id).to.equal(createPayload.subscription_id)
            expect(status1.subscription_plan_id).to.equal(createPayload.subscription_plan_id)
            expect(status1.vendor_user_id).to.equal(createPayload.user_id)

            const status2 = sub.status[2]
            expect(status2.currency).to.not.equal(createPayload.currency)
            // these values must be equal to update payload values
            expect(status2.alert_id).to.equal(updatePayload.alert_id)
            expect(status2.alert_name).to.equal(updatePayload.alert_name)
            expect(status2.currency).to.equal(updatePayload.currency)
            expect(status2.description).to.equal('pi/superseded-by-update')
            expect(status2.checkout_id).to.equal(updatePayload.checkout_id)
            expect(status2.quantity).to.equal(updatePayload.old_quantity)
            expect(status2.event_time).to.equal(updatePayload.event_time)
            expect(status2.subscription_id).to.equal(updatePayload.subscription_id)
            expect(status2.subscription_plan_id).to.equal(updatePayload.old_subscription_plan_id)
            expect(status2.vendor_user_id).to.equal(updatePayload.user_id)

            const status3 = sub.status[3]
            // ensure we changed these values
            expect(status3.currency).to.not.equal(createPayload.currency)
            expect(status3.next_bill_date).to.not.equal(createPayload.next_bill_date)
            expect(status3.quantity).to.not.equal(createPayload.quantity)
            expect(status3.event_time).to.not.equal(createPayload.event_time)
            // these values must be equal to update payload values
            expect(status3.alert_id).to.equal(updatePayload.alert_id)
            expect(status3.alert_name).to.equal(updatePayload.alert_name)
            expect(status3.currency).to.equal(updatePayload.currency)
            expect(status3.description).to.equal(updatePayload.status)
            expect(status3.next_bill_date).to.equal(updatePayload.next_bill_date)
            expect(status3.quantity).to.equal(updatePayload.new_quantity)
            expect(status3.event_time).to.equal(updatePayload.event_time)
            expect(status3.update_url).to.equal(htmlEncoder(updatePayload.update_url))
            expect(status3.subscription_id).to.equal(updatePayload.subscription_id)
            expect(status3.subscription_plan_id).to.equal(updatePayload.subscription_plan_id)
            expect(status3.vendor_user_id).to.equal(updatePayload.user_id)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.addSubscriptionUpdatedStatus(null).then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.addSubscriptionCancelledStatus', () => {
        it('cancels a subscription', async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const status = await subscriptionInfo.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('updates subscription related info', async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const cancelPayload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(cancelPayload)

            const { subscription: sub } = await storage.get(ids)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(3)

            const status = sub.status[2]
            expect(status.alert_id).to.equal(cancelPayload.alert_id)
            expect(status.alert_name).to.equal(cancelPayload.alert_name)
            expect(status.currency).to.equal(cancelPayload.currency)
            expect(status.description).to.equal(cancelPayload.status)
            expect(status.quantity).to.equal(cancelPayload.quantity)
            expect(status.event_time).to.equal(cancelPayload.cancellation_effective_date)
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.addSubscriptionCancelledStatus(null).then(() => {
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
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            let { subscription: sub } = await storage.get(ids)
            expect(sub.payments).to.have.length(0)

            const paymentPayload = Object.assign({}, paymentSucceded, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSuccessfulPayment(paymentPayload);

            ({ subscription: sub } = await storage.get(ids))
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
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const paymentPayload = Object.assign({}, paymentRefunded, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addRefundedPayment(paymentPayload)

            const { subscription: sub } = await storage.get(ids)
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
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const paymentPayload = Object.assign({}, paymentFailed, {
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addFailedPayment(paymentPayload)

            const { subscription: sub } = await storage.get(ids)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_failed')
        })
    })
})