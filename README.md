
<p align="center">
<a href="https://www.discue.io/" target="_blank" rel="noopener noreferrer"><img width="128" src="https://www.discue.io/icons-fire-no-badge-square/web/icon-192.png" alt="Vue logo">
</a>
</p>

<br/>
<div align="center">

[![GitHub tag](https://img.shields.io/github/tag/discue/paddle-integration-firestore?include_prereleases=&sort=semver&color=blue)](https://github.com/discue/paddle-integration-firestore/releases/)
[![Latest Stable Version](https://img.shields.io/npm/v/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
[![License](https://img.shields.io/npm/l/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
<br/>
[![NPM Downloads](https://img.shields.io/npm/dt/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
[![NPM Downloads](https://img.shields.io/npm/dm/@discue/paddle-integration-firestore.svg)](https://www.npmjs.com/package/@discue/paddle-integration-firestore)
<br/>
[![contributions - welcome](https://img.shields.io/badge/contributions-welcome-blue)](/CONTRIBUTING.md "Go to contributions doc")
[![Made with Node.js](https://img.shields.io/badge/Node.js->=12-blue?logo=node.js&logoColor=white)](https://nodejs.org "Go to Node.js homepage")

</div>

# paddle-integration-firestore

[paddle.com](https://www.paddle.com/) payments integration for [Google Cloud Firestore](https://cloud.google.com/firestore).

## Installation
```bash
npm install @discue/paddle-integration-firestore
```

## Usage
Can be used like any old [ExpressJS](https://expressjs.com/) [middleware](https://expressjs.com/en/guide/using-middleware.html). 

The library as a whole can be used with CommonJS and ES6.

```js
'use strict'

const express = require('express')
const app = express()

const { bodyparser, middleware, Subscriptions } = require('../lib/index')
const subscriptions = new Subscriptions('subscriptions')

const port = process.env.PORT || 3456

app.use('/_/payments', bodyparser())
app.post('/_/payments', middleware(subscriptions))

const server = app.listen(port)

module.exports = server
```

## Run Tests

To run tests, run the following command

```bash
./test.sh
```

## License

[MIT](https://choosealicense.com/licenses/mit/)

