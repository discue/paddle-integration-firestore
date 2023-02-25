'use strict'

const resource = require('./firestore/nested-firestore-resource')
const htmlEncode = require('./html-encoder')
const { PLACEHOLDER_DESCRIPTION } = require('./subscription-descriptions')
const PLACEHOLDER_START_DATE = new Date('2020-01-01')

/**
 * @typedef {Object} SubscriptionCreatedPayload
 * @property {String} alert_id - The unique identifier for this Paddle webhook alert.
 * @property {String} alert_name - The name of this Paddle webhook alert.
 * @property {String} cancel_url - The URL of the 'Cancel Subscription' page.
 * @property {String} checkout_id - The checkout id of the order created..
 * @property {String} currency - The three-letter ISO currency code.
 * @property {String} email - The email address of the customer.
 * @property {String} event_time - The date and time the event was triggered in UTC (Coordinated Universal Time).
 * @property {String} marketing_consent - The value of this field `0` or `1` indicates whether the user has agreed to receive marketing messages from the vendor.
 * @property {String} next_bill_date - The date the next payment is due on this subscription.
 * @property {String} passthrough - This field contains any values that you passed into the checkout using the `passthrough` parameter. See the [Pass Parameters documentation](/guides/how-tos/checkout/pass-parameters#sending-additional-user-data) for more information.
 * @property {String} quantity - The number of products or subscription seats sold in the transaction.
 * @property {String} source - Referrer website URL(s) from where the traffic originated from.
 * @property {String} status - The current status of the subscription.
 * @property {String} subscription_id - The unique Subscription ID for this customer’s subscription.
 * @property {String} subscription_plan_id - The ID of the Subscription Plan the customer is subscribed to.
 * @property {String} update_url - The URL of the ‘Update Payment Details’ page.
 * @property {String} user_id - The customer user id.
 * @property {String} p_signature
 */

/**
 * @typedef {Object} SubscriptionUpdatedPayload
 * @property {String} alert_id - The unique identifier for this Paddle webhook alert.
 * @property {String} alert_name - The name of this Paddle webhook alert.
 * @property {String} cancel_url - The URL of the 'Cancel Subscription' page.
 * @property {String} checkout_id - The checkout id of the order created..
 * @property {String} currency - The three-letter ISO currency code.
 * @property {String} email - The email address of the customer.
 * @property {String} event_time - The date and time the event was triggered in UTC (Coordinated Universal Time).
 * @property {String} marketing_consent - The value of this field `0` or `1` indicates whether the user has agreed to receive marketing messages from the vendor.
 * @property {String} new_price - The new price per unit of the subscription.
 * @property {String} new_quantity - The new number of products or subscription seats sold in the transaction.
 * @property {String} next_bill_date - The date the next payment is due on this subscription.
 * @property {String} old_next_bill_date - The previous date the next payment was due on this subscription.
 * @property {String} old_price - The previous price per unit of the subscription.
 * @property {String} old_quantity - The previous number of products or subscription seats sold in the transaction.
 * @property {String} old_status - The previous status of the subscription.
 * @property {String} old_subscription_plan_id - The previous ID of the Subscription Plan the customer is subscribed to.
 * @property {String} passthrough - This field contains any values that you passed into the checkout using the `passthrough` parameter. See the [Pass Parameters documentation](/guides/how-tos/checkout/pass-parameters#sending-additional-user-data) for more information.
 * @property {String} status - The status of the subscription.
 * @property {String} subscription_id - The unique Subscription ID for this customer’s subscription.
 * @property {String} subscription_plan_id - The ID of the Subscription Plan the customer is subscribed to.
 * @property {String} update_url - The URL of the ‘Update Payment Details’ page.
 * @property {String} user_id - The customer user id.
 * @property {String} p_signature
 */

