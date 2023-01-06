'use strict'

const encodeHtml = require('html-entities').encode

const encode = (object) => {
    const result = {}

    if (typeof object === 'string') {
        return encodeHtml(object)
    }
    Object.entries(object).forEach(([key, value]) => {
        if (typeof value === 'object') {
            result[key] = encode(value)
        } else if (value === false) {
            result[key] = false
        } else {
            result[key] = encodeHtml(value)
        }
    })

    return result
}

module.exports = encode