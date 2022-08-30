'use strict'

const bodyParser = require('body-parser')

module.exports = () => {
    return bodyParser.urlencoded({ extended: true })
}