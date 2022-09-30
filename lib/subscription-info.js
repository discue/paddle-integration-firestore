'use strict'

const resource = require('./firestore/nested-firestore-resource')
const { PLACEHOLDER_DESCRIPTION, UPCOMING_PAYMENTS_DESCRIPTION, ACTIVE_SUBSCRIPTION_DESCRIPTIONS } = require('./subscription-descriptions')

class SubscriptionInfo {

    constructor(storagePath) {
        this._storage = resource({ documentPath: storagePath, resourceName: 'subscriptions' })
    }

    /**
     * @typedef {Object} StartAndEndDate
     * @property {String} start - subscription start date as ISO formatted string
     * @property {String} start - subscription end date as ISO formatted string
     */

    /**
     * Returns start and end dates for all subscription plans found in the document.
     * 
     * @param {Object} subscription 
     * @returns {StartAndEndDate} containing the start and end date
     */
    async getStartAndEndDates(subscription) {
        const statusByPlanId = this._bySubscriptionId(subscription.status, new Date(2099, 1).getTime())

        return Object.entries(statusByPlanId).reduce((context, [subscriptionPlanId, status]) => {
            context[subscriptionPlanId] = this._getStartAndEndDates(status)
            return context
        }, {})
    }

    /**
     * Returns start and end dates for the given list of status objects. 
     * 
     * @private
     * @param {Object} subscription 
     * @returns {StartAndEndDate} containing the start and end date
     */
    _getStartAndEndDates(status) {
        const statusArray = status
            .sort((a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime())

        const first = statusArray.find((s) => s.description !== PLACEHOLDER_DESCRIPTION)
        let last = statusArray.at(-1)

        if (first.alert_id === last.alert_id) {
            last == null
        }

        const start = first.event_time
        let end = null

        if (last && !this._isSubscriptionStatusCurrentlyActive(statusArray.at(-1))) {
            end = statusArray.at(-1).event_time
        }

        return { start, end }
    }

    /**
     * Returns a list of payments sorted by date ascending for all subscription plans found in the document.
     * 
     * <strong>Note:</strong> We also add an upcoming payment event to the list which may or may not happen
     * according to the users' subscription status. For the sake of efficiency we don't check the subscription 
     * status in this method. So please check the status in your application before also showing the upcoming 
     * payments.
     * 
     * @param {Object} subscription 
     * @returns {Object}
     */
    async getPaymentsTrail(subscription) {
        const paymentsByPlanId = this._bySubscriptionId(subscription.payments)

        return Object.entries(paymentsByPlanId).reduce((context, [subscriptionPlanId, payments]) => {
            context[subscriptionPlanId] = this._getPaymentsTrail(payments)
            return context
        }, {})
    }

    /**
     * Returns a list of payments sorted by event_time descending.
     * 
     * @private
     * @param {Object} subscription 
     * @returns {Array<Object>} containing the start and end date
     */
    _getPaymentsTrail(payments) {
        const sortedPayments = payments //
            .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())

        let latestPaymentInfo = null

        for (let i = 0, n = sortedPayments.length; i < n; i++) {
            const payment = sortedPayments.at(i)
            const { alert_name } = payment

            if (alert_name === 'subscription_payment_succeeded' || alert_name === 'subscription_payment_failed') {
                latestPaymentInfo = payment
                break
            }
        }

        if (latestPaymentInfo) {
            const upcomingPayment = {
                event_time: latestPaymentInfo.next_bill_date || latestPaymentInfo.next_retry_date,
                alert_name: UPCOMING_PAYMENTS_DESCRIPTION,
                currency: latestPaymentInfo.currency,
                amount: latestPaymentInfo.next_payment_amount || latestPaymentInfo.amount,
                quantity: latestPaymentInfo.quantity,
                unit_price: latestPaymentInfo.unit_price,
                subscription_plan_id: latestPaymentInfo.subscription_plan_id
            }

            payments.splice(0, 0, upcomingPayment)
        }

        return sortedPayments
            .map(payment => {
                const result = {
                    event_time: payment.event_time,
                    description: payment.alert_name,
                    amount: {
                        currency: payment.currency,
                        total: payment.amount,
                        quantity: payment.quantity,
                        unit_price: payment.unit_price,
                    },
                    subscription_plan_id: payment.subscription_plan_id,
                }
                if (payment.alert_name === 'subscription_payment_failed') {
                    Object.assign(result, {
                        next_try: {
                            date: payment.next_retry_date
                        },
                        instalments: payment.instalments,
                    })
                } else if (payment.alert_name === 'subscription_payment_refunded') {
                    Object.assign(result, {
                        refund: {
                            reason: payment.refund_reason,
                            type: payment.refund_type
                        },
                        instalments: payment.instalments
                    })
                    result.amount.total = payment.gross_refund
                } else if (payment.alert_name === 'subscription_payment_succeeded') {
                    Object.assign(result, {
                        next_payment: {
                            date: payment.next_bill_date,
                            amount: {
                                currency: payment.currency,
                                total: payment.next_payment_amount
                            }
                        },
                        receipt_url: payment.receipt_url,
                        instalments: payment.instalments,
                    })
                    result.amount.total = payment.sale_gross
                    result.amount.method = payment.payment_method
                }

                return result
            })
    }

