'use strict'

const resource = require('./firestore/nested-firestore-resource')
const { PLACEHOLDER_DESCRIPTION, UPCOMING_PAYMENTS_DESCRIPTION, ACTIVE_SUBSCRIPTION_DESCRIPTIONS } = require('./subscription-descriptions')

class SubscriptionInfo {

    /**
     * 
     * @param {String} storagePath Path to the target collection
     * @param {import('./paddle/api')} api paddle api instance
     */

    constructor(storagePath, { api = {}, hookStorage = {} }) {
        this._storage = resource({ documentPath: storagePath, resourceName: 'subscriptions' })
        this._api = api
        this._hookStorage = hookStorage
    }

    static get ERROR_SUBSCRIPTION_NOT_FOUND() {
        return 'NOT_FOUND'
    }

    static get ERROR_SUBSCRIPTION_ALREADY_CANCELLED() {
        return 'ERROR_SUBSCRIPTION_ALREADY_CANCELLED'
    }

    static get HYDRATION_SUBSCRIPTION_CREATED() {
        return 'pi-hydration/subscription_created'
    }

    static get HYDRATION_SUBSCRIPTION_CANCELLED() {
        return 'pi-hydration/subscription_cancelled'
    }

    static get HYDRATION_UNAUTHORIZED() {
        return 'pi-hydration/unauthorized'
    }

    static get HYDRATION_BAD_REQUEST() {
        return 'pi-hydration/bad_request'
    }

    /**
     * @typedef SubscriptionInfos
     * @property {SubscriptionInfo} [any] subscription info per subscription plan id
     */

    /**
     * @typedef SubscriptionInfo
     * @property {Boolean} active indicates whether the subscription is currently active
     * @property {String} [start] ISO-formatted start date 
     * @property {String} [end=undefined] ISO-formatted end date 
     * @property {Array} [status_trail] a list of subscription status updates 
     * @property {Array} [payments_trail] a list of payments
     */

    /**
     * Reads and returns subscription related information. This method returns also future subscription info.
     * 
     * @property {Array<String>} ids ids necessary to lookup possibly nested subscription object
     * @property {Number} [validBeforeMillis=new Date(2099, 0)] timestamp indicating until which time info should be included. Defaults to year 2099.
     * 
     * @returns {SubscriptionInfos}
     */
    async getSubscriptionInfo(ids, validBeforeMillis = new Date(2099, 0)) {
        const result = await this._storage.get(ids)
        const { subscription } = result

        const status = await this.getStartAndEndDates(subscription, validBeforeMillis)
        const statusTrail = await this.getStatusTrail(subscription, validBeforeMillis)
        const paymentsTrail = await this.getPaymentsTrail(subscription, validBeforeMillis)

        return Object.keys(status).reduce((context, subscriptionPlanId) => {
            const subscriptionPlanInfo = Object.assign(status[subscriptionPlanId], {
                status_trail: statusTrail[subscriptionPlanId] || [],
                payments_trail: paymentsTrail[subscriptionPlanId] || []
            })

            const hasStarted = new Date(subscriptionPlanInfo.start).getTime() < Date.now()
            const hasEnded = subscriptionPlanInfo.end ? new Date(subscriptionPlanInfo.end).getTime() <= Date.now() : false

            // if we have an end date and end date is in the past, then subscription was cancelled
            subscriptionPlanInfo.active = hasStarted && !hasEnded

            if (subscriptionPlanInfo.payments_trail.length && subscriptionPlanInfo.payments_trail.at(0).description === UPCOMING_PAYMENTS_DESCRIPTION) {
                // was subscription already cancelled?
                if (subscriptionPlanInfo.end) {
                    // and is the computed upcoming payment after the end date?
                    // then remove the upcoming payment
                    if (new Date(subscriptionPlanInfo.end).getTime() <= new Date(subscriptionPlanInfo.payments_trail.at(0).event_time).getTime()) {
                        subscriptionPlanInfo.payments_trail.splice(0, 1)
                    }
                }
            }

            context[subscriptionPlanId] = subscriptionPlanInfo
            return context
        }, {})
    }

