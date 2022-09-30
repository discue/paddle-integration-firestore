const SUBSCRIPTION_ACTIVE_STATUS = [
    "active",
    "trialing",
    "past_due",
]

/**
* Returns true if the given status has a description that we recognize as active
*  
* @private
* @param {Object} activeStatus 
* @returns {Boolean} true or false
*/
const _isSubscriptionStatusCurrentlyActive = (status) => {
    return SUBSCRIPTION_ACTIVE_STATUS.includes(status.description)
}

/**
 * @typedef IsStatusActiveOptions
 * @property {Boolean} [sort=true] true if status objects should be sorted by date. Can be disabled if status objects were already sorted.
 * @property {Boolean} [filter=true] true if status objects should be filtered to exclude status objects that are not yet valid.  Can be safely disabled if status objects were already filtered.
 * @property {Boolean} [filterNotBeforeDate=new Date()]  the date that should be used to calculate whether a subscription is currently active. Defaults to true.
*/

/**
* Returns the status of each subscription found in the subscription object. 
* 
* For each found subscription the method will add a key (the subscription id) and a boolean value
* indicating whether the subscription plan is active (true) or not active (false).
* 
* Unless the second parameter is passed, the status will always be calculated
* using the current local time.
* 
* @param {Object} subscription
* @param {IsStatusActiveOptions} [options={}] date for the calculation  
* @returns {Object} true if an active subscription was given
*/
module.exports.getAllSubscriptionsStatus = (subscriptions, { sort = true, filter = true, filterNotBeforeDate = new Date() }) => {
    const result = {}
    const now = filterNotBeforeDate.getTime() + 10_000

    Object.entries(subscriptions).forEach(([subscriptionPlanId, list]) => {
        if (sort) {
            list.sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())
        }

        if (filter) {
            list = list.filter(status => new Date(status).getTime() < now)
        }

        result[subscriptionPlanId] = _isSubscriptionStatusCurrentlyActive(list.at(0))
    })

    return result
}