/**
 * @typedef {Object} SubscriptionCancelledPayload
 * @property {String} alert_id - The unique identifier for this Paddle webhook alert.
 * @property {String} alert_name - The name of this Paddle webhook alert.
 * @property {String} cancellation_effective_date - The date the cancellation should come into effect, taking the customer’s most recent payment into account.
 * @property {String} checkout_id - The checkout id of the order created..
 * @property {String} currency - The three-letter ISO currency code.
 * @property {String} email - The email address of the customer.
 * @property {String} event_time - The date and time the event was triggered in UTC (Coordinated Universal Time).
 * @property {String} marketing_consent - The value of this field `0` or `1` indicates whether the user has agreed to receive marketing messages from the vendor.
 * @property {String} passthrough - This field contains any values that you passed into the checkout using the `passthrough` parameter. See the [Pass Parameters documentation](/guides/how-tos/checkout/pass-parameters#sending-additional-user-data) for more information.
 * @property {String} quantity - The number of products or subscription seats sold in the transaction.
 * @property {String} status - The current status of the subscription.
 * @property {String} subscription_id - The unique Subscription ID for this customer’s subscription.
 * @property {String} subscription_plan_id - The ID of the Subscription Plan the customer is subscribed to.
 * @property {String} user_id - The customer user id.
 * @property {String} p_signature
 */

class Subscriptions {

    constructor(storagePath, { resourceName } = {}) {
        /** @private */ this._resourceName = resourceName || 'subscription'
        /** @private */ this._storage = resource({ documentPath: storagePath, resourceName: this._resourceName })
    }

    get ERROR_INVALID_ARGUMENTS() {
        return 'INVALID_ARGUMENTS'
    }

    static get ERROR_INVALID_PASSTHROUGH() {
        return 'INVALID_PASSTHROUGH'
    }

    /**
     * Adds a placeholder for a subscription so that webhooks only need to append to existing subscription
     * 
     * The `ids` parameter must point to an existing document in a collection or subcollection. The number
     * of necessary elements in the `ids` array corresponds to the number of resources/collections that were
     * passed to the constructor
     * 
     * @example <caption>Subscriptions stored in a collection called api_clients</caption>
     * const { Subscriptions } = require('@discue/paddle-firebase-integration')
     * const subscriptions = new Subscriptions('api_clients')
     * // assuming api_client with id 4815162342 exists we can simple play an array with one element
     * const { passthrough } = await subscriptions.addSubscriptionPlaceholder(['4815162342'])

    * @example <caption>Subscriptions stored in a subcollection called external</caption>
     * const { Subscriptions } = require('@discue/paddle-firebase-integration')
     * 
     * const subscriptions = new Subscriptions('api_clients/external')
     * // as subscriptions are stored in a sub collection we need to pass the id of the parent and the child document
     * // 4815162342: api_client id
     * // 123: external client id
     * const { passthrough } = await subscriptions.addSubscriptionPlaceholder(['4815162342', '123'])
     * 
     * @param {Array<String>} ids ids to the target document
     * @returns {object} an object containing the `passthrough` parameter required to correlate webhooks with this subscription
     */
    async addSubscriptionPlaceholder(ids) {
        const statusModel = {
            description: PLACEHOLDER_DESCRIPTION,
            event_time: PLACEHOLDER_START_DATE
        }

        const updateModel = {
            [`${this._resourceName}.payments`]: [],
            [`${this._resourceName}.status`]: [statusModel],
        }

        await this._storage.update(ids, updateModel)

        return {
            passthrough: {
                v1: {
                    ids
                }
            }
        }
    }

    /**
     * Add an subscription created event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_created` webhook.
     * 
     * @param {SubscriptionCreatedPayload} subscription 
     */
    async addSubscriptionCreatedStatus(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const ids = this._getTargetIdsFromPassthrough(subscription.passthrough)

        const statusModel = {
            alert_id: subscription.alert_id,
            alert_name: subscription.alert_name,
            currency: subscription.currency,
            description: subscription.status,
            next_bill_date: subscription.next_bill_date,
            quantity: subscription.quantity,
            event_time: subscription.event_time,
            source: subscription.source,
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.subscription_plan_id,
            cancel_url: subscription.cancel_url,
            checkout_id: subscription.checkout_id,
            vendor_user_id: subscription.user_id,
        }

        const encoded = htmlEncode(statusModel)
        const updateModel = {
            [`${this._resourceName}.status`]: this._storage._arrayUnion(encoded)
        }

        return this._storage.update(ids, updateModel)
    }

