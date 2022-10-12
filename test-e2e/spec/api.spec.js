'use strict'

const { test, expect } = require('@playwright/test')

let api

test.beforeAll(async () => {
    const API = await (await import('../../lib/paddle/api.js')).default
    api = new API({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()
})

test('list all products', async () => {
    const products = await api.listProducts()
    expect(products.products).toHaveLength(0)
})


test('list all subscriptions', async () => {
    const subs = await api.listSubscriptions()
    expect(subs).toHaveLength(0)
})