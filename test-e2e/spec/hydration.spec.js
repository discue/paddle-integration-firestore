'use strict'

const { randomUUID } = require('crypto')
const { test, expect } = require('@playwright/test')

const index = require('../../lib/index')
const subscriptions = new index.SubscriptionsHooks('api_client')

const storageResource = require('../../lib/firestore/nested-firestore-resource')
const SubscriptionInfo = require('../../lib/subscription-info')
const storage = storageResource({ documentPath: 'api_client', resourceName: 'api_clients' })

let subscriptionInfo
let subscriptionHydration
let apiClientId
let api

test.beforeAll(async () => {
    api = new index.Api({ useSandbox: true, authCode: process.env.AUTH_CODE, vendorId: process.env.VENDOR_ID })
    await api.init()

    subscriptionInfo = new index.SubscriptionInfo('api_client', { api })
    subscriptionHydration = new index.SubscriptionsHydration('api_client', { api, hookStorage: subscriptions })
})

test.beforeEach(async () => {
    apiClientId = randomUUID()
    await storage.put([apiClientId], {})
    await subscriptions.addSubscriptionPlaceholder([apiClientId])
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
        await page.goto(`http://localhost:3333/checkout.html?clientId=${apiClientId}`)
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').click()
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').fill('12345')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="postcodeInput"]').press('Enter')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="CARD_PaymentSelectionButton"]').click()
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').click()
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').fill('4000 0566 5566 5556')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardNumberInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').fill('Muller')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardholderNameInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryMonthInput"]').fill('120')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryMonthInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryYearInput"]').fill('2025')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="expiryYearInput"]').press('Tab')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').fill('123')
        await page.frameLocator('iframe[name="paddle_frame"]').locator('[data-testid="cardVerificationValueInput"]').press('Enter')
    }, 1000)

    return new Promise((resolve) => {
        page.exposeFunction('testCallback', resolve)
    })
}

test('hydrate an active subscription', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page, apiClientId)

    let { subscription } = await storage.get([apiClientId])
    const subscriptionId = subscription.status[1].subscription_id

    // .. and check subscription is active to make sure setup was correct
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // remove status and payments to verify hydration process
    await storage.update([apiClientId], {
        'subscription.status': [],
        'subscription.payments': []
    });

    ({ subscription } = await storage.get([apiClientId]))
    // .. expect sub to be not active anymore after we reset all status and payments
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeFalsy()

    // .. now hydrate status again ..
    await subscriptionHydration.hydrateSubscriptionCreated([apiClientId], { subscription_id: subscriptionId }, 'checkoutId');

    // .. and expect subscription to be active again
    ({ subscription } = await storage.get([apiClientId]))
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()
})

test('throws if subscription was created for another client', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page, apiClientId)

    let { subscription } = await storage.get([apiClientId])
    const subscriptionId = subscription.status[1].subscription_id

    // .. and check subscription is active to make sure setup was correct
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // remove status and payments to verify hydration process
    await storage.update([apiClientId], {
        'subscription.status': [],
        'subscription.payments': []
    });

    ({ subscription } = await storage.get([apiClientId]))
    // .. expect sub to be not active anymore after we reset all status and payments
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeFalsy()

    try {
        // add dummy client here
        await storage.put(['123'], {
            subscription: {
                status: []
            }
        })
        await subscriptionHydration.hydrateSubscriptionCreated(['123'], { subscription_id: subscriptionId }, 'checkoutId')
        throw new Error('Must throw')
    } catch (e) {
        const message = e.message
        expect(message).toEqual(SubscriptionInfo.HYDRATION_UNAUTHORIZED)
    }
})

test('does not hydrate if status created was already received', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page, apiClientId)

    let { subscription } = await storage.get([apiClientId])
    const subscriptionId = subscription.status[1].subscription_id

    // .. and check subscription is active to make sure setup was correct
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    // .. now hydrate status again ..
    await subscriptionHydration.hydrateSubscriptionCreated([apiClientId], { subscription_id: subscriptionId }, 'checkoutId');

    // .. and expect subscription to be active again
    ({ subscription } = await storage.get([apiClientId]))
    expect(subscription.status).toHaveLength(2)
})

test('hydrate a deleted subscription', async ({ page }) => {
    // create new subscription and ...
    await createNewSubscription(page, apiClientId)

    let { subscription } = await storage.get([apiClientId])
    const subscriptionId = subscription.status[1].subscription_id

    // .. and check subscription is active to make sure setup was correct
    let sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeTruthy()

    try {
        await subscriptionInfo.cancelSubscription(subscription, '33590')
        await page.waitForTimeout(10000)
    } catch (e) {
        if (e.message !== index.SubscriptionInfo.ERROR_SUBSCRIPTION_ALREADY_CANCELLED) {
            throw e
        }
    }

    ({ subscription } = await storage.get([apiClientId]))
    // .. expect sub to be not active anymore in the future
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription, new Date(new Date().getTime() + 1000 * 3600 * 24 * 35))
    expect(sub['33590']).toBeFalsy()

    // remove status and payments to verify hydration process
    await storage.update([apiClientId], {
        'subscription.status': [],
        'subscription.payments': []
    })

    // .. now hydrate status again ..
    await subscriptionHydration.hydrateSubscriptionCancelled([apiClientId], { subscription_id: subscriptionId }, 'checkoutId');

    // .. and expect subscription to be active again
    ({ subscription } = await storage.get([apiClientId]))
    sub = await subscriptionInfo.getAllSubscriptionsStatus(subscription)
    expect(sub['33590']).toBeFalsy()

    const { status: subscriptionStatus } = subscription
    expect(subscriptionStatus).toHaveLength(1)

    const subscriptionsFromApi = await api.getSubscription(subscription.status.at(0))
    const subscriptionFromApi = subscriptionsFromApi.at(0)

    const status = subscriptionStatus.at(0)

    expect(status.alert_id).toEqual(index.SubscriptionInfo.HYDRATION_SUBSCRIPTION_CANCELLED)
    expect(status.alert_name).toEqual(index.SubscriptionInfo.HYDRATION_SUBSCRIPTION_CANCELLED)
    expect(status.currency).toEqual(subscriptionFromApi.last_payment.currency)
    expect(status.description).toEqual('deleted')
    expect(status.next_bill_date).toBeUndefined()
    expect(status.quantity).toEqual('')
    expect(new Date(status.event_time).getTime()).toBeGreaterThanOrEqual(Date.now() - 2000)
    expect(status.update_url).toBeUndefined()
    expect(status.subscription_id).toEqual(subscriptionFromApi.subscription_id)
    expect(status.subscription_plan_id).toEqual(subscriptionFromApi.plan_id)
    expect(status.cancel_url).toBeUndefined()
    expect(status.checkout_id).toEqual('checkoutId')
    expect(status.vendor_user_id).toEqual(subscriptionFromApi.user_id)
})