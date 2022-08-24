module.exports = {
    "type": "object",
    "title": "Subscription Payment Failed",
    "description": "Identify this event with the HTTP POST parameter `alert_name` with a value of `subscription_payment_failed`",
    "properties": {
        "alert_name": {
            "type": "string",
            "default": "subscription_payment_failed"
        },
        "alert_id": {
            "type": "string",
            "title": "Alert ID",
            "description": "The unique identifier for this Paddle webhook alert. Integer value sent as a string.",
            "pattern": "\\d+"
        },
        "amount": {
            "type": "string",
            "description": "The amount that we tried to charge for this payment. Decimal value sent as a string.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "cancel_url": {
            "type": "string",
            "title": "Cancel URL",
            "description": "A URL of the 'Cancel Subscription' page. [See this documentation](/guides/how-tos/subscriptions/cancel-and-pause#cancel-subscription-url) on cancelation URLs. You should store this URL along with the subscribed customer in your database.",
            "format": "uri",
            "maxLength": 200
        },
        "checkout_id": {
            "type": "string",
            "title": "Checkout ID",
            "description": "The checkout id of the order created.",
            "example": "27835673-chre93c81118fc7-b3092639c1"
        },
        "currency": {
            "type": "string",
            "title": "Currency",
            "description": "The three-letter ISO currency code. Eg: `USD`, `GBP`. See [Supported Currencies](/reference/platform-parameters/supported-currencies).",
            "pattern": "[A-Z]{3}"
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
        "marketing_consent": {
            "type": "integer",
            "title": "Marketing Consent",
            "description": "The value of this field `0` or `1` indicates whether the user has agreed to receive marketing messages from the vendor.",
            "enum": [
                0,
                1
            ]
        },
        "next_retry_date": {
            "type": "string",
            "description": "The date that we will next try to process this failed payment.",
            "format": "date",
            "pattern": "^\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])$"
        },
        "passthrough": {
            "type": "string",
            "title": "Passthrough",
            "description": "This field contains any values that you passed into the checkout using the `passthrough` parameter. See the [Pass Parameters documentation](/guides/how-tos/checkout/pass-parameters#sending-additional-user-data) for more information.",
            "maxLength": 1000
        },
        "quantity": {
            "type": "string",
            "title": "Quantity",
            "description": "The number of products or subscription seats sold in the transaction.",
            "pattern": "\\d+"
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
        "update_url": {
            "type": "string",
            "title": "Update URL",
            "description": "A URL of the ‘Update Payment Details’ page. [See this documentation](/guides/how-tos/subscriptions/update-payment-details#update-payment-details-url) on update URLs. You should store this URL along with the subscribed customer in your database.",
            "format": "uri",
            "maxLength": 200
        },
        "subscription_payment_id": {
            "type": "string",
            "title": "Subscription Payment ID",
            "description": "The unique ID of the subscription payment.",
            "pattern": "\\d+"
        },
        "instalments": {
            "type": "string",
            "title": "Instalments",
            "description": "Number of payments made to date, starting from `1` for the customer's first payment. Integer sent as string.",
            "pattern": "\\d+"
        },
        "order_id": {
            "type": "string",
            "title": "Order ID",
            "description": "The Paddle Order ID for this payment. This can be used to look up the order within your Seller Dashboard.",
            "pattern": "^\\d+(-\\d+)?"
        },
        "user_id": {
            "type": "string",
            "title": "User ID",
            "description": "The customer user id.",
            "pattern": "\\d+"
        },
        "attempt_number": {
            "type": "string",
            "description": "Number of failed payment attempts made so far for this instalment. This number will reset back to 1 if the “Reset Attempts” button in the subscription management page is clicked.",
            "pattern": "\\d+"
        },
        "p_signature": {
            "type": "string",
            "title": "P Signature",
            "description": "This field contains an encrypted token that you can use to verify the request authenticity. See [Verifying Webhooks](/webhook-reference/verifying-webhooks)."
        }
    }
}