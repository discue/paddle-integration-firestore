'use strict'

const resource = require('./firestore/nested-firestore-resource')
const htmlEncode = require('./html-encoder')

const { EQUALS, EQUALS_ANY_OF } = require('./firestore/firestore-queries')

const SUBSCRIPTION_ACTIVE_STATUS = [
    "active",
    "trialing",
    "past_due",
]

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
 * @property {String} unit_price - The price per unit of the subscription.
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
 * @property {String} new_unit_price - The new price per unit of the subscription.
 * @property {String} next_bill_date - The date the next payment is due on this subscription.
 * @property {String} old_next_bill_date - The previous date the next payment was due on this subscription.
 * @property {String} old_price - The previous price per unit of the subscription.
 * @property {String} old_quantity - The previous number of products or subscription seats sold in the transaction.
 * @property {String} old_status - The previous status of the subscription.
 * @property {String} old_subscription_plan_id - The previous ID of the Subscription Plan the customer is subscribed to.
 * @property {String} old_unit_price - The previous price per unit of the subscription.
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
 * @property {String} unit_price - The price per unit of the subscription.
 * @property {String} user_id - The customer user id.
 * @property {String} p_signature
 */

class Subscriptions {

    constructor(storagePath) {
        this._storage = resource({ documentPath: storagePath, resourceName: 'subscription' })
    }

    get ERROR_INVALID_ARGUMENTS() {
        return 'INVALID_ARGUMENTS'
    }

    /**
     * Adds a placeholder for a subscription so that webhooks only need to append to existing subscription
     * 
     * @param {Array<String>} ids 
     */
    async addSubscriptionPlaceholder(ids) {
        const statusModel = {
            description: 'pre-checkout-placeholder',
        }

        const subscriptionModel = {
            payments: [],
            status: [statusModel],
        }

        await this._storage.put(ids, subscriptionModel)
    }

    /**
     * 
     * @param {SubscriptionCreatedPayload} subscription 
     */
    async addSubscription(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(subscription.passthrough)

        const statusModel = {
            currency: subscription.currency,
            description: subscription.status,
            next_bill_date: subscription.next_bill_date,
            unit_price: subscription.unit_price,
            quantity: subscription.quantity,
            start_at: subscription.event_time,
        }

        const subscriptionModel = {
            cancel_url: subscription.cancel_url,
            checkout_id: subscription.checkout_id,
            payments: [],
            status: this._storage._arrayUnion(statusModel),
            source: subscription.source,
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.subscription_plan_id,
            vendor_user_id: subscription.user_id,
        }

        await this._storage.update(ids, subscriptionModel)
    }

    /**
     * 
     * @param {SubscriptionUpdatedPayload} subscription 
     */
    async updateSubscription(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(subscription.passthrough)

        const statusModel = {
            currency: subscription.currency,
            description: subscription.status,
            next_bill_date: subscription.next_bill_date,
            unit_price: subscription.new_unit_price,
            quantity: subscription.new_quantity,
            start_at: subscription.event_time,
        }

        const subscriptionModel = {
            cancel_url: subscription.cancel_url,
            checkout_id: subscription.checkout_id,
            payments: [],
            status: this._storage._arrayUnion(statusModel),
            update_url: subscription.update_url,
            subscription_id: subscription.subscription_id,
            subscription_plan_id: subscription.subscription_plan_id,
            vendor_user_id: subscription.user_id,
        }

        await this._storage.update(ids, subscriptionModel)
    }

    /**
     * 
     * @param {SubscriptionCancelledPayload} subscription 
     */
    async cancelSubscription(subscription) {
        if (!subscription) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(subscription.passthrough)

        const statusModel = {
            currency: subscription.currency,
            description: subscription.status,
            unit_price: subscription.unit_price,
            quantity: subscription.quantity ? subscription.quantity : '',
            start_at: subscription.cancellation_effective_date,
        }

        const subscriptionModel = {
            status: this._storage._arrayUnion(statusModel),
            subscription_plan_id: subscription.subscription_plan_id,
        }

        await this._storage.update(ids, subscriptionModel)
    }

    /**
     * 
     * @param {Object} subscription 
     * @returns {boolean} true subscription is active
     */
    async isSubscriptionActive(subscription) {
        return this._isOneOfSubscriptionsActive([subscription])
    }

    /**
     * 
     * @param {Array} subscriptions
     * @returns {boolean} true if an active subscription was given
     */
    async _isOneOfSubscriptionsActive(subscriptions) {
        const now = Date.now()

        const allStatus = subscriptions.map(subscription => {
            // filter all status object that have a start date in the past
            // and sort by start date descending
            return subscription.status
                .filter(status => new Date(status.start_at).getTime() < now)
                .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
        })

        // now compare the first status element of each subscription and take the latest one
        let latestStatus = null
        for (const status of allStatus) {
            if (!latestStatus || new Date(latestStatus.start_at).getTime() < new Date(status[0]).getTime()) {
                latestStatus = status[0]
            }
        }

        return this._isSubscriptionStatusCurrentlyActive(latestStatus)
    }

    /**
    * 
    * Returns true if the given status has a description that we recognize as active
    * 
    * <strong>Status must be decrypted</strong>
    * 
    * @param {Object} activeStatus 
    * @returns {Boolean} true or false
    */
    _isSubscriptionStatusCurrentlyActive(status) {
        return SUBSCRIPTION_ACTIVE_STATUS.includes(status.description)
    }

    async addSuccessfulPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(payment.passthrough)

        const encoded = htmlEncode(payment)
        const subscriptionModel = {
            payments: this._storage._arrayUnion(htmlEncode(encoded)),
        }

        await this._storage.update(ids, subscriptionModel)
    }

    async addFailedPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(payment.passthrough)

        const encoded = htmlEncode(payment)
        const subscriptionModel = {
            payments: this._storage._arrayUnion(htmlEncode(encoded)),
        }

        await this._storage.update(ids, subscriptionModel)
    }

    async addRefundedPayment(payment) {
        if (!payment) {
            return Promise.reject(new Error(this.ERROR_INVALID_ARGUMENTS))
        }

        const { ids } = JSON.parse(payment.passthrough)

        const encoded = htmlEncode(payment)
        const subscriptionModel = {
            payments: this._storage._arrayUnion(htmlEncode(encoded)),
        }

        await this._storage.update(ids, subscriptionModel)
    }
}

module.exports = Subscriptions