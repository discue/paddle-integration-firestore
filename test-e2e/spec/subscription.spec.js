'use strict'

const { test, expect } = require('@playwright/test')
const emulatorRunner = require('../../test/emulators-runner')
const hookRunner = require('../hook-server-runner')
const hookTunnelRunner = require('../hook-tunnel-runner')
const testPageRunner = require('../test-page-runner')

const Subscriptions = require('../../lib/index')
const subscriptions = new Subscriptions('subscriptions')

const storageResource = require('../../lib/firestore/nested-firestore-resource')
const storage = storageResource({ documentPath: 'subscriptions', resourceName: 'subscription' })

test.beforeAll(emulatorRunner.start)
test.afterAll(emulatorRunner.stop)

test.beforeAll(hookRunner.start)
test.afterAll(hookRunner.stop)

test.beforeAll(hookTunnelRunner.start)
test.afterAll(hookTunnelRunner.stop)

test.beforeAll(testPageRunner.start)
test.afterAll(testPageRunner.stop)

test.beforeAll(() => {
    return subscriptions.addSubscriptionPlaceholder(['4815162342'])
})

test('test receives and stores webhooks', async ({ page }) => {
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
    await page.waitForTimeout(30000)

    let subscription = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.payments).toHaveLength(1)

    let isActive = await subscriptions.isSubscriptionActive(subscription)
    expect(isActive).toBeTruthy()

    await page.goto(subscription.update_url)
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
    await page.waitForTimeout(10000)

    subscription = await storage.get(['4815162342'])
    expect(subscription).not.toBeFalsy()
    expect(subscription.status).toHaveLength(2)

    await page.goto(subscription.cancel_url)
    await page.locator('text=Cancel Subscription').click()

    await page.waitForTimeout(10000)

    // verify subscription still active today ...
    subscription = await storage.get(['4815162342'])
    isActive = await subscriptions.isSubscriptionActive(subscription)
    expect(isActive).toBeTruthy()

    // and not active next month (35 days)
    isActive = await subscriptions.isSubscriptionActive(subscription, new Date(new Date().getTime() + 1000 * 3600 * 24 * 35))
    expect(isActive).toBeFalsy()
})