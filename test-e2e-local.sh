#!/bin/bash

source ./.test.env.local

AUTH_CODE=$AUTH_CODE VENDOR_ID=$VENDOR_ID ./test-e2e.sh