'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')
const paymentSucceded = require('../fixtures/payment-succeeded')
const paymentFailed = require('../fixtures/payment-failed')
const paymentRefunded = require('../fixtures/payment-refunded')

const paddleIntegration = require('../../lib/index')
const storage = require('../../lib/storage/subscriptions')

const { expect } = require('chai')

describe('PaddleIntegration', () => {

    describe('.addSubscription', () => {
        it('creates an aactive subscription', async () => {
            const id = uuid()
            await paddleIntegration.addSubscription(id, subscriptionCreated)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })
        it('stores subscription related info', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.cancel_url).to.equal(createPayload.cancel_url)
            expect(sub.checkout_id).to.equal(createPayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(1)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(createPayload.update_url)
            expect(sub.subscription_id).to.equal(createPayload.subscription_id)
            expect(sub.subscription_plan_id).to.equal(createPayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(createPayload.user_id)
            expect(sub.identifier).to.equal(id)

            const status = sub.status[0]
            expect(status.currency).to.equal(createPayload.currency)
            expect(status.description).to.equal(createPayload.status)
            expect(status.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status.unit_price).to.equal(createPayload.unit_price)
            expect(status.quantity).to.equal(createPayload.quantity)
            expect(status.start_at).to.equal(createPayload.event_time)
        })
        it('throws if identifier is falsy', () => {
            return paddleIntegration.addSubscription(null, 'not-null').then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                console.log(error.message)
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
        it('throws if subscription is falsy', () => {
            return paddleIntegration.addSubscription('not-null', null).then(() => {
                return Promise.reject('Must throw an error')
            }, (error) => {
                console.log(error.message)
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.updateSubscription', () => {
        it('updates a subscription', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const payload = Object.assign({}, subscriptionUpdated, { subscription_id: subscriptionId })
            await paddleIntegration.updateSubscription(payload)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })
        it('updates subscription related info', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const updatePayload = Object.assign({}, subscriptionUpdated, { subscription_id: subscriptionId })
            await paddleIntegration.updateSubscription(updatePayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.cancel_url).to.equal(updatePayload.cancel_url)
            expect(sub.checkout_id).to.equal(updatePayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(2)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(updatePayload.update_url)
            expect(sub.subscription_id).to.equal(updatePayload.subscription_id)
            expect(sub.subscription_plan_id).to.equal(updatePayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(updatePayload.user_id)
            expect(sub.identifier).to.equal(id)

            const status1 = sub.status[0]
            expect(status1.currency).to.equal(createPayload.currency)
            expect(status1.description).to.equal(createPayload.status)
            expect(status1.next_bill_date).to.equal(createPayload.next_bill_date)
            expect(status1.unit_price).to.equal(createPayload.unit_price)
            expect(status1.quantity).to.equal(createPayload.quantity)
            expect(status1.start_at).to.equal(createPayload.event_time)

            const status2 = sub.status[1]
            // ensure we changed these values
            expect(status2.currency).to.not.equal(createPayload.currency)
            expect(status2.next_bill_date).to.not.equal(createPayload.next_bill_date)
            expect(status2.unit_price).to.not.equal(createPayload.unit_price)
            expect(status2.quantity).to.not.equal(createPayload.quantity)
            expect(status2.start_at).to.not.equal(createPayload.event_time)
            // these values must be equal to update payload values
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
                console.log(error.message)
                if (error.message !== 'INVALID_ARGUMENTS') {
                    return Promise.reject('Must throw an error "INVALID_ARGUMENTS')
                }
            })
        })
    })

    describe('.cancelSubscription', () => {
        it('cancels a subscription', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const payload = Object.assign({}, subscriptionCancelled, { subscription_id: subscriptionId, cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString() })
            await paddleIntegration.cancelSubscription(payload)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [payload.subscription_plan_id])
            expect(isActive).to.be.false
        })
        it('updates subscription related info', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const cancelPayload = Object.assign({}, subscriptionCancelled, { subscription_id: subscriptionId, cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString() })
            await paddleIntegration.cancelSubscription(cancelPayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.cancel_url).to.equal(createPayload.cancel_url)
            expect(sub.checkout_id).to.equal(createPayload.checkout_id)
            expect(sub.payments).to.have.length(0)
            expect(sub.status).to.have.length(2)
            expect(sub.source).to.equal(createPayload.source)
            expect(sub.update_url).to.equal(createPayload.update_url)
            expect(sub.subscription_id).to.equal(createPayload.subscription_id)
            // this is the only value that might get changed
            // at least potentially, it doesnt make huge sense from business perspective
            expect(sub.subscription_plan_id).to.equal(cancelPayload.subscription_plan_id)
            expect(sub.vendor_user_id).to.equal(createPayload.user_id)
            expect(sub.identifier).to.equal(id)

            const status = sub.status[1]
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

    describe('.hasActiveSubscription', () => {
        it('returns true if one active subscription with given plan id was found', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const isActive = await paddleIntegration.hasActiveSubscription(id, [1, 2, 3, subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })

        it('returns false if no subscription was found', async () => {
            const isActive = await paddleIntegration.hasActiveSubscription('zero', ['9'])
            expect(isActive).to.be.false
        })

        it('ignore subscriptions with other ids', async () => {
            const id1 = uuid()
            const id2 = uuid()

            const payloadSubscription1 = Object.assign({}, subscriptionCreated, { subscription_id: id1, subscription_plan_id: 1 })
            const payloadSubscription2 = Object.assign({}, subscriptionCreated, { subscription_id: id2 })

            await paddleIntegration.addSubscription('userId', payloadSubscription1)
            await paddleIntegration.addSubscription('userId', payloadSubscription2)

            const cancelSubscription1 = Object.assign({}, subscriptionCancelled, { subscription_id: id1, subscription_plan_id: 1 })
            await paddleIntegration.cancelSubscription(cancelSubscription1)

            const isSubscription1Active = await paddleIntegration.hasActiveSubscription('userId', ['1'])
            expect(isSubscription1Active).to.be.false

            const isSubscription2Active = await paddleIntegration.hasActiveSubscription('userId', ['8'])
            expect(isSubscription2Active).to.be.true
        })
    })

    describe('.addSuccessfulPayment', () => {
        it('returns true if one active subscription with given plan id was found', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const paymentPayload = Object.assign({}, paymentSucceded, { subscription_id: subscriptionId })
            await paddleIntegration.addSuccessfulPayment(paymentPayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_succeeded')
        })
    })

    describe('.addRefundedPayment', () => {
        it('returns true if one active subscription with given plan id was found', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const paymentPayload = Object.assign({}, paymentRefunded, { subscription_id: subscriptionId })
            await paddleIntegration.addRefundedPayment(paymentPayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_refunded')

        })
    })

    describe('.addFailedPayment', () => {
        it('returns true if one active subscription with given plan id was found', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const paymentPayload = Object.assign({}, paymentFailed, { subscription_id: subscriptionId })
            await paddleIntegration.addFailedPayment(paymentPayload)

            const sub = await storage.get(subscriptionId)
            expect(sub.payments).to.have.length(1)

            const [payment] = sub.payments
            expect(payment.alert_name).to.equal('subscription_payment_failed')
        })
    })
})