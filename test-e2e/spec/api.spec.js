'use strict'

const { test, expect } = require('@playwright/test')

/**
 * @type {import('../../lib/paddle/api.js')}
 */
let api

test.beforeAll(async () => {
    const API = (await import('../../lib/paddle/api.js')).default
    api = new API({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
})

test('list all products', async () => {
    const products = await api.listProducts()
    expect(products.products).toHaveLength(0)
})

test('list all active subscriptions', async () => {
    const subs = await api.listSubscriptions()
    expect(subs.length).toBeGreaterThanOrEqual(0)
})

test('list all deleted subscriptions', async () => {
    const subs = await api.listSubscriptions('deleted', 51)
    expect(subs.length).toBeGreaterThan(50)
})

test('list all plans', async () => {
    const subs = await api.listPlans()
    expect(subs.length).toBeGreaterThanOrEqual(2)
})

test('list all subscription payments', async () => {
    const payments = await api.getSubscriptionPayments({ subscription_id: '399236' })
    expect(payments).toHaveLength(1)
})

test('filters subscription payments by plan (correct plan)', async () => {
    const payments = await api.getSubscriptionPayments({ subscription_id: '399236' }, { plan: '33590' })
    expect(payments).toHaveLength(1)
})

test('filters subscription payments starting after', async () => {
    const payments = await api.getSubscriptionPayments({ subscription_id: '399236' }, { from: '2030-01-01' })
    expect(payments).toHaveLength(0)
})

test('filters subscription payments starting before 2030', async () => {
    const payments = await api.getSubscriptionPayments({ subscription_id: '399236' }, { to: '2030-01-01' })
    expect(payments).toHaveLength(1)
})

test('filters subscription payments starting before 2020', async () => {
    const payments = await api.getSubscriptionPayments({ subscription_id: '399236' }, { to: '2020-01-01' })
    expect(payments).toHaveLength(0)
})

test('get plan by id', async () => {
    const subs = await api.getPlan({ plan_id: 33590 })
    expect(subs.length).toEqual(1)
})

test('list one plan', async () => {
    const subs = await api.listPlans(33590)
    expect(subs).toHaveLength(1)
})

test('list order', async () => {
    const order = await api.getOrder({ checkout_id: '1099955-chre32e85ebc35a-3ce5a0996a' })
    expect(order.checkout.checkout_id).toEqual('1099955-chre32e85ebc35a-3ce5a0996a')
})