    _getTargetIdsFromPassthrough(passthrough) {
        if (!passthrough) {
            console.log(`Received invalid falsy object in passthrough._pi. Actual passthrough value was ${JSON.stringify(passthrough)}. Please pass a valid object during checkout`)
            throw new Error(Subscriptions.ERROR_INVALID_PASSTHROUGH)
        }

        const { _pi: paddleIntegration } = JSON.parse(passthrough)
        if (!paddleIntegration) {
            console.log(`Received invalid falsy object in passthrough._pi. Actual passthrough value was ${JSON.stringify(passthrough)}. Please pass a valid object during checkout`)
            throw new Error(Subscriptions.ERROR_INVALID_PASSTHROUGH)
        }

        const { ids: targetIds } = paddleIntegration
        if (!Array.isArray(targetIds) && targetIds.length < 1) {
            console.log('Received invalid falsy array in passthrough._pi.ids. Please pass a valid object during checkout')
            throw new Error(Subscriptions.ERROR_INVALID_PASSTHROUGH)
        }

        return targetIds
    }

    /**
     * Add an subscription updated event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_updated` webhook.
     * 
     * @param {SubscriptionUpdatedPayload} subscription 
     */
    async addSubscriptionUpdatedStatus(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        await this.addSubscriptionCancelledStatus(Object.assign(
            {},
            subscription,
            {
                status: 'pi/superseded-by-update',
                quantity: subscription.old_quantity,
                cancellation_effective_date: subscription.event_time,
                checkout_id: subscription.checkout_id,
                subscription_plan_id: subscription.old_subscription_plan_id
            }
        ))

        const ids = this._getTargetIdsFromPassthrough(subscription.passthrough)

        const statusModel = {
            alert_id: subscription.alert_id,
            alert_name: subscription.alert_name,
            cancel_url: subscription.cancel_url,
            checkout_id: subscription.checkout_id,
            currency: subscription.currency,
            description: subscription.status,
            next_bill_date: subscription.next_bill_date,
            quantity: subscription.new_quantity,
            event_time: subscription.event_time,
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.subscription_plan_id,
            vendor_user_id: subscription.user_id,
        }

        const encoded = htmlEncode(statusModel)
        const updateModel = {
            [`${this._resourceName}.status`]: this._storage._arrayUnion(encoded)
        }

        return this._storage.update(ids, updateModel)
    }

    /**
     * Add an subscription cancelled event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_cancelled` webhook.
     * 
     * @param {SubscriptionCancelledPayload} subscription 
     */
    async addSubscriptionCancelledStatus(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const ids = this._getTargetIdsFromPassthrough(subscription.passthrough)

        const statusModel = {
            alert_id: subscription.alert_id,
            alert_name: subscription.alert_name,
            checkout_id: subscription.checkout_id,
            currency: subscription.currency,
            description: subscription.status,
            quantity: subscription.quantity ? subscription.quantity : '',
            event_time: subscription.cancellation_effective_date,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.subscription_plan_id,
            vendor_user_id: subscription.user_id,
        }

        const encoded = htmlEncode(statusModel)
        const updateModel = {
            [`${this._resourceName}.status`]: this._storage._arrayUnion(encoded)
        }

        return this._storage.update(ids, updateModel)
    }

    /**
     * Add a payment event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_payment_succeeded` webhook.
     * 
     * @param {Object} payment 
     * @returns 
     */
    async addSuccessfulPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const ids = this._getTargetIdsFromPassthrough(payment.passthrough)

        const encoded = htmlEncode(payment)
        delete encoded.p_signature

        const updateModel = {
            [`${this._resourceName}.payments`]: this._storage._arrayUnion(encoded),
        }

        return this._storage.update(ids, updateModel)
    }

    /**
     * Add a payment event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_payment_failed` webhook.
     * 
     * @param {Object} payment 
     * @returns 
     */
    async addFailedPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const ids = this._getTargetIdsFromPassthrough(payment.passthrough)

        const encoded = htmlEncode(payment)
        delete encoded.p_signature

        const updateModel = {
            [`${this._resourceName}.payments`]: this._storage._arrayUnion(encoded),
        }

        return this._storage.update(ids, updateModel)
    }

    /**
     * Add a payment event. Uses the `passthrough` parameter to identify the target subscription.
     * 
     * You can directly pass the payload of the respective `subscription_payment_refunded` webhook.
     * 
     * @param {Object} payment 
     * @returns 
     */
    async addRefundedPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const ids = this._getTargetIdsFromPassthrough(payment.passthrough)

        const encoded = htmlEncode(payment)
        delete encoded.p_signature

        const updateModel = {
            [`${this._resourceName}.payments`]: this._storage._arrayUnion(encoded),
        }

        return this._storage.update(ids, updateModel)
    }
}

module.exports = Subscriptions