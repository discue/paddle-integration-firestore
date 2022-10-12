'use strict'

const { test, expect } = require('@playwright/test')
const { expect: chaiExpect } = require('chai')
const emulatorRunner = require('../../test/emulators-runner')
const hookRunner = require('../hook-server-runner')
const hookTunnelRunner = require('../hook-tunnel-runner')
const testPageRunner = require('../test-page-runner')

const { SubscriptionsHooks, SubscriptionInfo } = require('../../lib/index')
const subscriptions = new SubscriptionsHooks('api_client')

const storageResource = require('../../lib/firestore/nested-firestore-resource')
const storage = storageResource({ documentPath: 'api_client', resourceName: 'api_clients' })

let subscriptionInfo
let api

test.beforeAll(emulatorRunner.start)
test.beforeAll(hookRunner.start)
test.beforeAll(hookTunnelRunner.start)
test.beforeAll(testPageRunner.start)
test.afterAll(testPageRunner.stop)

test.beforeAll(async () => {
    const API = await (await import('../../lib/paddle/api.js')).default
    api = new API({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()

    subscriptionInfo = new SubscriptionInfo('api_client', api)
})

test.beforeEach(async () => {
    try {
        await storage.get(['4815162342'])
        await storage.delete(['4815162342'])
    } catch (e) {
        //
    }
    await storage.put(['4815162342'], {})
})
test.beforeEach(() => {
    return subscriptions.addSubscriptionPlaceholder(['4815162342'])
})

test.afterAll(async () => {
    const subscriptions = await api.listSubscriptions()
    for (let i = 0; i < subscriptions.length; i++) {
        const subscription = subscriptions[i]
        await api.cancelSubscription(subscription)
    }
})

test.afterAll(async () => {
    await new Promise((resolve) => {
        setTimeout(resolve, 20000)
    })
    await hookTunnelRunner.stop()
})

test.afterAll(async () => {
    await hookRunner.stop()
})

test.afterAll(emulatorRunner.stop)

async function createNewSubscription(page) {
    await page.goto('http://localhost:3333/checkout.html')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').click()
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').fill('12345')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').press('Enter')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="CARD_PaymentSelectionButton"]').click()
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').click()
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').fill('4242 4242 4242 4242')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').press('Tab')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').fill('Muller')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').press('Tab')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryMonthInput"]').fill('120')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryMonthInput"]').press('Tab')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryYearInput"]').fill('2025')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryYearInput"]').press('Tab')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').fill('123')
    await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').press('Enter')

    await page.waitForSelector('#paddleSuccess', { state: 'visible', timeout: 50000 })
    await page.waitForSelector('.paddle-loader', { state: 'hidden', timeout: 50000 })
    await page.waitForTimeout(20000)
}

async function updatePaymentMethod(page, subscription) {
    await page.goto(subscription.status[1].update_url)
    await page.locator('[data-testid="CARD_PaymentSelectionButton"]').click()
    await page.locator('[data-testid="cardNumberInput"]').click()
    await page.locator('[data-testid="cardNumberInput"]').fill('4000 0038 0000 0446')
    await page.locator('[data-testid="cardNumberInput"]').press('Tab')
    await page.locator('[data-testid="cardholderNameInput"]').fill('Mullan')
    await page.locator('[data-testid="cardholderNameInput"]').press('Tab')
    await page.locator('[data-testid="expiryMonthInput"]').fill('12')
    await page.locator('[data-testid="expiryMonthInput"]').press('Tab')
    await page.locator('[data-testid="expiryYearInput"]').fill('2030')
    await page.locator('[data-testid="expiryYearInput"]').press('Tab')
    await page.locator('[data-testid="cardVerificationValueInput"]').fill('123')

    const [page1] = await Promise.all([
        page.waitForEvent('popup'),
        page.locator('[data-testid="cardPaymentFormSubmitButton"]').click()
    ])

    await page1.locator('text=Complete authentication').click()
    await page.locator('[data-testid="subscriptionManagementSuccess"] div').first().click()
    await page.waitForSelector('[data-testid="subscriptionManagementSuccessInfo"]', { state: 'visible', timeout: 50000 })
}

