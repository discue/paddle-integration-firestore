'use strict'

const flatten = (object, prefix = '', context = {}) => {
    return Object.entries(object).reduce((context, [key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key
        // if value is an object then recursively flatten it
        // expect if its an array or  firestore field value
        if (typeof value === 'object' && !Array.isArray(value) && !value.constructor.name.endsWith('Transform')) {
            flatten(value, path, context)
        } else {
            context[path] = value
        }
        return context
    }, context)
}

module.exports = flatten