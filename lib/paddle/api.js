'use strict'

const SANDBOX_BASE_URL = 'https://sandbox-vendors.paddle.com/api/2.0/'
const BASE_URL = 'https://vendors.paddle.com/api/2.0/'

const PATH_CANCEL_SUBSCRIPTION = 'subscription/users_cancel'
const PATH_LIST_USERS = 'subscription/users'
const PATH_UPDATE_USERS = 'subscription/users/update'
const PATH_LIST_PRODUCTS = 'product/get_products'

module.exports = class {

    constructor({
        authCode,
        vendorId,
        useSandbox = false
    } = {}) {
        this._vendorId = vendorId
        this._authCode = authCode
        this._baseUrl = useSandbox ? SANDBOX_BASE_URL : BASE_URL
    }

    async init() {
        if (!this._got) {
            this._got = (await import('got')).default.extend({
                prefixUrl: this._baseUrl,
                method: 'POST',
                retry: {
                    limit: 0
                },
                timeout: {
                    connect: 5_000,
                    send: 20_000,
                },
                throwHttpErrors: false,
            })
        }
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @returns 
     */
    async refundFullPayment({ order_id }) {
        return this._returnResponseIf200(this._got(PATH_LIST_USERS, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                order_id
            }
        }))
    }

    /**
     * 
     * @param {String} state list only subscriptions with given state
     * @returns 
     */
    async listSubscriptions(state = 'active') {
        return this._returnResponseIf200(this._got(PATH_LIST_USERS, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                state
            }
        }))
    }

    /**
     * 
     * @returns 
     */
    async listProducts() {
        return this._returnResponseIf200(this._got(PATH_LIST_PRODUCTS, {
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
        return this._returnResponseIf200(this._got(PATH_UPDATE_USERS, {
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
        return this._returnResponseIf200(this._got(this._baseUrl, {
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
        return this._returnResponseIf200(this._got(PATH_CANCEL_SUBSCRIPTION, {
            form: {
                vendor_id: this._vendorId,
                vendor_auth_code: this._authCode,
                subscription_id
            }
        }))
    }

    async _returnResponseIf200(promise) {
        const response = await promise
        const { statusCode, body } = response
        const data = JSON.parse(body)

        if (statusCode === 200 && data.success === true) {
            return data.response || true
        } else {
            throw new Error(`Request failed with status ${statusCode} and data ${JSON.stringify(data)}`)
        }
    }
}