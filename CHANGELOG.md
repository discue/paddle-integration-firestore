# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.20.0](https://github.com/discue/paddle-integration-firestore/compare/v0.19.0...v0.20.0) (2023-01-08)


### Features

* **subscription-hydration:** require plan id instead of subscription id param ([9e2f32a](https://github.com/discue/paddle-integration-firestore/commit/9e2f32af33666606e993a4e53d3a40f057d25b0d))
* **subscription-info:** add find subscription id method ([a6db41e](https://github.com/discue/paddle-integration-firestore/commit/a6db41e8a96a0aa9b9e12ea223072f8446b3e85d))


### Refactorings

* **subscription-hooks:** do not flatten objects ([d7d5bac](https://github.com/discue/paddle-integration-firestore/commit/d7d5bac09cbdb5c4d2d7d2cacd64a5ff810430a9))
* **subscription-hooks:** return promise instead of waiting it ([95be565](https://github.com/discue/paddle-integration-firestore/commit/95be565eda4c1e4dacabc41067323d9c29374186))


### Chores

* remove unused flatten component ([6ace030](https://github.com/discue/paddle-integration-firestore/commit/6ace0304c6840310d97f1b8e694555c10d60fc2e))
* **subscription-hooks:** add resource name property ([4b39dd4](https://github.com/discue/paddle-integration-firestore/commit/4b39dd47d60c63ca87fe5dbc583aebac49d72cd6))
* **subscription-hydration:** hide private instance properties ([b39c13d](https://github.com/discue/paddle-integration-firestore/commit/b39c13dc90f8d455e7c11a83dea66d1938e07b51))
* **subscription-info:** update constructor jsdoc ([e466977](https://github.com/discue/paddle-integration-firestore/commit/e4669776bbf233e0f464ded887a3e972695895e1))

## [0.19.0](https://github.com/discue/paddle-integration-firestore/compare/v0.18.0...v0.19.0) (2023-01-07)


### Features

* **api:** add get subscription payments method ([8e7a294](https://github.com/discue/paddle-integration-firestore/commit/8e7a2944e96fd4d3170a7509c21bec117a77f8a3))
* **subscription-hydration:** also hydrate payments ([c6c254c](https://github.com/discue/paddle-integration-firestore/commit/c6c254cffc933fb706288e0cb6e44904dc992096))
* **subscription-hydration:** check if plan already active ([fd4ed5d](https://github.com/discue/paddle-integration-firestore/commit/fd4ed5d9f945c37a19cedc05dbfa130d8d765a4f))
* **subscription-hydration:** set effective cancellation date based on last payment ([85cfd3b](https://github.com/discue/paddle-integration-firestore/commit/85cfd3bd19b3aa7b9ff20705c1d26638d4640b72))


### Bug Fixes

* **html-encoder:** do not encode value false ([5ad8987](https://github.com/discue/paddle-integration-firestore/commit/5ad8987ca279d816995b23d4d9fc40800c1e4488))


### Refactorings

* promote subscription hydration to own component ([9d3436b](https://github.com/discue/paddle-integration-firestore/commit/9d3436b8a8662c8d4d98ecb23222c03cec782688))
* use singular for main component exports ([2ccd3c9](https://github.com/discue/paddle-integration-firestore/commit/2ccd3c9b968ea5f4a6d579a41dc71d5c1fa47f9b))


### Chores

* add order details callback ([e9de247](https://github.com/discue/paddle-integration-firestore/commit/e9de2474875b48f810afdefabb11bf53052a6cdc))
* **subscription-hydration:** do not require checkout id ([50baca2](https://github.com/discue/paddle-integration-firestore/commit/50baca2f24562ab7b8d97ed4cab8798cee0c7e14))

## [0.18.0](https://github.com/discue/paddle-integration-firestore/compare/v0.17.0...v0.18.0) (2023-01-03)


### Features

* **api:** add get plan by id method ([a700319](https://github.com/discue/paddle-integration-firestore/commit/a70031941027a96f5119e17a84d793e7b9a820d2))
* **middleware:** emit events after successful hook processing ([4764578](https://github.com/discue/paddle-integration-firestore/commit/4764578905776f33637f9462cae91578d217068d))
* **subscription-info:** expect object or resource ids ([4df224b](https://github.com/discue/paddle-integration-firestore/commit/4df224bfe2b50418753cdccd8726cbf64a331f3f))


### Bug Fixes

* **subscription-info:** return subscription and not parent object ([f184ad7](https://github.com/discue/paddle-integration-firestore/commit/f184ad708b0afae399f17b89e3554c9966c32c0f))


### Chores

* **deps-dev:** bump eslint from 8.30.0 to 8.31.0 ([8750ddf](https://github.com/discue/paddle-integration-firestore/commit/8750ddfd04db771fa37289ed2c6cc3137de8fa5b))
* **deps:** bump actions/stale from 6 to 7 ([f89f55b](https://github.com/discue/paddle-integration-firestore/commit/f89f55b7f8421afe1ae8b592dbf7f85a62ad2f61))
* **deps:** update dependencies ([523ca9e](https://github.com/discue/paddle-integration-firestore/commit/523ca9ed2c505e27faf18d1ce850a728864aa39f))
* do not source hidden env file ([891c5e0](https://github.com/discue/paddle-integration-firestore/commit/891c5e05121c292f8cf33e5dbcb903272ccab342))
* **firebase:** prevent port collisions ([e49452a](https://github.com/discue/paddle-integration-firestore/commit/e49452a22dbf997db50a81dd75504deed31e3658))
* fix type on description ([fc6132d](https://github.com/discue/paddle-integration-firestore/commit/fc6132d8495435b185f8fb00bf6e61c7cbeeb436))

## [0.17.0](https://github.com/discue/paddle-integration-firestore/compare/v0.16.0...v0.17.0) (2022-12-24)


### Features

* add jsdoc to main export to enable typings ([2143b3c](https://github.com/discue/paddle-integration-firestore/commit/2143b3c76536682860b2255fd5c44940f179a95a))


### Chores

* update module  name in logger ([3c6df94](https://github.com/discue/paddle-integration-firestore/commit/3c6df9406aeddc820eaf30cae66f8e7b8e8b62b1))

## [0.16.0](https://github.com/discue/paddle-integration-firestore/compare/v0.15.1...v0.16.0) (2022-12-10)


### Features

* allow logging of outgoing requests ([4f4bde3](https://github.com/discue/paddle-integration-firestore/commit/4f4bde312377b91cf9d5903bb56d0ff6b7142182))


### Bug Fixes

* **middleware:** handle of failed and refunded payments ([9045cf0](https://github.com/discue/paddle-integration-firestore/commit/9045cf058daca17eedb7f62cff4ddbc5191bcfc4))


### Chores

* add simple logger ([3dc4b94](https://github.com/discue/paddle-integration-firestore/commit/3dc4b94195643594650f4f3fdac9c2bc8bd933cd))
* **deps-dev:** bump @playwright/test from 1.28.0 to 1.28.1 ([83fb530](https://github.com/discue/paddle-integration-firestore/commit/83fb53086f7bab2410a0214c46742cd071831300))
* **deps-dev:** bump chai from 4.3.6 to 4.3.7 ([8dd28d7](https://github.com/discue/paddle-integration-firestore/commit/8dd28d74fafec85510efa6093d5eaaa1cba4475a))
* **deps-dev:** bump express from 4.18.1 to 4.18.2 ([548740f](https://github.com/discue/paddle-integration-firestore/commit/548740f003d31f284fb4abb11efd144e5b028748))
* **deps-dev:** bump mocha from 10.0.0 to 10.1.0 ([bf95f5b](https://github.com/discue/paddle-integration-firestore/commit/bf95f5b4eeb22558d9bd25ea40f262ade843c754))
* **deps:** bump firebase-admin from 11.2.0 to 11.3.0 ([4b83bfa](https://github.com/discue/paddle-integration-firestore/commit/4b83bfa50a2332a01de610ec4465b4b766e245ec))

### [0.15.1](https://github.com/discue/paddle-integration-firestore/compare/v0.15.0...v0.15.1) (2022-11-27)


### Bug Fixes

* module exports ([e7eb82c](https://github.com/discue/paddle-integration-firestore/commit/e7eb82c7faee28350acd24ed450abd52abbfec64))

## [0.15.0](https://github.com/discue/paddle-integration-firestore/compare/v0.14.0...v0.15.0) (2022-11-27)


### Features

* add client function to create customData objects ([66abf90](https://github.com/discue/paddle-integration-firestore/commit/66abf9042d0d8a685b192b45bf3f93c61e64ff14))
* **api:** add get order method ([8055f97](https://github.com/discue/paddle-integration-firestore/commit/8055f971161f3d8464c90763c5218ccf5eb4e061))
* extract ids from namespaced object ([77542b8](https://github.com/discue/paddle-integration-firestore/commit/77542b8088344f1ae4e39a6f15739ef95bfcb786))
* **subscription-info:** use custom data to verify api client ([4ca8117](https://github.com/discue/paddle-integration-firestore/commit/4ca81173de24563de395e0b3003131dea01b9351))


### Refactorings

* **api:** add api version to path elements ([344a0fa](https://github.com/discue/paddle-integration-firestore/commit/344a0fa0433a6f8af4c0e4fa8b0319ce7997c2a8))
* **api:** create base urls for vendor and checkout api ([a7ad551](https://github.com/discue/paddle-integration-firestore/commit/a7ad551fa8feeb2c59fe43f90a4ffaeededccf54))


### Chores

* **error-handler:** during tests always return 200 ([ac64039](https://github.com/discue/paddle-integration-firestore/commit/ac64039b3c635c13a19c89189642ac16f44ca492))
* **subscription-info:** add logging ([69c7c01](https://github.com/discue/paddle-integration-firestore/commit/69c7c01e6a26e7cd05dc84f36af1ba369be52d73))
* **subscription-info:** delete unused method ([ae2b96b](https://github.com/discue/paddle-integration-firestore/commit/ae2b96b806975bb838b252e279e074d99f23cb0b))

## [0.14.0](https://github.com/discue/paddle-integration-firestore/compare/v0.13.0...v0.14.0) (2022-11-19)


### Features

* **api:** ensure api is always initialized before first request ([de0344c](https://github.com/discue/paddle-integration-firestore/commit/de0344cd33766270adf0ceaee0973564fbc103aa))

## [0.13.0](https://github.com/discue/paddle-integration-firestore/compare/v0.12.0...v0.13.0) (2022-11-17)


### Features

* **api:** add get single subscription method ([606d247](https://github.com/discue/paddle-integration-firestore/commit/606d2471a42f96e27f11a99a368101de3a93be02))
* handle errors in middleware gracefully ([7adeaa2](https://github.com/discue/paddle-integration-firestore/commit/7adeaa2481776a58df5653253c19cd706b527674))
* **subscription-info:** allow hydration of local status ([48aa964](https://github.com/discue/paddle-integration-firestore/commit/48aa9648c0dd58eaee4d2fe3362829972a6b0136))
* **subscription-info:** check whether sub was already hydrated ([dbb2df2](https://github.com/discue/paddle-integration-firestore/commit/dbb2df224fe89a6151f68226720b44debb7fcd30))


### Bug Fixes

* cannot import without es6 ([7700a88](https://github.com/discue/paddle-integration-firestore/commit/7700a88621850f1529ffcccd1672749ba6dd14a5))


### Refactorings

* rename sub not found variable ([6cb69f8](https://github.com/discue/paddle-integration-firestore/commit/6cb69f8e7649b2d5591ae7eedaeaec1ec6e5d534))


### Chores

* add missing whitespace ([7ff0354](https://github.com/discue/paddle-integration-firestore/commit/7ff0354850101bd110cb6f8144f96f8e8b66362e))
* add payloads of client events ([3d069ab](https://github.com/discue/paddle-integration-firestore/commit/3d069abb386175f426e099253b52861c0af4d8c9))
* also kill hook server if necessary ([d796a2f](https://github.com/discue/paddle-integration-firestore/commit/d796a2fc991d08efa78f523920034477b77a7f94))
* **ci:** increase test timeout ([cb9aff0](https://github.com/discue/paddle-integration-firestore/commit/cb9aff081e4d3ca774b71c60bf79234b33b68f21))
* **ci:** use node 16 ([2607bac](https://github.com/discue/paddle-integration-firestore/commit/2607bac46189e8fecb34976716d85ebdccbf56db))
* **deps-dev:** bump eslint from 8.24.0 to 8.26.0 ([f1e1f01](https://github.com/discue/paddle-integration-firestore/commit/f1e1f013414103a8a090f9d2ae95a71a551be8ac))
* **deps-dev:** bump nodemon from 2.0.19 to 2.0.20 ([9b9cfa4](https://github.com/discue/paddle-integration-firestore/commit/9b9cfa46f43113de58ff0ab74fc2e65ccc9ce277))
* **deps-dev:** bump puppeteer from 18.0.5 to 19.2.0 ([f6f215e](https://github.com/discue/paddle-integration-firestore/commit/f6f215ed54e1b9bbe7882f90b85fb4a4172765eb))
* **deps:** bump firebase-admin from 11.0.1 to 11.2.0 ([5d2617f](https://github.com/discue/paddle-integration-firestore/commit/5d2617fcd1d2e1284270e26d3c1d9f9c995027d5))
* **deps:** bump got from 12.5.1 to 12.5.2 ([0f6a15d](https://github.com/discue/paddle-integration-firestore/commit/0f6a15d639e90d632a78c508ba0da0930f328903))
* **deps:** update dependencies ([8d1a9aa](https://github.com/discue/paddle-integration-firestore/commit/8d1a9aa078a8c2ea1619932a42dd19cfcca6d507))
* **hooks:** do not store unit_price ([c5441d5](https://github.com/discue/paddle-integration-firestore/commit/c5441d5a1fa9c62fb9aff661a39530c13756116e))
* log binary and args when starting and stopping ([9566c48](https://github.com/discue/paddle-integration-firestore/commit/9566c4822723cf95665ff40e6f1af240430364df))
* on ci/cd envs return 202 even if not found ([992064e](https://github.com/discue/paddle-integration-firestore/commit/992064e48d5104ee4983182620b6f3e2825f3ff7))
* store also checkout id of cancelled events ([55c88b6](https://github.com/discue/paddle-integration-firestore/commit/55c88b61c6a6349c0d9164f3c47111c9e5bfee60))
* **subscription-info:** require also hook storage instance ([86081b1](https://github.com/discue/paddle-integration-firestore/commit/86081b1b2284162db6475acd6acfee92818fdafd))

## [0.12.0](https://github.com/discue/paddle-integration-firestore/compare/v0.11.0...v0.12.0) (2022-10-13)


### Features

* **api:** add list plans method ([0dcb855](https://github.com/discue/paddle-integration-firestore/commit/0dcb855c12d75469f3ca2d252e03a06683e205bf))
* **api:** add list products method ([03f3327](https://github.com/discue/paddle-integration-firestore/commit/03f33278e641b86ad1b990b397bfb634fd22349c))
* **api:** allow pagination and fetching all subs ([23c4432](https://github.com/discue/paddle-integration-firestore/commit/23c44329709fa69b5fa6577fa8093b2a58b9e655))
* **api:** enable customization of http params ([9780123](https://github.com/discue/paddle-integration-firestore/commit/9780123a1188d9209bfc523b1d941488e575a45b))
* export api constructor too ([7fa7dbe](https://github.com/discue/paddle-integration-firestore/commit/7fa7dbe7afb8470d5d85975bcff03a8fc0f0d26e))


### Chores

* skip tests before release ([3cf108b](https://github.com/discue/paddle-integration-firestore/commit/3cf108bd227c2ece2006cf146812cfa4c774bbf4))

## [0.11.0](https://github.com/discue/paddle-integration-firestore/compare/v0.10.1...v0.11.0) (2022-10-12)


### Features

* **api:** import got only once ([542e40b](https://github.com/discue/paddle-integration-firestore/commit/542e40b1671a9910bfe46fde9e989a253c691c78))
* **subscription-info:** add cancel subscription method ([09656f0](https://github.com/discue/paddle-integration-firestore/commit/09656f04c1f9f48272a700b0000dc11194420f74))
* **subscription-info:** add update subscription plan method ([e19306b](https://github.com/discue/paddle-integration-firestore/commit/e19306b0f353fe32786c0db9fae1e8912b9efdce))
* **subscription-info:** catch and log api errors ([7fa6791](https://github.com/discue/paddle-integration-firestore/commit/7fa67911f46c8be0291c3a6ce44a52cda93d952e))


### Refactorings

* extract get subscription plan id to separate method ([3dc38bf](https://github.com/discue/paddle-integration-firestore/commit/3dc38bf0f3fc1fdfde31ef73d9a9e6626ac5c056))


### Chores

* add jsdoc description to cancel subscription method ([c03b6a8](https://github.com/discue/paddle-integration-firestore/commit/c03b6a8d8f3af5612562181bdfb7c7c8c06560a7))
* update readme ([1fa863e](https://github.com/discue/paddle-integration-firestore/commit/1fa863ee530f4dfcc21139572c1e8aabae88f0c5))

### [0.10.1](https://github.com/discue/paddle-integration-firestore/compare/v0.10.0...v0.10.1) (2022-10-09)


### Bug Fixes

* timestamp not passed to get stard and end dates ([9481284](https://github.com/discue/paddle-integration-firestore/commit/948128446266932959c0b17f835072e0b7ff25d6))

## [0.10.0](https://github.com/discue/paddle-integration-firestore/compare/v0.9.0...v0.10.0) (2022-10-09)


### Features

* return future subscription info too ([68a6b04](https://github.com/discue/paddle-integration-firestore/commit/68a6b04fb58d9c4e36dbe4573b9c2744c62dc0c4))

## [0.9.0](https://github.com/discue/paddle-integration-firestore/compare/v0.8.0...v0.9.0) (2022-10-02)


### Features

* do not add upcoming payment if sub expires before ([92f0661](https://github.com/discue/paddle-integration-firestore/commit/92f066180e6419661dc93652214a6a70ce8ab1b5))


### Bug Fixes

* check if payments exists before accessing one of them ([4e6739f](https://github.com/discue/paddle-integration-firestore/commit/4e6739fb1476db820f1e95307f203349542a6c71))


### Chores

* **ci:** run only one job in parallel ([931145a](https://github.com/discue/paddle-integration-firestore/commit/931145a0839b4b3b47a8a98e8be3495e97b6b6f6))
* **deps-dev:** bump @playwright/test from 1.25.1 to 1.26.1 ([a6a914f](https://github.com/discue/paddle-integration-firestore/commit/a6a914f84ed657f4784e5badaca27f8c5f9a7f6d))
* **deps-dev:** bump eslint from 8.23.0 to 8.24.0 ([e29f1c8](https://github.com/discue/paddle-integration-firestore/commit/e29f1c8517b78305ccd36ec39bb4021db83bb6c5))
* **deps-dev:** bump firebase-tools from 11.8.0 to 11.13.0 ([6c5e286](https://github.com/discue/paddle-integration-firestore/commit/6c5e286030e58af581c6646ae2b44380092082b0))
* **deps-dev:** bump puppeteer from 17.0.0 to 18.0.5 ([765f918](https://github.com/discue/paddle-integration-firestore/commit/765f91843c4d4d5c8028c085ff3d5db73a87a132))
* **deps:** bump actions/stale from 5 to 6 ([5eddd24](https://github.com/discue/paddle-integration-firestore/commit/5eddd241ad2e2feaee3015f684144e24f98ce2d4))
* **deps:** bump got from 12.4.1 to 12.5.1 ([5f6e29f](https://github.com/discue/paddle-integration-firestore/commit/5f6e29fcfdca7d0cbc2ee82cad0c26277a21381b))

## [0.8.0](https://github.com/discue/paddle-integration-firestore/compare/v0.7.0...v0.8.0) (2022-09-30)


### Features

* implement get subscription info method ([f061e6a](https://github.com/discue/paddle-integration-firestore/commit/f061e6abeb2bc40a9ea0e2c83b79ead79e0bde9c))


### Refactorings

* move subscription hooks handling to own component ([e29ecb9](https://github.com/discue/paddle-integration-firestore/commit/e29ecb92d7017ea44394455ef137de1035eb0569))
* rename private method name ([38a7281](https://github.com/discue/paddle-integration-firestore/commit/38a72810976eca72cafbfde3c22bd4d66dc9f86a))
* split hook handling and subscription info components ([5adb158](https://github.com/discue/paddle-integration-firestore/commit/5adb158af794ab70a41ba5c036d27368119bb165))


### Chores

* remove client.js ([c007ca8](https://github.com/discue/paddle-integration-firestore/commit/c007ca8f9b6d40887c6fb228f6030d2c7bf0e124))

## [0.7.0](https://github.com/discue/paddle-integration-firestore/compare/v0.6.0...v0.7.0) (2022-09-27)


### Features

* sort payments trail descending ([24e5ce3](https://github.com/discue/paddle-integration-firestore/commit/24e5ce3c0fc49961311775f7d9e63bb384f55c82))
* sort status trail also descending ([54f9128](https://github.com/discue/paddle-integration-firestore/commit/54f9128f0ed6f441bf0a2a953a68ca2a9072f4c2))


### Chores

* sort list also in sub status descending ([f886837](https://github.com/discue/paddle-integration-firestore/commit/f88683770ac1529409a030819651b266102d24e8))
* update release scripts ([c7b3094](https://github.com/discue/paddle-integration-firestore/commit/c7b3094f633116581e11743b8a4dcbedefabe284))

## [0.6.0](https://github.com/discue/paddle-integration-firestore/compare/v0.5.0...v0.6.0) (2022-09-27)


### Features

* add upcoming payment also to payments trail ([45e746d](https://github.com/discue/paddle-integration-firestore/commit/45e746dbb2012c382cea80e2119e67245d95d033))
* **api:** add refund payment method ([3a7d4eb](https://github.com/discue/paddle-integration-firestore/commit/3a7d4ebab2d93731d2bcd53b6e21792545d8be47))
* html encode also all subscription events ([953bc16](https://github.com/discue/paddle-integration-firestore/commit/953bc164b32a3a7a9e084abf8961221fb9151c27))


### Chores

* add prefix to pre checkout placeholder ([11bd7c8](https://github.com/discue/paddle-integration-firestore/commit/11bd7c89e509cac3f51dff09ad7af6575753f867))
* **ci:** install playwright deps before e2e tests ([97b8a7a](https://github.com/discue/paddle-integration-firestore/commit/97b8a7a0936a1fabd2b0c64f6baee5f12afb9f2a))
* **deps:** remove dependency to playwright-core ([be28b9a](https://github.com/discue/paddle-integration-firestore/commit/be28b9a69550b2df37238d9cdbd3771a036ff40e))
* do not reassign result ([b89a13c](https://github.com/discue/paddle-integration-firestore/commit/b89a13c39d3a68dbc06f8e1f64e61250fcb854f9))
* handle unknown events gracefully ([a8f1c24](https://github.com/discue/paddle-integration-firestore/commit/a8f1c2466140c9cc68ec785ebb3ff54ae32e2adb))
* prevent duplicate code when handling payments ([0709909](https://github.com/discue/paddle-integration-firestore/commit/070990987cb508a5de8cb6328f357c124dabbfe5))
* update resource name ([c98bc6b](https://github.com/discue/paddle-integration-firestore/commit/c98bc6b610b822b04473fb5e3919e7fc5c0e17ee))

## [0.5.0](https://github.com/discue/paddle-integration-firestore/compare/v0.4.0...v0.5.0) (2022-09-14)


### Features

* after sub updated deactivate prev sub ([9e301d3](https://github.com/discue/paddle-integration-firestore/commit/9e301d3063fa2e86b0d668e0bdd4ca50903b754c))
* **api:** add service for paddle subscriptions api ([f6fc40d](https://github.com/discue/paddle-integration-firestore/commit/f6fc40dfd409dbd370cbcc50cfc3a78c8efc87bc))


### Refactorings

* rename local variable ([a218168](https://github.com/discue/paddle-integration-firestore/commit/a218168791f1b3af810caac67554fe927816d7a1))


### Chores

* allow 10s clockdrift checking sub activeness ([ba9ab0e](https://github.com/discue/paddle-integration-firestore/commit/ba9ab0e131ca781f6b45df1c673b9e3b0dbb18c5))
* also store subscription id for cancellation events ([596b85e](https://github.com/discue/paddle-integration-firestore/commit/596b85e2dcd0db545c2a961f7113167e94911bba))
* **ci:** add secrets to e2e test environment ([243cb51](https://github.com/discue/paddle-integration-firestore/commit/243cb5133e6db00f853fbe6ee8c1d02d738efdfa))
* decrease logging ([ad75551](https://github.com/discue/paddle-integration-firestore/commit/ad7555140ea08e966406304483df94c0c2cbbcd3))
* **deps:** install got ([629fd9c](https://github.com/discue/paddle-integration-firestore/commit/629fd9c2203b120ac0a0bbf3f2bcd98439eee640))
* make git ignore .env.local files ([b43eebc](https://github.com/discue/paddle-integration-firestore/commit/b43eebc26caecb788bfbdbb11dd39670bd6d7b79))
* update what is logged and when ([a877918](https://github.com/discue/paddle-integration-firestore/commit/a877918b4bb837e7033ba82d4e4c4b158b476bc5))

## [0.4.0](https://github.com/discue/paddle-integration-firestore/compare/v0.3.0...v0.4.0) (2022-09-11)


### Features

* add get start and end date method ([db8e775](https://github.com/discue/paddle-integration-firestore/commit/db8e7752045c9e3ae8192b8655adaa9e3d22d0d1))
* add method to compile payments list ([93b2704](https://github.com/discue/paddle-integration-firestore/commit/93b270429fbfbbc8b0845c6885414271a1ffa559))
* add method to compile status trail ([7dfe368](https://github.com/discue/paddle-integration-firestore/commit/7dfe368046cf4874bfa12849daf733b19b4b52d9))
* calculate subscription status per subscription plan id ([f0e02bd](https://github.com/discue/paddle-integration-firestore/commit/f0e02bdce1728a4c63c561ec6f64a7f66c1c65a3))
* return payment trail per sub plan id ([bc4c0bd](https://github.com/discue/paddle-integration-firestore/commit/bc4c0bd6f6f59c300e4516e4c1a7766f21e6b349))
* return start/end date per sub plan id ([9a217a9](https://github.com/discue/paddle-integration-firestore/commit/9a217a94caf792c3578fcd0150824b562962d3ad))
* return status trail per sub plan id ([9f1444b](https://github.com/discue/paddle-integration-firestore/commit/9f1444bd45074bb989ed395673ea324a7fc156bb))


### Refactorings

* use event_time instead of start_time for status ([b2fc819](https://github.com/discue/paddle-integration-firestore/commit/b2fc819756aca06ba1a99d6c7e78ffa19259b21c))
* use event_time instead of start_time for status ([bb107dc](https://github.com/discue/paddle-integration-firestore/commit/bb107dc09c97ca5f66ff57e64538e0d8ea800efc))


### Chores

* add start date for placeholder ([54d837f](https://github.com/discue/paddle-integration-firestore/commit/54d837fd3dbdf65a42fb19ce1f6d8f257c4a8688))
* do not store signature with payments ([e697625](https://github.com/discue/paddle-integration-firestore/commit/e69762523585d03fbf215ab3afef9a6820e5ae66))
* **docs:** add jsdoc to all functions ([1596d8c](https://github.com/discue/paddle-integration-firestore/commit/1596d8cf44a4de185e33514f2b32ce32b3de51d2))
* **docs:** add jsdoc types ([609ba17](https://github.com/discue/paddle-integration-firestore/commit/609ba17bbb35464e1b74c253e3b82724eb7501d7))
* **docs:** update readme ([8fbb40a](https://github.com/discue/paddle-integration-firestore/commit/8fbb40ac5dccad393d2bbbd4fd59c751114ab457))

## [0.3.0](https://github.com/discue/paddle-integration-firestore/compare/v0.2.0...v0.3.0) (2022-09-08)


### Features

* dont store subscription in subcollection ([6ff74fb](https://github.com/discue/paddle-integration-firestore/commit/6ff74fb777f12473e6cf395b6579cfd7019581fb))


### Refactorings

* rename all status methods ([1dfe541](https://github.com/discue/paddle-integration-firestore/commit/1dfe54163471b7138289923594196a32a76a0d51))


### Chores

* **docs:** update readme ([6afe36d](https://github.com/discue/paddle-integration-firestore/commit/6afe36d506d7deea85bac7c9fcecc07101d82b87))
* make sure test scripts actually run ([591a7a1](https://github.com/discue/paddle-integration-firestore/commit/591a7a158f4011af31aad8595ed76417c26b95f0))
* run tests before releases ([43b7821](https://github.com/discue/paddle-integration-firestore/commit/43b7821cabcaee0d3fae9add68a25f08c0f180e5))

## [0.2.0](https://github.com/discue/paddle-integration-firestore/compare/v0.1.0...v0.2.0) (2022-09-04)


### Features

* add actual server middleware ([62ebb98](https://github.com/discue/paddle-integration-firestore/commit/62ebb981477ca9c71ee2d8c5af7b0888670a0470))
* add body parser module ([c46543f](https://github.com/discue/paddle-integration-firestore/commit/c46543feb0b35ff23a819cd0879b822bc5d80f27))
* add html encoder ([d4cd798](https://github.com/discue/paddle-integration-firestore/commit/d4cd798126c2b917b98489d865314d50a36a1a5a))
* add methods for payments hooks ([6eeb570](https://github.com/discue/paddle-integration-firestore/commit/6eeb57066ce4e9cc831d788e0f010e6629f90832))
* allow subs to be stored in nested collections ([cb76db8](https://github.com/discue/paddle-integration-firestore/commit/cb76db8674e53b9d908d6a929f577a3f9cecbda6))
* allow to calc sub state in the future ([76012fe](https://github.com/discue/paddle-integration-firestore/commit/76012febd326c9bf4ac9f466006b745ecbea0405))
* also store alert id and name in status models ([0f0c913](https://github.com/discue/paddle-integration-firestore/commit/0f0c913e353b216850473166df45aefac249015f))
* implement create, update and cancel subscription ([bbb716b](https://github.com/discue/paddle-integration-firestore/commit/bbb716bd24c6a7caab6330bd69b3eafb6659f394))
* throw errors if arguments are falsy ([8ef9797](https://github.com/discue/paddle-integration-firestore/commit/8ef979783d7b1049a9bbfd34e1371b539f4df376))
* update module exports ([c6908ef](https://github.com/discue/paddle-integration-firestore/commit/c6908ef582c4fa75c11f827dcbc1afcc1bed2e39))


### Bug Fixes

* payments overwritten by subscription hooks ([f8a5682](https://github.com/discue/paddle-integration-firestore/commit/f8a5682dc2229b5b9a723d0906306add762f7dd7))
* start_at property not used in condition ([6999310](https://github.com/discue/paddle-integration-firestore/commit/69993101daa369df28ebd82d05677ef6dc619514))
* used wrong quantity property name ([aafae89](https://github.com/discue/paddle-integration-firestore/commit/aafae8947a3886ad15d73a96488bd457c5c3d1cc))


### Refactorings

* add comments and extract to smaller methods ([8f22288](https://github.com/discue/paddle-integration-firestore/commit/8f222885a23e0a108e693c67e5c45fc756926681))
* prepare usage of nested firestore resource ([422f5f7](https://github.com/discue/paddle-integration-firestore/commit/422f5f7cc9f61e402e2453f076c3f4ae7a1f1e4f))


### Chores

* add and update bash scripts ([6c6e030](https://github.com/discue/paddle-integration-firestore/commit/6c6e030e7c28d4f3b7e617810f0b52ee628b36e6))
* add firestore functions ([0d41cc2](https://github.com/discue/paddle-integration-firestore/commit/0d41cc2177d2997dbada889fc54b7199305aa893))
* add hook server ([f0d7416](https://github.com/discue/paddle-integration-firestore/commit/f0d7416b8e8bc57339830485ca97aeffa96b2543))
* add local firebase emulator config ([25eaf32](https://github.com/discue/paddle-integration-firestore/commit/25eaf325853530dda6f6b05934361417e35f054f))
* add test script ([5308880](https://github.com/discue/paddle-integration-firestore/commit/53088801ca8d383f79c333e7dfb1e06606254f10))
* allow node globals ([bfebb3b](https://github.com/discue/paddle-integration-firestore/commit/bfebb3b8e1a336702eadf97c511b4bcc0f5a8084))
* **ci:** run also e2e tests ([269955d](https://github.com/discue/paddle-integration-firestore/commit/269955dfee61119495514e62ffebde6383b2af93))
* **deps-dev:** bump puppeteer from 16.2.0 to 17.0.0 ([638874c](https://github.com/discue/paddle-integration-firestore/commit/638874c2a1301bed3ed780b43cb77bdfb60723f0))
* **deps:** install e2e test dependencies ([4dcd2ac](https://github.com/discue/paddle-integration-firestore/commit/4dcd2ac08136865ee129083c08f4d3ecb3e93278))
* **deps:** install html entities ([fea9bb4](https://github.com/discue/paddle-integration-firestore/commit/fea9bb40d83c1f23cd91d9f5f673878ef7e3f206))
* **deps:** make firebase tools a dev dep ([510a0d3](https://github.com/discue/paddle-integration-firestore/commit/510a0d36d96b77e6d57e83f4b43c929b38ac1111))
* **deps:** update dependencies ([c19c04a](https://github.com/discue/paddle-integration-firestore/commit/c19c04a95939cbc9083e4e96afd1df8b4280b4fd))
* do not encode payments twice ([d364979](https://github.com/discue/paddle-integration-firestore/commit/d3649799bd14c7f5f2f8bfda25816fadf66a93cd))
* **docs:** update readme ([af94536](https://github.com/discue/paddle-integration-firestore/commit/af945369c4a99f04ca65a9e4400a9e7a757cd3b3))
* remove unused import ([7d17ca0](https://github.com/discue/paddle-integration-firestore/commit/7d17ca0de886ff766c82862c443704749f8ca232))
* remove unused imports ([91e5ed4](https://github.com/discue/paddle-integration-firestore/commit/91e5ed42604a9c8c55a95dad57f63651f8b3e7fc))
* run firebase emulator before all tests ([7415561](https://github.com/discue/paddle-integration-firestore/commit/741556183caa185ef860e4982ecce60f02247179))
* run test script ([1c87211](https://github.com/discue/paddle-integration-firestore/commit/1c87211ef8efcbe9ba012b4ee5a65dcde140dd8b))
* update test scripts ([982e078](https://github.com/discue/paddle-integration-firestore/commit/982e0780a3a2d71c3b4a72d9e0ccd9d67088c187))

## 0.1.0 (2022-08-21)


### Chores

* add changelog generation script ([42759dd](https://github.com/discue/paddle-integration-firestore/commit/42759dd60bd79ca24380e662d3dc62fb0a72ef03))
* add eslintrc ([61933ce](https://github.com/discue/paddle-integration-firestore/commit/61933cea448eb9a356d5b26a4ce3027f2c925058))
* add github workflows ([44c9b58](https://github.com/discue/paddle-integration-firestore/commit/44c9b58f08da2608fc91afa58a28985311b1ba68))
* add gitignore ([215f66d](https://github.com/discue/paddle-integration-firestore/commit/215f66da581064152b610530c1df9904676c26ec))
* add license ([88ce510](https://github.com/discue/paddle-integration-firestore/commit/88ce5106f5bc50542e5ad3aa8694bc7d9883f452))
* add package files ([4a28dfc](https://github.com/discue/paddle-integration-firestore/commit/4a28dfc3dfa24cce1dae0ad75e27e8f30e78f30c))
* add standard version config ([7191a2b](https://github.com/discue/paddle-integration-firestore/commit/7191a2b3e3347bc6a1a35882f893bafe9c5ffe35))
