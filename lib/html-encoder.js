'use strict'

const encodeHtml = require('html-entities').encode

const encode = (object) => {
    const result = {}

    Object.entries(object).forEach(([key, value]) => {
        if (typeof value === 'object') {
            result[key] = encode(value)
        } else {
            result[key] = encodeHtml(value)
        }
    })

    return result
}

module.exports = encode