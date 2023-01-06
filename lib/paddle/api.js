'use strict'

const simpleLogger = require('../simple-logger')
const { randomUUID } = require('crypto')

const VENDORS_SANDBOX_BASE_URL = 'https://sandbox-vendors.paddle.com/api/'
const VENDORS_BASE_URL = 'https://vendors.paddle.com/api/'

const CHECKOUT_SANDBOX_BASE_URL = 'https://sandbox-checkout.paddle.com/api/'
const CHECKOUT_BASE_URL = 'https://checkout.paddle.com/api/'

const VERSION_1 = '1.0'
const VERSION_2 = '2.0'

const PATH_CANCEL_SUBSCRIPTION = `${VERSION_2}/subscription/users_cancel`
const PATH_LIST_USERS = `${VERSION_2}/subscription/users`
const PATH_LIST_PLANS = `${VERSION_2}/subscription/plans`
const PATH_LIST_PAYMENTS = `${VERSION_2}/subscription/payments`
const PATH_UPDATE_USERS = `${VERSION_2}/subscription/users/update`
const PATH_LIST_PRODUCTS = `${VERSION_2}/product/get_products`
const PATH_GET_ORDER = `${VERSION_1}/order`

module.exports = class {

    constructor({
        authCode,
        vendorId,
        useSandbox = false,
        logRequests = false
    } = {}) {
        this._vendorId = vendorId
        this._authCode = authCode
        this._vendorsBaseUrl = useSandbox ? VENDORS_SANDBOX_BASE_URL : VENDORS_BASE_URL
        this._checkoutBaseUrl = useSandbox ? CHECKOUT_SANDBOX_BASE_URL : CHECKOUT_BASE_URL
        this._logRequests = logRequests
    }

    async init({ connectTimeout = 5_000, readTimeout = 20_000, retries = 0 } = {}) {
        if (!this._got) {
            this._got = (await import('got')).default.extend({
                retry: {
                    limit: retries
                },
                timeout: {
                    connect: connectTimeout,
                    send: readTimeout,
                },
                throwHttpErrors: false,
            })
        }
    }

    async _request(path, payload, method = 'POST') {
        let traceId

        if (!this._got) {
            await this.init()
        }

        if (this._logRequests) {
            traceId = randomUUID({ disableEntropyCache: true }).substring(0, 6)
            simpleLogger.info(`${traceId} Sending request to ${path} with payload ${JSON.stringify(payload)}`)
        }
        
        const response = await this._got(path, Object.assign({ method }, payload))
        const { statusCode, body } = response
        if (this._logRequests) {
            simpleLogger.info(`${traceId} Received response with ${statusCode} and payload ${body ? JSON.stringify(body) : 'empty'}`)
        }

        return response
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @returns 
     */
    async refundFullPayment({ order_id }) {
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_USERS, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                order_id
            }
        }))
    }

    /**
     * Note: Returns all active, past_due, trialing and paused subscription 
     * plans if not specified. 
     * 
     * @param {String} [state='active'] list only subscriptions with given state. Lists only active subs by default.
     * @param {Number} perPage limit the response to a certain number of results
     * @returns 
     */
    async listSubscriptions(state = 'active', perPage) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode
        }
        if (state) {
            form.state = state
        }
        if (perPage) {
            form.results_per_page = perPage
        }
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_USERS, {
            form
        }))
    }

    /**
       * 
       * @param {Object} subscription the target subscription object
       * @param {Number} perPage limit the response to a certain number of results
       */
    async getSubscription({ subscription_id }) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode,
            subscription_id
        }

        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_USERS, {
            form
        }))
            .catch((e) => {
                if (e.message.includes('119')) {
                    form.state = 'deleted'
                    return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_USERS, {
                        form
                    }))
                } else {
                    throw e
                }
            })
    }

    /**
     * @typedef GetSubscriptionPaymentsOptions
     * @property {string} [plan=null] subscription plan id
     * @property {string} [from=null] filter payments starting after the date specified (date in format YYYY-MM-DD)
     * @property {string} [to=null] filter payments ending the day before the date specified (date in format YYYY-MM-DD)
     */

    /**
     * @typedef SubscriptionPayment
     * @property {string} id
     * @property {string} subscription_id
     * @property {string} amount
     * @property {string} currency
     * @property {string} payout_date format YYYY-MM-DD
     * @property {number} is_paid 1 = true, 0 = false
     * @property {boolean} is_one_off_charge
     * @property {string} receipt_url
     */

    /**
     * @param {Object} subscription target subscription object 
     * @param {GetSubscriptionPaymentsOptions} [subscription=undefined] the target subscription object
     * @returns {Array.<SubscriptionPayment>}
     */
    async getSubscriptionPayments({ subscription_id }, { plan, from, to } = {}) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode,
            subscription_id
        }

        if (plan) {
            form.plan = plan
        }
        if (from) {
            form.from = from
        }
        if (to) {
            form.to = to
        }
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_PAYMENTS, {
            form
        }))
    }

    /**
       * 
       * @param {Object} checkout the target checkout object
       */
    async getOrder({ checkout_id }) {
        const url = `${this._checkoutBaseUrl}${PATH_GET_ORDER}?checkout_id=${checkout_id}`
        return this._returnBodyIf200(this._request(url, {}, 'GET'))
    }

    /**
     * 
     * @param {String} plan return only specific plan info
     * @returns 
     */
    async listPlans(plan) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode
        }
        if (plan) {
            form.plan = plan
        }
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_PLANS, {
            form
        }))
    }

    /**
     * 
     * @param {String} plan subscription plan id
     * @returns
     */
    async getPlan({ plan_id }) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode,
            plan: plan_id
        }
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_PLANS, {
            form
        }))
    }

    /**
     * 
     * @returns 
     */
    async listProducts() {
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_LIST_PRODUCTS, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode
            }
        }))
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @param {String} planId the plan id to update to
     * @returns 
     */
    async updateSubscriptionPlan({ subscription_id }, planId) {
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_UPDATE_USERS, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                bill_immediately: true,
                prorate: true,
                subscription_id,
                plan_id: planId
            }
        }))
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @param {String} postcode the new postcode
     * @returns 
     */
    async updatePostcode({ subscription_id }, postcode) {
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + this._vendorsBaseUrl, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                subscription_id,
                postcode
            }
        }))
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @returns 
     */
    async cancelSubscription({ subscription_id }) {
        return this._returnResponseIf200(this._request(this._vendorsBaseUrl + PATH_CANCEL_SUBSCRIPTION, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                subscription_id
            }
        }))
    }

    async _returnBodyIf200(response) {
        const { statusCode, body } = await response
        if (statusCode === 200) {
            return JSON.parse(body)
        }

        throw new Error(`Request failed with status ${statusCode} and data ${body}`)
    }

    async _returnResponseIf200(response) {
        const { statusCode, body } = await response

        if (statusCode === 200) {
            const data = JSON.parse(body)
            if (data.success === undefined || data.success === true) {
                return data.response || true
            }
        }

        throw new Error(`Request failed with status ${statusCode} and data ${body}`)
    }
}