'use strict'

const { expect } = require('chai')
const index = require('../../../lib/client/index')

describe('Client', () => {
    it('exports customData function', () => {
        expect(typeof index.customData).to.equal('function')
    })
})