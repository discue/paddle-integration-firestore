'use strict'

const { test, expect } = require('@playwright/test')

let api

test.beforeAll(async () => {
    const API = (await import('../../lib/paddle/api.js')).default
    api = new API({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()
})

test('list all products', async () => {
    const products = await api.listProducts()
    expect(products.products).toHaveLength(0)
})

test('list all active subscriptions', async () => {
    const subs = await api.listSubscriptions()
    expect(subs).toHaveLength(0)
})

test('list all deleted subscriptions', async () => {
    const subs = await api.listSubscriptions('deleted', 51)
    expect(subs.length).toBeGreaterThan(50)
})

test('list all plans', async () => {
    const subs = await api.listPlans()
    expect(subs).toHaveLength(2)
})

test('list one plan', async () => {
    const subs = await api.listPlans(33590)
    expect(subs).toHaveLength(1)
})