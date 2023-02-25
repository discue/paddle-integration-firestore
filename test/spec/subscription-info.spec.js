'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')
const paymentSucceded = require('../fixtures/payment-succeeded')
const paymentFailed = require('../fixtures/payment-failed')
const paymentRefunded = require('../fixtures/payment-refunded')

const { SubscriptionInfo, SubscriptionHooks } = require('../../lib/index')
const resourceName = '$$subscription'
const subscriptions = new SubscriptionHooks('api_client', { resourceName })
const subscriptionInfo = new SubscriptionInfo('api_client', { hookStorage: subscriptions, resourceName })
const storage = require('../../lib/firestore/nested-firestore-resource')({ documentPath: 'api_client', resourceName: 'api_clients' })
const { customData } = require('../../lib/client/index')
const encode = require('../../lib/html-encoder.js')

const { expect } = require('chai')
const { UPCOMING_PAYMENTS_DESCRIPTION } = require('../../lib/subscription-descriptions')

describe('SubscriptionInfo', () => {

    let ids

    beforeEach(async () => {
        ids = [uuid()]
        await storage.put(ids, {})
        await subscriptions.addSubscriptionPlaceholder(ids)
    })

    describe('.getSubscriptionInfo', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const paymentSuccesfulPayload = Object.assign({}, paymentSucceded, {
                event_time: '2017-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload)

            const paymentSuccesfulPayload2 = Object.assign({}, paymentSucceded, {
                event_time: '2019-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload2)
        })
        it('indicates the subscription is active', async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const status = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(status[subscriptionCreated.subscription_plan_id].active).to.be.true
        })
        it('returns end dates for a subscription if it was cancelled', async () => {
            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: 'subscriptionId',
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date().toISOString()
                }
            )

            await subscriptions.addSubscriptionCancelledStatus(payload)
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const status = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(status[subscriptionCreated.subscription_plan_id].start).to.match(/[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/)
            expect(status[subscriptionCreated.subscription_plan_id].end).to.match(/[0-9]{2}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/)
        })
        it('removes an upcoming payment event if its after an end date', async () => {
            const paymentSuccesfulPayload2 = Object.assign({}, paymentSucceded, {
                event_time: '2020-08-08 10:47:47',
                next_bill_date: '2030-01-01',
                subscription_id: 'subscriptionId',
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload2)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: 'subscriptionId',
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date().toISOString()
                }
            )

            await subscriptions.addSubscriptionCancelledStatus(payload)

            const status = await subscriptionInfo.getSubscriptionInfo(ids)
            const { payments_trail: paymentTrail } = status[subscriptionCreated.subscription_plan_id]
            const found = paymentTrail.find(payment => payment.description === UPCOMING_PAYMENTS_DESCRIPTION)
            expect(found).to.be.undefined
        })
        it('keeps an upcoming payment event if it is scheduled before an end date', async () => {
            const paymentSuccesfulPayload2 = Object.assign({}, paymentSucceded, {
                event_time: '2019-08-08 10:47:47',
                subscription_id: 'subscriptionId',
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload2)

            const status = await subscriptionInfo.getSubscriptionInfo(ids)
            const { payments_trail: paymentTrail } = status[subscriptionCreated.subscription_plan_id]
            const found = paymentTrail.find(payment => payment.description === UPCOMING_PAYMENTS_DESCRIPTION)
            expect(found).to.not.be.undefined
        })
        it('indicates the subscription is not active', async () => {
            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: 'subscriptionId',
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date().toISOString()
                }
            )

            await subscriptions.addSubscriptionCancelledStatus(payload)
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const status = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(status[subscriptionCreated.subscription_plan_id].active).to.be.false
        })
        it('returns a sorted list of status events', async () => {
            const { [subscriptionCreated.subscription_plan_id]: { status_trail } } = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(status_trail).to.have.length(1)

            const sorted = status_trail.every((status, index, array) => {
                if (index === 0) {
                    return true
                } else {
                    return new Date(status.event_time).getTime() <= new Date(array[index - 1].event_time).getTime()
                }
            })

            expect(sorted).to.be.true
        })
        it('returns status events with update and cancel urls', async () => {
            const { [subscriptionCreated.subscription_plan_id]: { status_trail } } = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(status_trail).to.have.length(1)

            expect(status_trail[0].update_url).to.equal(encode(subscriptionCreated.update_url))
            expect(status_trail[0].cancel_url).to.equal(encode(subscriptionCreated.cancel_url))
        })
        it('returns a sorted list of payment events', async () => {
            const { [subscriptionCreated.subscription_plan_id]: { payments_trail } } = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(payments_trail).to.have.length(3)

            const sorted = payments_trail.every((payment, index, array) => {
                if (index === 0) {
                    return true
                } else {
                    return new Date(payment.event_time).getTime() <= new Date(array[index - 1].event_time).getTime()
                }
            })

            expect(sorted).to.be.true
        })
        it('indicates which one of updated and supereseded subs is active', async () => {
            const updatePayload = Object.assign({}, subscriptionUpdated,
                {
                    event_time: new Date().toISOString(),
                    subscription_id: 'subscriptionId',
                    old_subscription_plan_id: '8',
                    subscription_plan_id: '1',
                    passthrough: JSON.stringify(customData(ids))
                }
            )
            await subscriptions.addSubscriptionUpdatedStatus(updatePayload)

            const subs = await subscriptionInfo.getSubscriptionInfo(ids)
            expect(subs['8'].active).to.be.false
            expect(subs['1'].active).to.be.true
        })
    })

    describe('.cancelSubscription', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)
        })
        it('throws if no subscription with plan was found', async () => {
            const { $$subscription: sub } = await storage.get(ids)

            try {
                await subscriptionInfo.cancelSubscription(sub, '99')
                throw new Error('Method must throw not found')
            } catch (e) {
                const message = e.message
                expect(message).to.equal(SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND)
            }
        })
        it('throws if subscription was already cancelled', async () => {
            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: 'subscriptionId',
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )

            await subscriptions.addSubscriptionCancelledStatus(payload)
            const { $$subscription: sub } = await storage.get(ids)

            try {
                await subscriptionInfo.cancelSubscription(sub, '8')
                throw new Error('Method must throw "SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED"')
            } catch (e) {
                const message = e.message
                expect(message).to.equal(SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED)
            }
        })
    })

    describe('.updateSubscription', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)
        })
        it('throws if no subscription with plan was found', async () => {
            const { $$subscription: sub } = await storage.get(ids)

            try {
                await subscriptionInfo.updateSubscription(sub, '99', '123')
                throw new Error('Method must throw not found')
            } catch (e) {
                const message = e.message
                expect(message).to.equal(SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND)
            }
        })
        it('throws if subscription was already cancelled', async () => {
            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: 'subscriptionId',
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )

            await subscriptions.addSubscriptionCancelledStatus(payload)
            const { $$subscription: sub } = await storage.get(ids)

            try {
                await subscriptionInfo.updateSubscription(sub, '8', '123')
                throw new Error('Method must throw "SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED"')
            } catch (e) {
                const message = e.message
                expect(message).to.equal(SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED)
            }
        })
    })

    describe('.getAllSubscriptionsStatus', () => {
        it('takes the most recent status into account', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const status = await subscriptionInfo.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('also accepts clientId array', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const status = await subscriptionInfo.getAllSubscriptionsStatus(ids)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('allows 10s clock drift', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime() + 9_000).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const status = await subscriptionInfo.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('ignores a status that starts more than 10s in the future', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime() + 50_000).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const status = await subscriptionInfo.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.true
        })
        it('accepts a second parameter that changes the target date', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const subs = await subscriptionInfo.getAllSubscriptionsStatus(sub, new Date(new Date().getTime() + 5000))
            expect(subs[createPayload.subscription_plan_id]).to.be.false
        })
        it('returns status per subscription plan id', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const createPayload2 = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    subscription_plan_id: '9',
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload2)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const subs = await subscriptionInfo.getAllSubscriptionsStatus(sub, new Date(new Date().getTime() + 5000))
            expect(subs[createPayload.subscription_plan_id]).to.be.false
            expect(subs[createPayload2.subscription_plan_id]).to.be.true
        })
    })

    describe('.getStartAndEndDates', () => {
        it('returns dates for each known subscription plan id', async () => {
            const subscriptionId = uuid()
            const startTimeString = new Date().toISOString()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)
            const createPayload2 = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString,
                    subscription_plan_id: '4'
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload2)

            const { $$subscription: sub } = await storage.get(ids)
            const dates = await subscriptionInfo.getStartAndEndDates(sub)
            expect(dates).to.have.keys(createPayload.subscription_plan_id, createPayload2.subscription_plan_id)
        })
        it('also accepts clientId array as parameter', async () => {
            const subscriptionId = uuid()
            const startTimeString = new Date().toISOString()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)
            const createPayload2 = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString,
                    subscription_plan_id: '4'
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload2)

            const { $$subscription: sub } = await storage.get(ids)
            const dates = await subscriptionInfo.getStartAndEndDates(ids)
            expect(dates).to.have.keys(createPayload.subscription_plan_id, createPayload2.subscription_plan_id)
        })
        it('returns only start date if theres no end date', async () => {
            const subscriptionId = uuid()
            const startTimeString = new Date().toISOString()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const { $$subscription: sub } = await storage.get(ids)
            const { [createPayload.subscription_plan_id]: { start, end } } = await subscriptionInfo.getStartAndEndDates(sub)
            expect(start).to.equal(startTimeString)
            expect(end).to.be.null
        })
        it('returns start and end date', async () => {
            const subscriptionId = uuid()
            const startTimeString = new Date().toISOString()
            const endTimeString = new Date(new Date().getTime() + 1000 * 3600 * 24 * 33).toISOString()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: startTimeString
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: endTimeString
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(payload)

            const { $$subscription: sub } = await storage.get(ids)
            const { [createPayload.subscription_plan_id]: { start, end } } = await subscriptionInfo.getStartAndEndDates(sub, new Date(2099, 1))
            expect(start).to.equal(startTimeString)
            expect(end).to.equal(endTimeString)
        })
    })

    describe('.getPaymentsTrail', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, {
                event_time: '2018-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const paymentSuccesfulPayload = Object.assign({}, paymentSucceded, {
                event_time: '2017-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload)

            const paymentSuccesfulPayload2 = Object.assign({}, paymentSucceded, {
                event_time: '2017-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addSuccessfulPayment(paymentSuccesfulPayload2)

            const paymentFailedPayload = Object.assign({}, paymentFailed, {
                event_time: '2022-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addFailedPayment(paymentFailedPayload)

            const paymentRefundedPayload1 = Object.assign({}, paymentRefunded, {
                event_time: '2024-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addRefundedPayment(paymentRefundedPayload1)


            const paymentRefundedPayload2 = Object.assign({}, paymentRefunded, {
                event_time: '2014-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addRefundedPayment(paymentRefundedPayload2)

            const paymentFailedPayload2 = Object.assign({}, paymentFailed, {
                event_time: '2012-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify(customData(ids)),
            })
            await subscriptions.addFailedPayment(paymentFailedPayload2)
        })
        it('returns payments sorted descending', async () => {
            const { $$subscription: sub } = await storage.get(ids)
            const trail = await subscriptionInfo.getPaymentsTrail(sub)

            const sorted = Object.values(trail).every((payments) => {
                return payments.every((payment, index, array) => {
                    if (index === 0) {
                        return true
                    } else {
                        return new Date(payment.event_time).getTime() <= new Date(array[index - 1].event_time).getTime()
                    }
                })
            })

            expect(sorted).to.be.true
        })
        it('accepts also clientId array as parameter', async () => {
            const trail = await subscriptionInfo.getPaymentsTrail(ids)

            const sorted = Object.values(trail).every((payments) => {
                return payments.every((payment, index, array) => {
                    if (index === 0) {
                        return true
                    } else {
                        return new Date(payment.event_time).getTime() <= new Date(array[index - 1].event_time).getTime()
                    }
                })
            })

            expect(sorted).to.be.true
        })
        it('returns a sorted listed of payments per subscription plan id 8', async () => {
            const { $$subscription: sub } = await storage.get(ids)
            const trail = await subscriptionInfo.getPaymentsTrail(sub)

            expect(trail).to.have.keys(paymentSucceded.subscription_plan_id, '4')

            const paymentsForSubscription = trail[paymentSucceded.subscription_plan_id]
            expect(paymentsForSubscription).to.have.length(4)
            expect(paymentsForSubscription[3].description).to.equal('subscription_payment_failed')
            expect(paymentsForSubscription[3].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[3].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[3].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[3].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[3].next_try.date).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[3].instalments).to.equal(paymentFailed.instalments)
            expect(paymentsForSubscription[3].subscription_plan_id).to.equal(paymentFailed.subscription_plan_id)

            expect(paymentsForSubscription[2].description).to.equal('subscription_payment_refunded')
            expect(paymentsForSubscription[2].amount.currency).to.equal(paymentRefunded.currency)
            expect(paymentsForSubscription[2].amount.total).to.equal(paymentRefunded.gross_refund)
            expect(paymentsForSubscription[2].amount.quantity).to.equal(paymentRefunded.quantity)
            expect(paymentsForSubscription[2].amount.unit_price).to.equal(paymentRefunded.unit_price)
            expect(paymentsForSubscription[2].refund.reason).to.equal(paymentRefunded.refund_reason)
            expect(paymentsForSubscription[2].refund.type).to.equal(paymentRefunded.refund_type)
            expect(paymentsForSubscription[2].instalments).to.equal(paymentRefunded.instalments)
            expect(paymentsForSubscription[2].subscription_plan_id).to.equal(paymentRefunded.subscription_plan_id)

            expect(paymentsForSubscription[1].description).to.equal('subscription_payment_succeeded')
            expect(paymentsForSubscription[1].amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[1].amount.total).to.equal(paymentSucceded.sale_gross)
            expect(paymentsForSubscription[1].amount.quantity).to.equal(paymentSucceded.quantity)
            expect(paymentsForSubscription[1].amount.unit_price).to.equal(paymentSucceded.unit_price)
            expect(paymentsForSubscription[1].amount.method).to.equal(paymentSucceded.payment_method)
            expect(paymentsForSubscription[1].next_payment.date).to.equal(paymentSucceded.next_bill_date)
            expect(paymentsForSubscription[1].next_payment.amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[1].next_payment.amount.total).to.equal(paymentSucceded.next_payment_amount)
            expect(paymentsForSubscription[1].receipt_url).to.equal(paymentSucceded.receipt_url)
            expect(paymentsForSubscription[1].instalments).to.equal(paymentSucceded.instalments)
            expect(paymentsForSubscription[1].subscription_plan_id).to.equal(paymentSucceded.subscription_plan_id)

            expect(paymentsForSubscription[0].description).to.equal('pi/upcoming_payment')
            expect(paymentsForSubscription[0].event_time).to.equal(paymentSucceded.next_bill_date)
            expect(paymentsForSubscription[0].amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[0].amount.total).to.equal(paymentSucceded.next_payment_amount)
            expect(paymentsForSubscription[0].amount.quantity).to.equal(paymentSucceded.quantity)
            expect(paymentsForSubscription[0].amount.unit_price).to.equal(paymentSucceded.unit_price)
            expect(paymentsForSubscription[0].subscription_plan_id).to.equal(paymentSucceded.subscription_plan_id)
        })

        it('returns a sorted listed of payments per subscription plan id 4 and ignores refunded payment hook', async () => {
            const { $$subscription: sub } = await storage.get(ids)
            const trail = await subscriptionInfo.getPaymentsTrail(sub)

            expect(trail).to.have.keys(paymentSucceded.subscription_plan_id, '4')

            const paymentsForSubscription = trail['4']
            expect(paymentsForSubscription).to.have.length(3)

            expect(paymentsForSubscription[2].description).to.equal('subscription_payment_succeeded')
            expect(paymentsForSubscription[2].amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[2].amount.total).to.equal(paymentSucceded.sale_gross)
            expect(paymentsForSubscription[2].amount.quantity).to.equal(paymentSucceded.quantity)
            expect(paymentsForSubscription[2].amount.unit_price).to.equal(paymentSucceded.unit_price)
            expect(paymentsForSubscription[2].amount.method).to.equal(paymentSucceded.payment_method)
            expect(paymentsForSubscription[2].next_payment.date).to.equal(paymentSucceded.next_bill_date)
            expect(paymentsForSubscription[2].next_payment.amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[2].next_payment.amount.total).to.equal(paymentSucceded.next_payment_amount)
            expect(paymentsForSubscription[2].receipt_url).to.equal(paymentSucceded.receipt_url)
            expect(paymentsForSubscription[2].instalments).to.equal(paymentSucceded.instalments)
            expect(paymentsForSubscription[2].subscription_plan_id).to.equal('4')

            expect(paymentsForSubscription[1].description).to.equal('subscription_payment_failed')
            expect(paymentsForSubscription[1].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[1].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[1].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[1].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[1].next_try.date).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[1].instalments).to.equal(paymentFailed.instalments)
            expect(paymentsForSubscription[1].subscription_plan_id).to.equal('4')

            expect(paymentsForSubscription[0].description).to.equal('pi/upcoming_payment')
            expect(paymentsForSubscription[0].event_time).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[0].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[0].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[0].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[0].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[0].subscription_plan_id).to.equal('4')
        })
    })

    describe('.getStatusTrail', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()

            await subscriptions.addSubscriptionPlaceholder(ids)

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    event_time: new Date().toISOString(),
                    subscription_id: subscriptionId, passthrough: JSON.stringify(customData(ids))
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)

            const updatePayload = Object.assign({}, subscriptionUpdated,
                {
                    event_time: new Date().toISOString(),
                    subscription_id: subscriptionId, passthrough: JSON.stringify(customData(ids))
                }
            )
            await subscriptions.addSubscriptionUpdatedStatus(updatePayload)

            const cancelPayload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    cancellation_effective_date: new Date().toISOString(),
                }
            )
            await subscriptions.addSubscriptionCancelledStatus(cancelPayload)
        })

        it('returns a sorted listed of status per id', async () => {
            const { $$subscription: sub } = await storage.get(ids)
            const trail = await subscriptionInfo.getStatusTrail(sub)
            const subscriptionTrail = trail[subscriptionCreated.subscription_plan_id]
            expect(subscriptionTrail).to.have.length(3)
            // expect(subscriptionTrail).to.have.length(3)
            expect(subscriptionTrail[2].type).to.equal('subscription_created')
            expect(subscriptionTrail[2].description).to.equal('active')
            expect(subscriptionTrail[1].type).to.equal('subscription_updated')
            expect(subscriptionTrail[1].description).to.equal('active')
            expect(subscriptionTrail[0].type).to.equal('subscription_cancelled')
            expect(subscriptionTrail[0].description).to.equal('deleted')
        })
        it('also accepts clientIds array as parameter', async () => {
            const trail = await subscriptionInfo.getStatusTrail(ids)
            const subscriptionTrail = trail[subscriptionCreated.subscription_plan_id]
            expect(subscriptionTrail).to.have.length(3)
            // expect(subscriptionTrail).to.have.length(3)
            expect(subscriptionTrail[2].type).to.equal('subscription_created')
            expect(subscriptionTrail[2].description).to.equal('active')
            expect(subscriptionTrail[1].type).to.equal('subscription_updated')
            expect(subscriptionTrail[1].description).to.equal('active')
            expect(subscriptionTrail[0].type).to.equal('subscription_cancelled')
            expect(subscriptionTrail[0].description).to.equal('deleted')
        })
    })

    describe('.findSubscriptionIdByPlanId', () => {
        let subscriptionId
        beforeEach(async () => {
            subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify(customData(ids)),
                    event_time: new Date().toISOString()
                }
            )
            await subscriptions.addSubscriptionCreatedStatus(createPayload)
        })
        it('returns the subscription id', async () => {
            const id = await subscriptionInfo.findSubscriptionIdByPlanId(ids, '8')
            expect(id).to.equal(subscriptionId)
        })
        it('returns null if no subscription id was found for plan', async () => {
            const id = await subscriptionInfo.findSubscriptionIdByPlanId(ids, '18')
            expect(id).to.be.null
        })
    })
})