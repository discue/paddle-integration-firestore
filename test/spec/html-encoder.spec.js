'use strict'

const encode = require('../../lib/html-encoder')

const { expect } = require('chai')

describe('HtmlEncoder', () => {
    it('encodes recursively', () => {
        const object = {
            nested1: {
                nested2: {
                    left: '<',
                    right: '>'
                }
            }
        }

        const encoded = encode(object)
        expect(encoded.nested1.nested2.left).to.equal('&lt;')
        expect(encoded.nested1.nested2.right).to.equal('&gt;')
    })
})