    /**
     * Will cancel the subscription plan of the given subscription. The actual subscription id
     * will be looked at at runtime by peaking at all subscription events. 
     * 
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED if already cancelled
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND if not found
     * @returns 
     */
    async cancelSubscription(subscriptionOrIds, subscriptionPlanId) {
        const subscription = await this._getOrReadSubscription(subscriptionOrIds)
        const subscriptionId = await this._findActiveSubscriptionIdByPlanId(subscription, subscriptionPlanId)

        try {
            const cancelled = await this._api.cancelSubscription({ subscription_id: subscriptionId })
            return cancelled !== false && cancelled !== 'false'
        } catch (e) {
            console.error(`Failed to cancel subscription because of: ${e}`)
        }
        return false
    }

    /**
    * Will cancel the subscription plan of the given subscription. The actual subscription id
    * will be looked at at runtime by peaking at all subscription events. 
    * 
    * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
    * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND if not found
    * @returns 
    */
    async _getOrReadSubscription(subscriptionOrIds) {
        if (Array.isArray(subscriptionOrIds)) {
            try {
                const sub = await this._storage.get(subscriptionOrIds)
                return sub
            } catch (e) {
                if (e.message == 'Not Found') {
                    throw new Error(SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND)
                } else {
                    throw e
                }
            }
        } else {
            return subscriptionOrIds
        }
    }

    /**
     * Will update the subscription plan of the given subscription. The actual subscription id
     * will be looked at at runtime by peaking at all subscription events. The current plan will
     * be cancelled in favor of the new one.
     * 
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @param {String} currentSubscriptionPlanId the current plan id to be terminated
     * @param {String} newSubscriptionPlanId the new plan id
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED if already cancelled
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND if not found
     * @returns 
     */
    async updateSubscription(subscriptionOrIds, currentSubscriptionPlanId, newSubscriptionPlanId) {
        const subscription = await this._getOrReadSubscription(subscriptionOrIds)
        const subscriptionId = await this._findActiveSubscriptionIdByPlanId(subscription, currentSubscriptionPlanId)

        try {
            const response = await this._api.updateSubscriptionPlan({ subscription_id: subscriptionId }, newSubscriptionPlanId)
            return response.subscription_id !== undefined
        } catch (e) {
            console.error(`Failed to update subscription because of: ${e}`)
        }
        return false
    }

    /**
     * Finds the id of an active subscription by peaking at the status events.
     * 
     * @param {Object} subscription 
     * @param {String} subscriptionPlanId 
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED if already cancelled
     * @throws SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND if not found
     * @returns 
     */
    async _findActiveSubscriptionIdByPlanId(subscription, subscriptionPlanId) {
        const future = new Date(2099, 1).getTime()
        const statusByPlanId = this._bySubscriptionId(subscription.status, future)
        const startAndEndDates = await this.getStartAndEndDates(subscription, future)

        // check whether plan id exists
        if (!statusByPlanId[subscriptionPlanId] || statusByPlanId.length < 1) {
            throw new Error(SubscriptionInfo.ERROR_SUBSCRIPTION_NOT_FOUND)
        }

        // check whether subscription was already cancelled
        if (startAndEndDates[subscriptionPlanId].end) {
            throw new Error(SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED)
        }

        const statusArray = statusByPlanId[subscriptionPlanId]
        return statusArray.at(0).subscription_id
    }

    /**
     * @typedef {Object} StartAndEndDateBySubscription
     * @property {StartAndEndDate} [any] start and end date of a subscription plan
     */

    /**
     * @typedef {Object} StartAndEndDate
     * @property {String} start - subscription start date as ISO formatted string
     * @property {String} start - subscription end date as ISO formatted string
     */

