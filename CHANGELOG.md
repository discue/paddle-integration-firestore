# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
