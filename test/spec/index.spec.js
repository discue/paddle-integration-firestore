'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')
const paymentSucceded = require('../fixtures/payment-succeeded')
const paymentFailed = require('../fixtures/payment-failed')
const paymentRefunded = require('../fixtures/payment-refunded')

const { Subscriptions, htmlEncoder } = require('../../lib/index')
const paddleIntegration = new Subscriptions('api_client')
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
            const status = await paddleIntegration.getAllSubscriptionsStatus(sub)
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
            expect(status.unit_price).to.equal(createPayload.unit_price)
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
            expect(status1.unit_price).to.equal(createPayload.unit_price)
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
            expect(status2.unit_price).to.equal(updatePayload.old_unit_price)
            expect(status2.quantity).to.equal(updatePayload.old_quantity)
            expect(status2.event_time).to.equal(updatePayload.event_time)
            expect(status2.subscription_id).to.equal(updatePayload.subscription_id)
            expect(status2.subscription_plan_id).to.equal(updatePayload.old_subscription_plan_id)
            expect(status2.vendor_user_id).to.equal(updatePayload.user_id)

            const status3 = sub.status[3]
            // ensure we changed these values
            expect(status3.currency).to.not.equal(createPayload.currency)
            expect(status3.next_bill_date).to.not.equal(createPayload.next_bill_date)
            expect(status3.unit_price).to.not.equal(createPayload.unit_price)
            expect(status3.quantity).to.not.equal(createPayload.quantity)
            expect(status3.event_time).to.not.equal(createPayload.event_time)
            // these values must be equal to update payload values
            expect(status3.alert_id).to.equal(updatePayload.alert_id)
            expect(status3.alert_name).to.equal(updatePayload.alert_name)
            expect(status3.currency).to.equal(updatePayload.currency)
            expect(status3.description).to.equal(updatePayload.status)
            expect(status3.next_bill_date).to.equal(updatePayload.next_bill_date)
            expect(status3.unit_price).to.equal(updatePayload.new_unit_price)
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
            const status = await paddleIntegration.getAllSubscriptionsStatus(sub)
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
            expect(status.unit_price).to.equal(cancelPayload.unit_price)
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

    describe('.getAllSubscriptionsStatus', () => {
        it('takes the most recent status into account', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime()).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const status = await paddleIntegration.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('allows 10s clock drift', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 9_000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const status = await paddleIntegration.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.false
        })
        it('ignores a status that starts more than 10s in the future', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 50_000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const status = await paddleIntegration.getAllSubscriptionsStatus(sub)
            expect(status[createPayload.subscription_plan_id]).to.be.true
        })
        it('accepts a second parameter that changes the target date', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const subs = await paddleIntegration.getAllSubscriptionsStatus(sub, new Date(new Date().getTime() + 5000))
            expect(subs[createPayload.subscription_plan_id]).to.be.false
        })
        it('returns status per subscription plan id', async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const createPayload2 = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    subscription_plan_id: '9',
                    event_time: new Date().toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload2)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date(new Date().getTime() + 1000).toISOString()
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const subs = await paddleIntegration.getAllSubscriptionsStatus(sub, new Date(new Date().getTime() + 5000))
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
                    passthrough: JSON.stringify({ ids }),
                    event_time: startTimeString
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)
            const createPayload2 = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: startTimeString,
                    subscription_plan_id: '4'
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload2)

            const { subscription: sub } = await storage.get(ids)
            const dates = await paddleIntegration.getStartAndEndDates(sub)
            expect(dates).to.have.keys(createPayload.subscription_plan_id, createPayload2.subscription_plan_id)
        })
        it('returns only start date if theres no end date', async () => {
            const subscriptionId = uuid()
            const startTimeString = new Date().toISOString()
            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    event_time: startTimeString
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const { subscription: sub } = await storage.get(ids)
            const { [createPayload.subscription_plan_id]: { start, end } } = await paddleIntegration.getStartAndEndDates(sub)
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
                    passthrough: JSON.stringify({ ids }),
                    event_time: startTimeString
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const payload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: endTimeString
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(payload)

            const { subscription: sub } = await storage.get(ids)
            const { [createPayload.subscription_plan_id]: { start, end } } = await paddleIntegration.getStartAndEndDates(sub)
            expect(start).to.equal(startTimeString)
            expect(end).to.equal(endTimeString)
        })
    })

    describe('.getStatusTrail', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, {
                event_time: '2018-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const paymentSuccesfulPayload = Object.assign({}, paymentSucceded, {
                event_time: '2017-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSuccessfulPayment(paymentSuccesfulPayload)

            const paymentSuccesfulPayload2 = Object.assign({}, paymentSucceded, {
                event_time: '2017-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addSuccessfulPayment(paymentSuccesfulPayload2)

            const paymentFailedPayload = Object.assign({}, paymentFailed, {
                event_time: '2022-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addFailedPayment(paymentFailedPayload)

            const paymentRefundedPayload1 = Object.assign({}, paymentRefunded, {
                event_time: '2024-08-08 10:47:47',
                subscription_id: subscriptionId,
                subscription_plan_id: '4',
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addRefundedPayment(paymentRefundedPayload1)


            const paymentRefundedPayload2 = Object.assign({}, paymentRefunded, {
                event_time: '2014-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addRefundedPayment(paymentRefundedPayload2)

            const paymentFailedPayload2 = Object.assign({}, paymentFailed, {
                event_time: '2012-08-08 10:47:47',
                subscription_id: subscriptionId,
                passthrough: JSON.stringify({ ids }),
            })
            await paddleIntegration.addFailedPayment(paymentFailedPayload2)
        })
        it('returns a sorted listed of payments per subscription plan id 8', async () => {
            const { subscription: sub } = await storage.get(ids)
            const trail = await paddleIntegration.getPaymentsTrail(sub)

            expect(trail).to.have.keys(paymentSucceded.subscription_plan_id, '4')

            const paymentsForSubscription = trail[paymentSucceded.subscription_plan_id]
            expect(paymentsForSubscription).to.have.length(4)
            expect(paymentsForSubscription[0].description).to.equal('subscription_payment_failed')
            expect(paymentsForSubscription[0].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[0].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[0].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[0].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[0].next_try.date).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[0].instalments).to.equal(paymentFailed.instalments)
            expect(paymentsForSubscription[0].subscription_plan_id).to.equal(paymentFailed.subscription_plan_id)

            expect(paymentsForSubscription[1].description).to.equal('subscription_payment_refunded')
            expect(paymentsForSubscription[1].amount.currency).to.equal(paymentRefunded.currency)
            expect(paymentsForSubscription[1].amount.total).to.equal(paymentRefunded.gross_refund)
            expect(paymentsForSubscription[1].amount.quantity).to.equal(paymentRefunded.quantity)
            expect(paymentsForSubscription[1].amount.unit_price).to.equal(paymentRefunded.unit_price)
            expect(paymentsForSubscription[1].refund.reason).to.equal(paymentRefunded.refund_reason)
            expect(paymentsForSubscription[1].refund.type).to.equal(paymentRefunded.refund_type)
            expect(paymentsForSubscription[1].instalments).to.equal(paymentRefunded.instalments)
            expect(paymentsForSubscription[1].subscription_plan_id).to.equal(paymentRefunded.subscription_plan_id)

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
            expect(paymentsForSubscription[2].subscription_plan_id).to.equal(paymentSucceded.subscription_plan_id)
        
            expect(paymentsForSubscription[3].description).to.equal('pi/upcoming_payment')
            expect(paymentsForSubscription[3].event_time).to.equal(paymentSucceded.next_bill_date)
            expect(paymentsForSubscription[3].amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[3].amount.total).to.equal(paymentSucceded.next_payment_amount)
            expect(paymentsForSubscription[3].amount.quantity).to.equal(paymentSucceded.quantity)
            expect(paymentsForSubscription[3].amount.unit_price).to.equal(paymentSucceded.unit_price)
            expect(paymentsForSubscription[3].subscription_plan_id).to.equal(paymentSucceded.subscription_plan_id)
        })

        it('returns a sorted listed of payments per subscription plan id 4 and ignores refunded payment hook', async () => {
            const { subscription: sub } = await storage.get(ids)
            const trail = await paddleIntegration.getPaymentsTrail(sub)

            expect(trail).to.have.keys(paymentSucceded.subscription_plan_id, '4')

            const paymentsForSubscription = trail['4']
            expect(paymentsForSubscription).to.have.length(3)

            expect(paymentsForSubscription[0].description).to.equal('subscription_payment_succeeded')
            expect(paymentsForSubscription[0].amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[0].amount.total).to.equal(paymentSucceded.sale_gross)
            expect(paymentsForSubscription[0].amount.quantity).to.equal(paymentSucceded.quantity)
            expect(paymentsForSubscription[0].amount.unit_price).to.equal(paymentSucceded.unit_price)
            expect(paymentsForSubscription[0].amount.method).to.equal(paymentSucceded.payment_method)
            expect(paymentsForSubscription[0].next_payment.date).to.equal(paymentSucceded.next_bill_date)
            expect(paymentsForSubscription[0].next_payment.amount.currency).to.equal(paymentSucceded.currency)
            expect(paymentsForSubscription[0].next_payment.amount.total).to.equal(paymentSucceded.next_payment_amount)
            expect(paymentsForSubscription[0].receipt_url).to.equal(paymentSucceded.receipt_url)
            expect(paymentsForSubscription[0].instalments).to.equal(paymentSucceded.instalments)
            expect(paymentsForSubscription[0].subscription_plan_id).to.equal('4')
        
            expect(paymentsForSubscription[1].description).to.equal('subscription_payment_failed')
            expect(paymentsForSubscription[1].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[1].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[1].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[1].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[1].next_try.date).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[1].instalments).to.equal(paymentFailed.instalments)
            expect(paymentsForSubscription[1].subscription_plan_id).to.equal('4')

            expect(paymentsForSubscription[2].description).to.equal('pi/upcoming_payment')
            expect(paymentsForSubscription[2].event_time).to.equal(paymentFailed.next_retry_date)
            expect(paymentsForSubscription[2].amount.currency).to.equal(paymentFailed.currency)
            expect(paymentsForSubscription[2].amount.total).to.equal(paymentFailed.amount)
            expect(paymentsForSubscription[2].amount.quantity).to.equal(paymentFailed.quantity)
            expect(paymentsForSubscription[2].amount.unit_price).to.equal(paymentFailed.unit_price)
            expect(paymentsForSubscription[2].subscription_plan_id).to.equal('4')
        })
    })
    describe('.getStatusTrail', () => {
        beforeEach(async () => {
            const subscriptionId = uuid()

            const createPayload = Object.assign({}, subscriptionCreated,
                {
                    event_time: new Date().toISOString(),
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionCreatedStatus(createPayload)

            const updatePayload = Object.assign({}, subscriptionUpdated,
                {
                    event_time: new Date().toISOString(),
                    subscription_id: subscriptionId, passthrough: JSON.stringify({ ids })
                }
            )
            await paddleIntegration.addSubscriptionUpdatedStatus(updatePayload)

            const cancelPayload = Object.assign({}, subscriptionCancelled,
                {
                    subscription_id: subscriptionId,
                    passthrough: JSON.stringify({ ids }),
                    cancellation_effective_date: new Date().toISOString(),
                }
            )
            await paddleIntegration.addSubscriptionCancelledStatus(cancelPayload)
        })

        it('returns a sorted listed of status per id', async () => {
            const { subscription: sub } = await storage.get(ids)
            const trail = await paddleIntegration.getStatusTrail(sub)
            const subscriptionTrail = trail[subscriptionCreated.subscription_plan_id]

            // expect(subscriptionTrail).to.have.length(3)
            expect(subscriptionTrail[0].type).to.equal('subscription_created')
            expect(subscriptionTrail[0].description).to.equal('active')
            expect(subscriptionTrail[1].type).to.equal('subscription_updated')
            expect(subscriptionTrail[1].description).to.equal('active')
            expect(subscriptionTrail[2].type).to.equal('subscription_cancelled')
            expect(subscriptionTrail[2].description).to.equal('deleted')
        })
    })
})