    /**
     * Returns start and end dates for all subscription plans found in the document.
     * 
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @returns {StartAndEndDateBySubscription} containing the start and end date
     */
    async getStartAndEndDates(subscriptionOrIds, validBeforeMillis = Date.now()) {
        const subscription = await this._getOrReadSubscription(subscriptionOrIds)
        const statusByPlanId = this._bySubscriptionId(subscription.status, validBeforeMillis)

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
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @returns {Object}
     */
    async getPaymentsTrail(subscriptionOrIds, validBeforeMillis = Date.now()) {
        const subscription = await this._getOrReadSubscription(subscriptionOrIds)
        const paymentsByPlanId = this._bySubscriptionId(subscription.payments, validBeforeMillis)

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
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @returns {Object}
     */
    async getStatusTrail(subscriptionOrIds, validBeforeMillis = Date.now()) {
        const subscription = await this._getOrReadSubscription(subscriptionOrIds)
        const statusByPlanId = this._bySubscriptionId(subscription.status, validBeforeMillis)

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
     * @param {Object|Array<String>} subscriptionOrIds subscription object or array of ids if subscription should be read from database
     * @param {Date} [atDate=new Date()] date for the calculation  
     * @returns {Object} true if an active subscription was given
     */
    async getAllSubscriptionsStatus(subscriptionOrIds, atDate = new Date()) {
        const result = {}
        const now = atDate.getTime() + 10_000

        const subscriptions = await this._getOrReadSubscription(subscriptionOrIds)
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

    /**
     * Fetches the latest subscription status from paddle API and updates the local status accordingly.
     * 
     * This implementation is cautious in that it only updates the status if
     * - current status returned by API is active
     * - local status' contain only the pre-checkout placeholder
     * 
     * If update of the local subscription status is not necessary - e.g. because
     * the webhook was also already received - the method will just silently return.
     * 
     * This method allows us to decouple ourselves from the timely arrival of paddle webhooks. Because
     * webhooks are necessary to store a subscription created event in our database. If the webhook
     * does not arrive in time, our users need to wait for a finite amount of time which
     * is not a convincing user experience.
     * 
     * This method can be called after the first checkout and after the order was processsed
     * to already store subscription-related data and let the user already enjoy some goodies.
     * 
     * @param {Array} ids ids pointing to the target subscription object
     * @param {Object} subscription the current local subscription status instance
     * @param {String} checkoutId checkout id of paddle.com
     * @throws Error if hydration failed unexepectedly
     * @throws SubscriptionInfo.HYDRATION_BAD_REQUEST if the subscription going to be hydrated contains no client information in custom_data
     * @throws SubscriptionInfo.HYDRATION_UNAUTHORIZED if ids do not match the ids found in the subscription
     * @returns 
     */
    async hydrateSubscriptionCreated(ids, { subscription_id }, checkoutId) {
        {
            const { subscription } = await this._storage.get(ids)
            if (subscription?.status?.length > 1) {
                console.log(`Subscription ${ids} was already hydrated. Exiting early and quietly.`)
                return
            }
        }

        const subscriptions = await this._api.getSubscription({ subscription_id })
        if (!Array.isArray(subscriptions) || subscriptions.length < 1) {
            return
        }

        // more sanity checks here
        const subscription = subscriptions.at(0)
        if (!subscription.custom_data?._pi?.ids) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionInfo.HYDRATION_BAD_REQUEST)
        }

        const idsFromCustomData = subscription.custom_data._pi.ids
        if (!Array.isArray(idsFromCustomData)) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionInfo.HYDRATION_UNAUTHORIZED)
        }

        const isForTargetId = ids.length === idsFromCustomData.length && idsFromCustomData.every((id, index) => id === ids[index])
        if (!isForTargetId) {
            console.error(`Expected "subscription.custom_data._pi.ids" ${isForTargetId} to deep equal ids given via parameter ${ids}.`)
            throw new Error(SubscriptionInfo.HYDRATION_UNAUTHORIZED)
        }

        const hookPayload = {
            alert_id: SubscriptionInfo.HYDRATION_SUBSCRIPTION_CREATED,
            alert_name: SubscriptionInfo.HYDRATION_SUBSCRIPTION_CREATED,
            currency: subscription.last_payment.currency,
            status: subscription.state,
            next_bill_date: subscription.next_payment?.date || '',
            quantity: subscription.quantity,
            event_time: subscription.signup_date,
            source: 'pi-hydration',
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.plan_id,
            cancel_url: subscription.cancel_url,
            checkout_id: checkoutId,
            user_id: subscription.user_id,
            // use the ids from paddle api here
            // these were initially passed during checkout and cannot be updated
            // thus we ensure that user do not hydrate other subscriptions too
            passthrough: JSON.stringify({ '_pi': { ids: idsFromCustomData } })
        }

        if (subscription.state === 'active') {
            await this._hookStorage.addSubscriptionCreatedStatus(hookPayload)
        }
    }

