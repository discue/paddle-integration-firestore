#!/bin/bash

function kill() {
    local port=$1
    process="$(netstat -ano | grep $port | grep -m 1 LISTENING | awk '{print $5}')"
    [ ! -z "$process" ] && powershell kill $process
}

kill 3333 # liveness test server
kill 3456 # hook server
kill 4000 # emulator ui
kill 5001 # functions
kill 8085 # pubsub
kill 9099 # auth
kill 11111 # firestore

# kill the probably still open pub sub terminal
powershell "Get-Process | Where-Object {\$_.mainWindowTitle -match 'pubsub'} | Stop-Process -force"