'use strict'

const { expect } = require('chai')
const flatten = require('../../../lib/firestore/flatten')

describe('Flatten', () => {

    it('flattens an object', () => {
        const object = {
            1: 'one',
            2: 'two',
            nested: {
                nested: 'three',
                four: [1, 2, 3]
            }
        }

        const flattened = flatten(object)

        expect(flattened['1']).to.equal('one')
        expect(flattened['2']).to.equal('two')
        expect(flattened['nested.nested']).to.equal('three')
        expect(flattened['nested.four']).to.deep.equal([1, 2, 3])
    })
})