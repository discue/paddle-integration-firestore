/**
 * @typedef {import('@google-cloud/firestore').Query} Query
 */

/**
 * This callback is displayed as part of the Requester class.
 * @callback QueryCallback
 * @param {Query} query
 * @returns {Query}
 */

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.EQUALS = (field, target) => module.exports.WHERE(field, '=', target)

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.EQUALS_ANY_OF = (field, target) => module.exports.WHERE(field, 'in', target)

/**
 * Adds a where clause to the query
 *
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.LESS_THAN = (field, target) => module.exports.WHERE(field, '<', target)

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.LESS_THAN_OR_EQUAL = (field, target) => module.exports.WHERE(field, '<=', target)

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.GREATER_THAN = (field, target) => module.exports.WHERE(field, '>', target)

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.GREATER_THAN_OR_EQUAL = (field, target) => module.exports.WHERE(field, '>=', target)

/**
 * Adds a where clause to the query
 * 
 * @param {String} field the target field name
 * @param {String} operator the operator like '>', or 'in'
 * @param {unknown} target the target value
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://firebase.google.com/docs/firestore/query-data/queries#query_operators
 */
module.exports.WHERE = (field, operator, target) => (query) => {
    return query.where(field, operator, target)
}

/**
 * Limits the result set to the given number
 * 
 * @param {Number} amount the desired maximum number of elements the query should return
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://cloud.google.com/firestore/docs/query-data/order-limit-data
 */
module.exports.LIMIT = (amount) => (query) => {
    return query.limit(amount)
}

/**
 * Start the result set after the value
 * 
 * @param {...unknown} value concrete values of the columns used in order by clause
 * @returns {QueryCallback} a function that updates the query accordingly
 */
module.exports.START_AFTER = (...values) => (query) => {
    return query.startAfter.apply(query, values)
}

/**
 * Request the result set to be sorted ascending by given field
 * 
 * @param {String} field the target field name
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://cloud.google.com/firestore/docs/query-data/order-limit-data
 */
module.exports.SORT_BY_ASC = (field) => module.exports.SORT_BY(field, 'asc')

/**
 * Request the result set to be sorted descending by given field
 * 
 * @param {String} field the target field name
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://cloud.google.com/firestore/docs/query-data/order-limit-data
 */
module.exports.SORT_BY_DESC = (field) => module.exports.SORT_BY(field, 'desc')

/**
 * Request the result set to be sorted by given field
 * 
 * @param {String} field the target field name
 * @param {String} ascOrDesc the sorting direction 'asc', or 'desc'
 * @returns {QueryCallback} a function that updates the query accordingly
 * 
 * @see https://cloud.google.com/firestore/docs/query-data/order-limit-data
 */
module.exports.SORT_BY = (field, ascOrDesc) => (query) => {
    return query.orderBy(field, ascOrDesc)
}