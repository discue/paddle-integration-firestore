'use strict'

const uuid = require('crypto').randomUUID

const subscriptionCreated = require('../fixtures/subscription-created')
const subscriptionCancelled = require('../fixtures/subscription-cancelled')
const subscriptionUpdated = require('../fixtures/subscription-updated')

const paddleIntegration = require('../../lib/index')

const { expect } = require('chai')

describe('PaddleIntegration', () => {

    describe('.addSubscription', () => {
        it('creates a new subscription', async () => {
            const id = uuid()
            await paddleIntegration.addSubscription(id, subscriptionCreated)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })
    })

    describe('.updateSubscription', () => {
        it('updates a subscription', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const payload = Object.assign({}, subscriptionUpdated, { subscription_id: subscriptionId })
            await paddleIntegration.updateSubscription(payload)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })
    })

    describe('.cancelSubscription', () => {
        it('cancels a subscription', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const payload = Object.assign({}, subscriptionCancelled, { subscription_id: subscriptionId, cancellation_effective_date: new Date(new Date().getTime() - 1000).toISOString() })
            await paddleIntegration.cancelSubscription(payload)
            const isActive = await paddleIntegration.hasActiveSubscription(id, [payload.subscription_plan_id])
            expect(isActive).to.be.false
        })
    })

    describe('.hasActiveSubscription', () => {
        it('returns true if one active subscription with given plan id was found', async () => {
            const id = uuid()

            const subscriptionId = uuid()
            const createPayload = Object.assign({}, subscriptionCreated, { subscription_id: subscriptionId })
            await paddleIntegration.addSubscription(id, createPayload)

            const isActive = await paddleIntegration.hasActiveSubscription(id, [1, 2, 3, subscriptionCreated.subscription_plan_id])
            expect(isActive).to.be.true
        })

        it('returns false if no subscription was found', async () => {
            const isActive = await paddleIntegration.hasActiveSubscription('zero', ['9'])
            expect(isActive).to.be.false
        })

        it('ignore subscriptions with other ids', async () => {
            const id1 = uuid()
            const id2 = uuid()

            const payloadSubscription1 = Object.assign({}, subscriptionCreated, { subscription_id: id1, subscription_plan_id: 1 })
            const payloadSubscription2 = Object.assign({}, subscriptionCreated, { subscription_id: id2 })

            await paddleIntegration.addSubscription('userId', payloadSubscription1)
            await paddleIntegration.addSubscription('userId', payloadSubscription2)

            const cancelSubscription1 = Object.assign({}, subscriptionCancelled, { subscription_id: id1, subscription_plan_id: 1 })
            await paddleIntegration.cancelSubscription(cancelSubscription1)

            const isSubscription1Active = await paddleIntegration.hasActiveSubscription('userId', ['1'])
            expect(isSubscription1Active).to.be.false

            const isSubscription2Active = await paddleIntegration.hasActiveSubscription('userId', ['8'])
            expect(isSubscription2Active).to.be.true
        })
    })
})