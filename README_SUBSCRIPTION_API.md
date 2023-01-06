# Subscriptions API
Low level wrapper for Paddle API. 

- [Subscriptions API](#subscriptions-api)
  - [Creating a new instance](#creating-a-new-instance)
    - [Example](#example)
  - [Checkout API](#checkout-api)
    - [Get order details](#get-order-details)
  - [Subscription API](#subscription-api)
    - [Get a subscription](#get-a-subscription)
    - [List all subscriptions](#list-all-subscriptions)
    - [Get subscription plan](#get-subscription-plan)
    - [List all subscription plans](#list-all-subscription-plans)
    - [List all subscription payments](#list-all-subscription-payments)
    - [Update subscription plan](#update-subscription-plan)
    - [Update subscription post code](#update-subscription-post-code)
    - [Cancel subscription](#cancel-subscription)
  - [Product API](#product-api)
    - [List products](#list-products)
    - [Refund a payment](#refund-a-payment)

:information_source: The API component will be loaded asynchronously to preserve backwards compatibility with commonjs. This is achieved by returning a proxy for the entire `paddle-integration-firestore` module. The reactivity a proxy provides allows us to add the API module then at a later point to the module instance. The drawback is, we do not return named exports and, therefore, cannot not enable destructuring in ES modules.

## Creating a new instance
To create a new instance, four parameters need to be passed to the constructor:

1. `authCode: string` - Your personal authentication code for paddle.com API. Read [this]([https://](https://developer.paddle.com/api-reference/ZG9jOjI1MzUzOTg5-api-authentication)) to find out, how to generate your authentication code. 
2. `vendorId: string` - Your personal vendor id for paddle.com. This value is public information. Read [this](https://developer.paddle.com/getting-started/119e7d050f2be-gather-checkout-details) to find out, where to find your vendor id. 
3. `useSandbox: boolean=false` - Defines, whether the production or sandbox (non-production) endpoints of paddle.com API should be used. Per default defaults to **production**.
4. `logRequests: boolean=false` - Defines, whether requests to paddle.com API will be logged to `stdout`

### Example
```js
'use strict'

const paddleIntegration = require('@discue/paddle-firebase-integration')
const paddleApi = new paddleIntegration.Api({ 
        useSandbox: true, 
        authCode: process.env.AUTH_CODE, 
        vendorId: process.env.VENDOR_ID 
    })
```

## Checkout API
### Get order details
```js
const order = await paddleApi.getOrder({ checkout_id: 54321 })
// {
//   "state": "processed",
//   "checkout": {
//     "checkout_id": "219233-chre53d41f940e0-58aqh94971",
//     "image_url": "https://paddle.s3.amazonaws.com/user/91/XWsPdfmISG6W5fgX5t5C_icon.png",
//     "title": "My Product"
//   },
//   "lockers": [
//     {
//       "download": "https://mysite.com/download/my-app",
//       "instructions": "Simply enter your license code and click 'Activate'.",
//       "license_code": "ABC-123",
//       "locker_id": 1127139,
//       "product_id": 514032,
//       "product_name": "My Product Name"
//     }
//   ],
//   "order": {
//     "access_management": {
//       "software_key": []
//     },
//     "completed": {
//       "date": "2019-08-01 21:24:35.000000",
//       "timezone": "UTC",
//       "timezone_type": 3
//     },
//     "coupon_code": "EXAMPLE10",
//     "currency": "GBP",
//     "customer": {
//       "email": "example@paddle.com",
//       "marketing_consent": true
//     },
//     "customer_success_redirect_url": "",
//     "formatted_tax": "£1.73",
//     "formatted_total": "£9.99",
//     "has_locker": true,
//     "is_subscription": false,
//     "order_id": 123456,
//     "quantity": 1,
//     "receipt_url": "https://my.paddle.com/receipt/826289/3219233-chre53d41f940e0-58aqh94971",
//     "total": "9.99",
//     "total_tax": "1.73"
//   }
// }
```

[API reference](https://developer.paddle.com/api-reference/fea392d1e2f4f-get-order-details)

## Subscription API
### Get a subscription
```js
const subscription = await paddleApi.getSubscription({ subscription_id = 'abc123' })
// [
//    {
//      "subscription_id": 502198,
//      "plan_id": 496199,
//      "user_id": 285846,
//      "user_email": "name@example.com",
//      "marketing_consent": true,
//      "update_url": "https://subscription-management.paddle.com/subscription/87654321/hash/eyJpdiI6IlU0Nk5cL1JZeHQyTXd.../update",
//      "cancel_url": "https://subscription-management.paddle.com/subscription/87654321/hash/eyJpdiI6IlU0Nk5cL1JZeHQyTXd.../cancel",
//      "state": "active",
//      "signup_date": "2015-10-06 09:44:23",
//      "last_payment": {
//        "amount": 5,
//        "currency": "USD",
//        "date": "2015-10-06"
//      },
//      "payment_information": {
//        "payment_method": "card",
//        "card_type": "visa",
//        "last_four_digits": "1111",
//        "expiry_date": "02/2020"
//      },
//      "quantity": 3,
//      "next_payment": {
//        "amount": 10,
//        "currency": "USD",
//        "date": "2015-11-06"
//      }
//    }
//  ]
```

[API reference](https://developer.paddle.com/api-reference/e33e0a714a05d-list-users)

### List all subscriptions
```js
const subscriptions = await paddleApi.listSubscriptions()
//  [
//    {
//      "subscription_id": 502198,
//      "plan_id": 496199,
//      "user_id": 285846,
//      "user_email": "name@example.com",
//      "marketing_consent": true,
//      "update_url": "https://subscription-management.paddle.com/subscription/87654321/hash/eyJpdiI6IlU0Nk5cL1JZeHQyTXd.../update",
//      "cancel_url": "https://subscription-management.paddle.com/subscription/87654321/hash/eyJpdiI6IlU0Nk5cL1JZeHQyTXd.../cancel",
//      "state": "active",
//      "signup_date": "2015-10-06 09:44:23",
//      "last_payment": {
//        "amount": 5,
//        "currency": "USD",
//        "date": "2015-10-06"
//      },
//      "payment_information": {
//        "payment_method": "card",
//        "card_type": "visa",
//        "last_four_digits": "1111",
//        "expiry_date": "02/2020"
//      },
//      "quantity": 3,
//      "next_payment": {
//        "amount": 10,
//        "currency": "USD",
//        "date": "2015-11-06"
//      }
//    }
//  ]
```

[API reference](https://developer.paddle.com/api-reference/e33e0a714a05d-list-users)

### Get subscription plan
```js
const plan = await paddleApi.getPlan({ subscription_plan_id: 7443 })
// [
//   {
//      "id": 496197,
//      "name": "My App: Basic",
//      "billing_type": "month",
//      "billing_period": 1,
//      "initial_price": {
//         "USD": "0.00"
//       },
//       "recurring_price": {
//         "USD": "5.000"
//       },
//       "trial_days": 7
//   }
// ]
```

[API reference](https://developer.paddle.com/api-reference/a835554495295-list-plans)

### List all subscription plans
```js
const plans = await paddleApi.listPlans()
// [
//   {
//      "id": 496197,
//      "name": "My App: Basic",
//      "billing_type": "month",
//      "billing_period": 1,
//      "initial_price": {
//         "USD": "0.00"
//       },
//       "recurring_price": {
//         "USD": "5.000"
//       },
//       "trial_days": 7
//   }
// ]
```

[API reference](https://developer.paddle.com/api-reference/a835554495295-list-plans)

### List all subscription payments
```js
const plans = await paddleApi.getSubscriptionPayments({ subscription_id: 12345 }, { plan: 4815, from: '2022-04-01', to: '2023-01-01' })
// [
//   {
//     "id": 8936,
//     "subscription_id": 2746,
//     "amount": 1,
//     "currency": "USD",
//     "payout_date": "2015-10-15",
//     "is_paid": 0,
//     "is_one_off_charge": false,
//     "receipt_url": "https://my.paddle.com/receipt/469214-8936/1940881-chrea0eb34164b5-f0d6553bdf"
//   }
// ]
```

[API reference](https://developer.paddle.com/api-reference/80462f27b2011-list-payments)


### Update subscription plan
```js
const update = await paddleApi.updateSubscriptionPlan({ subscription_id: 12345 }, 525123)
// {
//    "subscription_id": 12345,
//    "user_id": 425123,
//    "plan_id": 525123,
//    "next_payment": {
//       "amount": 144.06,
//       "currency": "GBP",
//       "date": "2018-02-15"
//    }
// }
```

### Update subscription post code
```js
const update = await paddleApi.updatePostcode({ subscription_id: 12345 }, 525123)
// {
//   "subscription_id": 12345,
//   "postcode": "525123"
// }
```

### Cancel subscription
```js
const update = await paddleApi.cancelSubscription({ subscription_id: 12345 }, 525123)
// true
```

## Product API
### List products
```js
const products = await paddleApi.listProducts()
// {
//   "total": 2,
//   "count": 2,
//   "products": [
//     {
//       "id": 489171,
//       "name": "A Product",
//       "description": "A description of the product.",
//       "base_price": 58,
//       "sale_price": null,
//       "currency": "USD",
//       "screenshots": [],
//       "icon": "https://paddle-static.s3.amazonaws.com/email/2013-04-10/og.png"
//     },
//     {
//       "id": 489278,
//       "name": "Another Product",
//       "description": null,
//       "base_price": 39.99,
//       "sale_price": null,
//       "currency": "GBP",
//       "screenshots": [],
//       "icon": "https://paddle.s3.amazonaws.com/user/91/489278geekbench.png"
//     }
//   ]
// }
```

[API reference](https://developer.paddle.com/api-reference/0f31bd7cbce47-list-products)

### Refund a payment
```js
const refund = await paddleApi.refundFullPayment({ order_id: 54321 })
//  {
//    "refund_request_id": 12345
//  }
```

[API reference](https://developer.paddle.com/api-reference/a46e727d18db9-refund-payment)