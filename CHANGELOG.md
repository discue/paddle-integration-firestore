# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
