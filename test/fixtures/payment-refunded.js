module.exports = {
    "type": "object",
    "title": "Subscription Payment Refunded",
    "description": "Identify this event with the HTTP POST parameter `alert_name` with a value of `subscription_payment_refunded`",
    "properties": {
        "alert_name": {
            "type": "string",
            "default": "subscription_payment_refunded"
        },
        "alert_id": {
            "type": "string",
            "title": "Alert ID",
            "description": "The unique identifier for this Paddle webhook alert. Integer value sent as a string.",
            "pattern": "\\d+"
        },
        "amount": {
            "type": "string",
            "description": "The amount refunded, partial refunds are possible. Decimal value sent as a string.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_currency": {
            "type": "string",
            "title": "Balance Currency",
            "description": "The three letter ISO currency code of the vendor’s default currency at the time of the transaction. Eg: `USD`, `GBP`.",
            "pattern": "[A-Z]{3}"
        },
        "balance_earnings_decrease": {
            "type": "string",
            "title": "Balance Earnings Decrease",
            "description": "The amount of revenue taken from the vendor’s balance as a result of this refund, in the vendor’s `balance_currency` at the time of the transaction. It returns a positive or negative value. Eg: If you issue a VAT-only refund, this will increase the vendor’s earnings instead of decreasing it, to reflect this we use a negative value. Please also note that if the earnings of the order being refunded are being split between vendors, the earnings decrease amount will not include the other vendor’s fee, only yours. (eg. If you are giving 15% of your earnings to another vendor and keeping 85%, your balance earnings will be reduced only by 85%).",
            "pattern": "^-?\\d+(\\.\\d{1,2})?$"
        },
        "balance_fee_refund": {
            "type": "string",
            "title": "Balance Fee Refund",
            "description": "The fee amount returned to the vendor, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_gross_refund": {
            "type": "string",
            "title": "Balance Gross Refund",
            "description": "The total amount returned to the customer as a result of this refund, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "balance_tax_refund": {
            "type": "string",
            "title": "Balance Tax Refund",
            "description": "The amount of tax returned to the customer, in the vendor’s `balance_currency` at the time of the transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
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
        "earnings_decrease": {
            "type": "string",
            "title": "Earnings Decrease",
            "description": "The amount of revenue taken from the vendor’s earnings as a result of this refund, in the currency of the original transaction. It returns a positive or negative value. E.g: if you issue a VAT-only refund, this will increase the vendor’s earnings instead of decreasing it, to reflect this we use a negative value. Please also note that if the earnings of the order being refunded are being split between vendors, the earnings decrease amount will not include the other vendor’s fee, only yours: for example if you are giving 15% of your earnings to another vendor and keeping 85%, your balance earnings will only be reduced by 85%. ",
            "pattern": "^-?\\d+(\\.\\d{1,2})?$"
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
        "fee_refund": {
            "type": "string",
            "title": "Fee Refund",
            "description": "The fee amount returned to the vendor, in the currency of the original transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
        },
        "gross_refund": {
            "type": "string",
            "title": "Gross Refund",
            "description": "The total amount returned to the customer as a result of this refund, in the currency of the original transaction. ",
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
        "quantity": {
            "type": "string",
            "title": "Quantity",
            "description": "The number of products or subscription seats sold in the transaction.",
            "pattern": "\\d+"
        },
        "refund_reason": {
            "type": "string",
            "title": "Refund Reason",
            "description": "Refund reason note."
        },
        "refund_type": {
            "type": "string",
            "title": "Refund Type",
            "description": "The type of refund.",
            "enum": [
                "full",
                "vat",
                "partial"
            ]
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
        "tax_refund": {
            "type": "string",
            "title": "Tax Refund",
            "description": "The amount of tax returned to the customer, in the currency of the original transaction.",
            "pattern": "^\\d+(\\.\\d{1,2})?$"
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