    /**
     * Fetches the latest subscription status from paddle API and updates the local status accordingly.
     * 
     * If update of the local subscription status is not necessary - e.g. because
     * the webhook was also already received - the method will just silently return.
     * 
     * This method allows us to decouple ourselves from the timely arrival of paddle webhooks. Because
     * webhooks are necessary to store a subscription created event in our database. If the webhook
     * does not arrive in time, our users need to wait for a finite amount of time which
     * is not a convincing user experience.
     * 
     * This method can be called after the first checkout and after the order was processsed
     * to already store subscription-related data and let the user already enjoy some goodies.
     * 
     * Be cautious with this method because it will immediately cancel the current subscription
     * because paddle API does not return when the subscription will actually end.
     * 
     * @param {Array} ids ids pointing to the target subscription object
     * @param {Object} subscription the current local subscription status instance
     * @param {String} checkoutId checkout id of paddle.com^^
     * @throws Error if hydration failed unexepectedly
     * @returns 
     */
    async hydrateSubscriptionCancelled(ids, { subscription_id }, checkoutId) {
        const subscriptions = await this._api.getSubscription({ subscription_id })

        if (!Array.isArray(subscriptions) || subscriptions.length < 1) {
            return
        }

        // more sanity checks here
        const subscription = subscriptions.at(0)
        if (!subscription.custom_data?._pi?.ids) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionInfo.HYDRATION_BAD_REQUEST)
        }

        const idsFromCustomData = subscription.custom_data._pi.ids
        if (!Array.isArray(idsFromCustomData)) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionInfo.HYDRATION_UNAUTHORIZED)
        }

        const isForTargetId = ids.length === idsFromCustomData.length && idsFromCustomData.every((id, index) => id === ids[index])
        if (!isForTargetId) {
            console.error(`Expected "subscription.custom_data._pi.ids" ${isForTargetId} to deep equal ids given via parameter ${ids}.`)
            throw new Error(SubscriptionInfo.HYDRATION_UNAUTHORIZED)
        }

        const hookPayload = {
            alert_id: SubscriptionInfo.HYDRATION_SUBSCRIPTION_CANCELLED,
            alert_name: SubscriptionInfo.HYDRATION_SUBSCRIPTION_CANCELLED,
            currency: subscription.last_payment.currency,
            status: subscription.state,
            next_bill_date: subscription.next_payment?.date || '',
            quantity: subscription.quantity,
            event_time: subscription.signup_date,
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.plan_id,
            cancel_url: subscription.cancel_url,
            checkout_id: checkoutId,
            user_id: subscription.user_id,
            passthrough: JSON.stringify({ '_pi': { ids: idsFromCustomData } })
        }

        if (subscription.state === 'deleted') {
            hookPayload.cancellation_effective_date = new Date().toISOString()
            await this._hookStorage.addSubscriptionCancelledStatus(hookPayload)
        }
    }
}

module.exports = SubscriptionInfo