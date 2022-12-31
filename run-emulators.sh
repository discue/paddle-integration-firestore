#!/bin/bash

export NODE_ENV=
export FIRESTORE_EMULATOR_HOST=localhost:11111

if [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ] || [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
    # if running on windows make sure emulators are stopped before running them again
    ./kill-emulator.sh
fi

npm run emulators