    /**
     * Returns a list of update and changes events for all subscription plans found in the document.
     * 
     * @param {Object} subscription 
     * @returns {Object}
     */
    async getStatusTrail(subscription) {
        const statusByPlanId = this._bySubscriptionId(subscription.status)

        return Object.entries(statusByPlanId).reduce((context, [subscriptionPlanId, status]) => {
            context[subscriptionPlanId] = this._getStatusTrail(status)
            return context
        }, {})
    }

    /**
     * Returns a list of update events sorted by event_time descending.
     * 
     * @param {Array<Object>} status
     * @returns {Array<Object>} containing the start and end date
     */
    _getStatusTrail(status) {
        return status //
            .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())
            .map(s => {
                return {
                    event_time: s.cancellation_effective_date || s.event_time,
                    description: s.description,
                    type: s.alert_name
                }
            })
    }

    /**
     * Returns the status of each subscription found in the document. 
     * 
     * For each found subscription the method will add a boolean value
     * indicating the subscription plan is active (true) or not active (false).
     * 
     * Unless the second parameter is passed, the status will always be calculated
     * using the current time
     * 
     * @param {Object} subscription
     * @param {Date} [atDate=new Date()] date for the calculation  
     * @returns {Object} true if an active subscription was given
     */
    async getAllSubscriptionsStatus(subscriptions, atDate = new Date()) {
        const result = {}
        const now = atDate.getTime() + 10_000

        const allStatusBySubscriptionPlan = this._bySubscriptionId(subscriptions.status, now)

        Object.entries(allStatusBySubscriptionPlan).forEach(([subscriptionPlanId, list]) => {
            list.sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())

            result[subscriptionPlanId] = this._isSubscriptionStatusCurrentlyActive(list.at(0))
        })

        return result
    }

    /**
     * 
     * @private
     * @param {Array<Object>} statusOrPayments 
     * @param {Number} validBeforeMillis 
     * @returns 
     */
    _bySubscriptionId(statusOrPayments, validBeforeMillis = Date.now()) {
        return statusOrPayments.reduce((context, next) => {
            if (new Date(next.event_time).getTime() < validBeforeMillis) {

                if (!Array.isArray(context[next.subscription_plan_id])) {
                    context[next.subscription_plan_id] = []
                }
                context[next.subscription_plan_id].push(next)
            }
            return context
        }, {})
    }

    /**
    * Returns true if the given status has a description that we recognize as active
    *  
    * @private
    * @param {Object} activeStatus 
    * @returns {Boolean} true or false
    */
    _isSubscriptionStatusCurrentlyActive(status) {
        return ACTIVE_SUBSCRIPTION_DESCRIPTIONS.includes(status.description)
    }
}

module.exports = SubscriptionInfo