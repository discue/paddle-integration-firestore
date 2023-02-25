'use strict'

const { randomUUID } = require('crypto')
const { test, expect } = require('@playwright/test')

const index = require('../../lib/index')

const storageResource = require('../../lib/firestore/nested-firestore-resource')
const storage = storageResource({ documentPath: 'api_client', resourceName: 'api_clients' })
const resourceName = '$$subscriptions'

let subscriptionHooks
let subscriptionInfo
let subscriptionHydration
let apiClientId
/**
 * @type {import('../../lib/paddle/api.js')}
 */
let api

test.beforeAll(async () => {
    api = new index.Api({ logRequests: true, useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()

    subscriptionHooks = new index.SubscriptionHooks('api_client', { resourceName })
    subscriptionInfo = new index.SubscriptionInfo('api_client', { api, resourceName })
    subscriptionHydration = new index.SubscriptionHydration('api_client', { api, hookStorage: subscriptionHooks, subscriptionInfo, resourceName })
})

test.beforeEach(async () => {
    apiClientId = randomUUID()
    await storage.put([apiClientId], {})
    await subscriptionHooks.addSubscriptionPlaceholder([apiClientId])
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
})

async function createNewSubscription(page, apiClientId) {
    setTimeout(async () => {
        const nextYear = new Date().getFullYear() + 1
        await page.goto(`http://localhost:3333/checkout.html?clientId=${apiClientId}`)
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').click()
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').fill('12345')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').press('Enter')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').click()
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').fill('4000 0566 5566 5556')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').fill('Muller')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryDateInput"]').fill(`12/${nextYear}`)
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryDateInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').fill('123')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').press('Enter')
    }, 1000)

    return new Promise((resolve) => {
        page.exposeFunction('testCallback', resolve)
    })
}

test('hydrate an active subscription', async ({ page }) => {
    // create new subscription and ...
    const result = await createNewSubscription(page, apiClientId)
    const { order } = result
    const { subscription_id: subscriptionId } = order

    let { [resourceName]: subscription } = await storage.get([apiClientId])

    // remove status and payments to verify hydration process
    await storage.update([apiClientId], {
        'subscription.status': [],
        'subscription.payments': []
    });

    ({ [resourceName]: subscription } = await storage.get([apiClientId]))
    // .. expect sub to be not active anymore after we reset all status and payments
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeFalsy()

    // .. now hydrate status again ..
    await subscriptionHydration.hydrateSubscriptionCreated([apiClientId], { subscription_id: subscriptionId }, 'checkoutId');

    // .. and expect subscription to be active again
    ({ [resourceName]: subscription } = await storage.get([apiClientId]))
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()
})
