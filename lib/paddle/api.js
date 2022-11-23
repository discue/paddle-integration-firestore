'use strict'

const SANDBOX_BASE_URL = 'https://sandbox-vendors.paddle.com/api/'
const BASE_URL = 'https://vendors.paddle.com/api/'

const VERSION_1 = 1.0
const VERSION_2 = 2.0

const PATH_CANCEL_SUBSCRIPTION = `${VERSION_2}/subscription/users_cancel`
const PATH_LIST_USERS = `${VERSION_2}/subscription/users`
const PATH_LIST_PLANS = `${VERSION_2}/subscription/plans`
const PATH_UPDATE_USERS = `${VERSION_2}/subscription/users/update`
const PATH_LIST_PRODUCTS = `${VERSION_2}/product/get_products`

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

    async init({ connectTimeout = 5_000, readTimeout = 20_000, retries = 0 } = {}) {
        if (!this._got) {
            this._got = (await import('got')).default.extend({
                prefixUrl: this._baseUrl,
                method: 'POST',
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

    async _request(path, payload) {
        if (!this._got) {
            await this.init()
        }

        return this._got(path, payload)
    }

    /**
     * 
     * @param {Object} subscription the target subscription object
     * @returns 
     */
    async refundFullPayment({ order_id }) {
        return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
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
     * @param {String} state list only subscriptions with given state. Lists only active subs by default.
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
        return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
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

        return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
            form
        }))
            .catch((e) => {
                if (e.message.includes('119')) {
                    form.state = 'deleted'
                    return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
                        form
                    }))
                } else {
                    throw e
                }
            })
    }

    /**
       * 
       * @param {Object} subscription the target subscription object
       * @param {Number} perPage limit the response to a certain number of results
       */
    async getOrder({ order_id }) {
        const form = {
            vendor_id: this._vendorId,
            vendor_auth_code: this._authCode,
            subscription_id
        }

        return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
            form
        }))
            .catch((e) => {
                if (e.message.includes('119')) {
                    form.state = 'deleted'
                    return this._returnResponseIf200(this._request(PATH_LIST_USERS, {
                        form
                    }))
                } else {
                    throw e
                }
            })
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
        return this._returnResponseIf200(this._request(PATH_LIST_PLANS, {
            form
        }))
    }

    /**
     * 
     * @returns 
     */
    async listProducts() {
        return this._returnResponseIf200(this._request(PATH_LIST_PRODUCTS, {
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
        return this._returnResponseIf200(this._request(PATH_UPDATE_USERS, {
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
        return this._returnResponseIf200(this._request(this._baseUrl, {
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
        return this._returnResponseIf200(this._request(PATH_CANCEL_SUBSCRIPTION, {
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