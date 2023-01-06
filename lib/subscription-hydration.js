'use strict'

const resource = require('./firestore/nested-firestore-resource')

class SubscriptionHydration {

    /**
     * @typedef ConstructorOptions
     * @property {import('./paddle/api.js')} api
     * @property {import('./subscription-hook-storage.js') hookStorage}
     */

    /**
     * 
     * @param {String} storagePath Path to the target collection
     * @param {ConstructorOptions} options
     */

    constructor(storagePath, { api = {}, hookStorage = {} }) {
        this._resourceName = 'subscription'
        this._storage = resource({ documentPath: storagePath, resourceName: this._resourceName })
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
            throw new Error(SubscriptionHydration.HYDRATION_BAD_REQUEST)
        }

        const idsFromCustomData = subscription.custom_data._pi.ids
        if (!Array.isArray(idsFromCustomData)) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionHydration.HYDRATION_UNAUTHORIZED)
        }

        const isForTargetId = ids.length === idsFromCustomData.length && idsFromCustomData.every((id, index) => id === ids[index])
        if (!isForTargetId) {
            console.error(`Expected "subscription.custom_data._pi.ids" ${isForTargetId} to deep equal ids given via parameter ${ids}.`)
            throw new Error(SubscriptionHydration.HYDRATION_UNAUTHORIZED)
        }

        const subscriptionCreatedPayload = {
            alert_id: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CREATED,
            alert_name: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CREATED,
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

        if (subscription.state !== 'active') {
            return
        }

        await this._hookStorage.addSubscriptionCreatedStatus(subscriptionCreatedPayload)

        const payments = await this._api.getSubscriptionPayments(subscription, { plan: subscription.plan_id })
        if (!Array.isArray(payments) || payments.length < 1) {
            return
        }

        const payment = payments.at(0)
        const subscriptionPaymentPayload = {
            alert_id: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CREATED,
            alert_name: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CREATED,
            checkout_id: checkoutId,
            currency: payment.currency,
            email: subscription.user_email,
            event_time: subscription.signup_date,
            initial_payment: '1',
            marketing_consent: subscription.marketing_consent,
            next_bill_date: subscription.next_payment?.date || '',
            next_payment_amount: subscription.next_payment?.amount || '',
            passthrough: JSON.stringify({ '_pi': { ids: idsFromCustomData } }),
            payment_method: subscription.payment_information.payment_method,
            quantity: subscription.quantity,
            receipt_url: payment.receipt_url,
            status: subscription.state,
            subscription_id: subscription.subscription_id,
            subscription_payment_id: payment.id,
            subscription_plan_id: subscription.plan_id,
            user_id: subscription.user_id,
        }

        await this._hookStorage.addSuccessfulPayment(subscriptionPaymentPayload)
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
            throw new Error(SubscriptionHydration.HYDRATION_BAD_REQUEST)
        }

        const idsFromCustomData = subscription.custom_data._pi.ids
        if (!Array.isArray(idsFromCustomData)) {
            console.error(`Expected "subscription.custom_data._pi.ids" to be an Array. Did you set customData during Checkout? Please see https://developer.paddle.com/changelog/e9a54055ea46e-custom-data-now-available#custom-data-in-webhooks.`)
            throw new Error(SubscriptionHydration.HYDRATION_UNAUTHORIZED)
        }

        const isForTargetId = ids.length === idsFromCustomData.length && idsFromCustomData.every((id, index) => id === ids[index])
        if (!isForTargetId) {
            console.error(`Expected "subscription.custom_data._pi.ids" ${isForTargetId} to deep equal ids given via parameter ${ids}.`)
            throw new Error(SubscriptionHydration.HYDRATION_UNAUTHORIZED)
        }

        const hookPayload = {
            alert_id: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CANCELLED,
            alert_name: SubscriptionHydration.HYDRATION_SUBSCRIPTION_CANCELLED,
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

module.exports = SubscriptionHydration