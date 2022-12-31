#!/bin/bash

export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIRESTORE_EMULATOR_HOST=localhost:11111
export FIREBASE_CONFIG='{ "projectId": "discue-io-dev", "storageBucket": "discue-io-dev.appspot.com" }'
export NODE_ENV='ci'

npm run test