async function cancelSubscription(page, subscription) {
    await page.goto(subscription.status[1].cancel_url)
    await page.locator('text=Cancel Subscription').click()
    await page.waitForSelector('[data-testid="subscriptionManagementCancelSuccessInfo"]', { state: 'visible', timeout: 50000 })
}

function validateStatus(status) {
    if (status.next_bill_date) {
        chaiExpect(status.next_bill_date).to.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)
    }
    chaiExpect(status.alert_id).to.match(/^[0-9]{7,10}$/)
    chaiExpect(status.alert_name).to.match(/subscription_.*/)
    chaiExpect(status.currency).to.match(/EUR|USD/)
    chaiExpect(status.description).to.match(/active|deleted/)
    chaiExpect(status.unit_price).to.match(/[0-9]{1,2}\.[0-9]{2}/)
    chaiExpect(status.quantity).to.match(/[0-9]{1}/)
    chaiExpect(status.event_time).to.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)
}

test('test cancel via subscription info', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy();

    // cancel subscription ...
    ({ subscription } = await storage.get(['4815162342']))
    const success = await subscriptionInfo.cancelSubscription(subscription, '33590')
    expect(success).toBeTruthy()
    await page.waitForTimeout(10000);

    // ... verify subscription still active today ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription.status).toHaveLength(3)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[2])

    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // and not active next month (35 days)
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription, new Date(new Date().getTime() + 1000 * 3600 * 24 * 35))
    expect(sub['33590']).toBeFalsy()
})

test('test cancel via api', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // cancel subscription ...
    const success = await api.cancelSubscription(subscription.status[1])
    expect(success).toBeTruthy()
    await page.waitForTimeout(10000);

    // ... verify subscription still active today ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription.status).toHaveLength(3)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[2])

    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // and not active next month (35 days)
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription, new Date(new Date().getTime() + 1000 * 3600 * 24 * 35))
    expect(sub['33590']).toBeFalsy()
})

test('test update via subscription info', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // update subscription plan via api ...
    const updated = await subscriptionInfo.updateSubscription(subscription, '33590', '35141')
    expect(updated).toBeTruthy()
    await page.waitForTimeout(30000);

    // .. check  new status and payments added ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(4)
    expect(subscription.payments).toHaveLength(2)

    // .. and still active
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    console.log('active subs', { sub })
    expect(sub['35141']).toBeTruthy()
    expect(sub['33590']).toBeFalsy()
})

test('test update via api', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // update subscription plan via api ...
    await api.updateSubscriptionPlan(subscription.status[1], '35141')
    await page.waitForTimeout(30000);

    // .. check  new status and payments added ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(4)
    expect(subscription.payments).toHaveLength(2)

    // .. and still active
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    console.log('active subs', { sub })
    expect(sub['35141']).toBeTruthy()
    expect(sub['33590']).toBeFalsy()
})

test('test refund via api', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // refund subscription plan via api ...
    const refunded = await api.refundFullPayment(subscription.payments[0])
    expect(refunded).toBeTruthy()
    await page.waitForTimeout(30000);

    // .. check no new status and payments added ...
    // .. because refunds need to be reviewed by paddle time 
    // .. it's their money we're playing with
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    // .. and still active
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()
})

test('test create, update, and cancel via ui', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page)

    // .. check it was stored and payment status was received ..
    let { subscription } = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[1])

    // .. and check it is active
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // update payment method ...
    await updatePaymentMethod(page, subscription)
    await page.waitForTimeout(10000);

    // .. check no new status or payments added ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)
    expect(subscription.payments).toHaveLength(1)

    // .. and still active
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // cancel subscription ...
    await cancelSubscription(page, subscription)
    await page.waitForTimeout(10000);

    // ... verify subscription still active today ...
    ({ subscription } = await storage.get(['4815162342']))
    expect(subscription.status).toHaveLength(3)
    expect(subscription.payments).toHaveLength(1)

    validateStatus(subscription.status[2])

    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // and not active next month (35 days)
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription, new Date(new Date().getTime() + 1000 * 3600 * 24 * 35))
    expect(sub['33590']).toBeFalsy()
})