module.exports = {
    "type": "object",
    "title": "Subscription Payment Succeeded",
    "description": "Identify this event with the HTTP POST parameter `alert_name` with a value of `subscription_payment_succeeded`",
    "properties": {
        "alert_name": {
            "type": "string",
            "default": "subscription_payment_succeeded"
        },
        "alert_id": {
            "type": "string",
            "title": "Alert ID",
            "description": "The unique identifier for this Paddle webhook alert. Integer value sent as a string.",
            "pattern": "\\d+"
        },
        "balance_currency": {
            "type": "string",
            "title": "Balance Currency",
            "description": "The three letter ISO currency code of the vendor’s default currency at the time of the transaction. Eg: `USD`, `GBP`.",
            "pattern": "[A-Z]{3}"
        },
        "balance_earnings": {
            "type": "string",
            "description": "The amount of revenue added to the vendor’s balance as a result of this payment, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_fee": {
            "type": "string",
            "description": "The fee amount taken from the vendor, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_gross": {
            "type": "string",
            "description": "The total amount received from the customer as a result of the payment, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_tax": {
            "type": "string",
            "description": "The amount of tax received from the customer, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "checkout_id": {
            "type": "string",
            "title": "Checkout ID",
            "description": "The checkout id of the order created.",
            "example": "27835673-chre93c81118fc7-b3092639c1"
        },
        "country": {
            "type": "string",
            "title": "Country",
            "description": "The two-letter ISO country code of the customer. Eg: `US`, `GB`. See [Supported Countries](/reference/platform-parameters/supported-countries).",
            "pattern": "[A-Z]{2}"
        },
        "coupon": {
            "type": "string",
            "title": "Coupon",
            "description": "The coupon code that was used on this order",
            "minLength": 5,
            "maxLength": 300
        },
        "currency": {
            "type": "string",
            "title": "Currency",
            "description": "The three-letter ISO currency code. Eg: `USD`, `GBP`. See [Supported Currencies](/reference/platform-parameters/supported-currencies).",
            "pattern": "[A-Z]{3}"
        },
        "customer_name": {
            "title": "Customer Name",
            "description": "The name of the customer. For card payments, this will return the cardholder name entered by the buyer during the checkout. For PayPal payments, this will return the name from the PayPal account used during the checkout. For all other payment methods where the name is not collected (including Apple Pay and Wire Transfer), this will be empty.",
            "type": "string"
        },
        "earnings": {
            "type": "string",
            "description": "The total amount (after taxes and fees) you earned from this payment.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "email": {
            "type": "string",
            "title": "Email",
            "description": "The email address of the customer.",
            "format": "email"
        },
        "event_time": {
            "type": "string",
            "title": "Event Time",
            "description": "The date and time the event was triggered in UTC (Coordinated Universal Time).",
            "format": "date-time",
            "pattern": "[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]"
        },
        "fee": {
            "type": "string",
            "description": "The total amount in Paddle fees for this payment.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "initial_payment": {
            "type": "integer",
            "title": "Initial Payment",
            "description": "The value of this field `0` or `1` indicates whether it is the customer’s first payment for this subscription.",
            "enum": [
                0,
                1
            ]
        },
        "instalments": {
            "type": "string",
            "title": "Instalments",
            "description": "Number of payments made to date, starting from `1` for the customer's first payment. Integer sent as string.",
            "pattern": "\\d+"
        },
        "marketing_consent": {
            "type": "integer",
            "title": "Marketing Consent",
            "description": "The value of this field `0` or `1` indicates whether the user has agreed to receive marketing messages from the vendor.",
            "enum": [
                0,
                1
            ]
        },
        "next_bill_date": {
            "type": "string",
            "title": "Next Bill Date",
            "description": "The date the next payment is due on this subscription.",
            "format": "date",
            "pattern": "^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$"
        },
        "next_payment_amount": {
            "type": "string",
            "description": "The total amount that the customer will be charged for on their upcoming payment, in the subscription’s currency.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "order_id": {
            "type": "string",
            "title": "Order ID",
            "description": "The Paddle Order ID for this payment. This can be used to look up the order within your Seller Dashboard.",
            "pattern": "^\\d+(-\\d+)?"
        },
        "passthrough": {
            "type": "string",
            "title": "Passthrough",
            "description": "This field contains any values that you passed into the checkout using the `passthrough` parameter. See the [Pass Parameters documentation](/guides/how-tos/checkout/pass-parameters#sending-additional-user-data) for more information.",
            "maxLength": 1000
        },
        "payment_method": {
            "type": "string",
            "title": "Subscription Payment Method",
            "description": "Payment method used to make the transaction.",
            "enum": [
                "card",
                "paypal"
            ]
        },
        "payment_tax": {
            "type": "string",
            "description": "Amount of tax paid as a result of this payment.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "plan_name": {
            "type": "string",
            "description": "Subscription plan name."
        },
        "quantity": {
            "type": "string",
            "title": "Quantity",
            "description": "The number of products or subscription seats sold in the transaction.",
            "pattern": "\\d+"
        },
        "receipt_url": {
            "type": "string",
            "description": "URL containing the customer receipt.",
            "format": "uri"
        },
        "sale_gross": {
            "type": "string",
            "description": "The total amount the customer was charged for this payment. Decimal sent as string.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "status": {
            "type": "string",
            "title": "Status",
            "description": "This is the current status of the subscription. A list of possible values and their meanings can be found under [Event Statuses](/reference/platform-parameters/event-statuses).",
            "enum": [
                "active",
                "trialing",
                "past_due",
                "paused",
                "deleted"
            ]
        },
        "subscription_id": {
            "type": "string",
            "title": "Subscription ID",
            "description": "This is the unique Subscription ID for this customer’s subscription. You should store this with the customer in your database, as it is needed for making API calls.",
            "pattern": "\\d+"
        },
        "subscription_payment_id": {
            "type": "string",
            "title": "Subscription Payment ID",
            "description": "The unique ID of the subscription payment.",
            "pattern": "\\d+"
        },
        "subscription_plan_id": {
            "type": "string",
            "title": "Subscription Plan ID",
            "description": "The ID of the Subscription Plan the customer is subscribed to. (This is the value that will change upon plan change).",
            "pattern": "\\d+"
        },
        "unit_price": {
            "type": "string",
            "title": "Unit Price",
            "description": "The price per unit of the subscription.",
            "pattern": "(\\d+\\.\\d{1,2})"
        },
        "user_id": {
            "type": "string",
            "title": "User ID",
            "description": "The customer user id.",
            "pattern": "\\d+"
        },
        "p_signature": {
            "type": "string",
            "title": "P Signature",
            "description": "This field contains an encrypted token that you can use to verify the request authenticity. See [Verifying Webhooks](/webhook-reference/verifying-webhooks)."
        }
    }
}