# Changelog

## [2.1.0](https://github.com/cowprotocol/cowswap/compare/core-v2.0.1...core-v2.1.0) (2026-02-05)


### ✨ Features

* **cms:** improve cms requests caching logic ([#6956](https://github.com/cowprotocol/cowswap/issues/6956)) ([4dc4b56](https://github.com/cowprotocol/cowswap/commit/4dc4b56cd371fcf2e8092abbb4447a4c10106b7e))
* **trade:** upload appData to IPFS before signing ([#6922](https://github.com/cowprotocol/cowswap/issues/6922)) ([cb94104](https://github.com/cowprotocol/cowswap/commit/cb9410470c549bd5453a7933a0a224ba706ec2c2))


### 🔧 Miscellaneous

* update sdk ([a20814b](https://github.com/cowprotocol/cowswap/commit/a20814b7caf16f495cd0292d5f3469bc552e4d97))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/common-const bumped to 2.1.0

## [2.0.1](https://github.com/cowprotocol/cowswap/compare/core-v2.0.0...core-v2.0.1) (2026-02-02)


### Bug Fixes

* **protocol-fee:** support decimals in protocol fee ([#6948](https://github.com/cowprotocol/cowswap/issues/6948)) ([a572bbe](https://github.com/cowprotocol/cowswap/commit/a572bbe2899b0a48b2c0891922442a4420f6c3ef))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/common-const bumped to 2.0.1

## [2.0.0](https://github.com/cowprotocol/cowswap/compare/core-v1.11.0...core-v2.0.0) (2026-01-28)


### ⚠ BREAKING CHANGES

* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847))

### Features

* **limit:** load more orders button [#6853](https://github.com/cowprotocol/cowswap/issues/6853) ([b647396](https://github.com/cowprotocol/cowswap/commit/b647396c09f00b878ae06d0b0932c40512c0cba1))
* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847)) ([1c5d115](https://github.com/cowprotocol/cowswap/commit/1c5d11516d0ddb997b0ebbb4eee4adcb491204a4))


### Bug Fixes

* optimize bundle size ([#6775](https://github.com/cowprotocol/cowswap/issues/6775)) ([287a94e](https://github.com/cowprotocol/cowswap/commit/287a94e807b3672dbbd291768fb2ad80dbd288e5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/common-const bumped to 2.0.0

## [1.11.0](https://github.com/cowprotocol/cowswap/compare/core-v1.10.1...core-v1.11.0) (2026-01-09)


### Features

* **trade:** implement consent logic for restricted tokens list ([#6617](https://github.com/cowprotocol/cowswap/issues/6617)) ([14686d1](https://github.com/cowprotocol/cowswap/commit/14686d1c71bae6ceacc14f86679412f06e7297c5))

## [1.10.1](https://github.com/cowprotocol/cowswap/compare/core-v1.10.0...core-v1.10.1) (2025-12-16)


### Bug Fixes

* remove duplicates in token lists by migrating the state ([#6636](https://github.com/cowprotocol/cowswap/issues/6636)) ([8ea5005](https://github.com/cowprotocol/cowswap/commit/8ea5005d9a32ba360c3e846f6a75e4a9fca193b5))

## [1.10.0](https://github.com/cowprotocol/cowswap/compare/core-v1.9.0...core-v1.10.0) (2025-11-24)


### Features

* **internationalization:** add internationalization to CoW Swap ([#6198](https://github.com/cowprotocol/cowswap/issues/6198)) ([bec1e54](https://github.com/cowprotocol/cowswap/commit/bec1e54643d9b20a8b6517eae188993e364fed90))

## [1.9.0](https://github.com/cowprotocol/cowswap/compare/core-v1.8.1...core-v1.9.0) (2025-11-10)


### Features

* **new-chains:** add q4 chains ([#6404](https://github.com/cowprotocol/cowswap/issues/6404)) ([ba4edb0](https://github.com/cowprotocol/cowswap/commit/ba4edb0fdc7b4c700dfeae9023da330d74a9faea))

## [1.8.1](https://github.com/cowprotocol/cowswap/compare/core-v1.8.0...core-v1.8.1) (2025-09-11)


### Bug Fixes

* **twap:** load orders history faster ([#6226](https://github.com/cowprotocol/cowswap/issues/6226)) ([bfba891](https://github.com/cowprotocol/cowswap/commit/bfba89170c63333e3182adb27624cac33106af1d))

## [1.8.0](https://github.com/cowprotocol/cowswap/compare/core-v1.7.4...core-v1.8.0) (2025-08-21)


### Features

* **new-networks:** lens and bnb ([#5992](https://github.com/cowprotocol/cowswap/issues/5992)) ([19ac060](https://github.com/cowprotocol/cowswap/commit/19ac060f94088e7a1f6a2a891ef11d2c1ded4525))

## [1.7.4](https://github.com/cowprotocol/cowswap/compare/core-v1.7.3...core-v1.7.4) (2025-07-03)


### Bug Fixes

* **progress-bar:** ignore active solvers flag from CMS ([#5905](https://github.com/cowprotocol/cowswap/issues/5905)) ([0af9abb](https://github.com/cowprotocol/cowswap/commit/0af9abb54abba01f0a19e3389c812d0210bde3ca))

## [1.7.3](https://github.com/cowprotocol/cowswap/compare/core-v1.7.2...core-v1.7.3) (2025-06-18)


### Bug Fixes

* reduce rerenders count and theme recalculation ([#5831](https://github.com/cowprotocol/cowswap/issues/5831)) ([96a7a35](https://github.com/cowprotocol/cowswap/commit/96a7a350f366615a1e5149097541b5e2ccf880f1))

## [1.7.2](https://github.com/cowprotocol/cowswap/compare/core-v1.7.1...core-v1.7.2) (2025-05-29)


### Bug Fixes

* **twap:** use indexedDB to persist state ([#5771](https://github.com/cowprotocol/cowswap/issues/5771)) ([bf410ec](https://github.com/cowprotocol/cowswap/commit/bf410ecc1d27d0d9eadd835c1b74141c6cee4341))

## [1.7.1](https://github.com/cowprotocol/cowswap/compare/core-v1.7.0...core-v1.7.1) (2025-05-19)


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.7.0](https://github.com/cowprotocol/cowswap/compare/core-v1.6.0...core-v1.7.0) (2025-02-12)


### Features

* support EIP-5792 batch tx for Safe via WC ([#5417](https://github.com/cowprotocol/cowswap/issues/5417)) ([8aa612f](https://github.com/cowprotocol/cowswap/commit/8aa612f7b93a40d69efa364a10634863bc743e95))

## [1.6.0](https://github.com/cowprotocol/cowswap/compare/core-v1.5.0...core-v1.6.0) (2024-12-18)


### Features

* **announcements:** load announcements from cms ([#5212](https://github.com/cowprotocol/cowswap/issues/5212)) ([b70703c](https://github.com/cowprotocol/cowswap/commit/b70703c7a206d5e040bbd29439dcc7eeddf72f42))

## [1.5.0](https://github.com/cowprotocol/cowswap/compare/core-v1.4.0...core-v1.5.0) (2024-12-11)


### Features

* **cow-fi:** upgrade project structure to /app ([#5167](https://github.com/cowprotocol/cowswap/issues/5167)) ([ed152f7](https://github.com/cowprotocol/cowswap/commit/ed152f7ac0fa62ab2c0b9c93035a551c3b8cb4b6))

## [1.4.0](https://github.com/cowprotocol/cowswap/compare/core-v1.3.0...core-v1.4.0) (2024-12-03)


### Features

* **base:** add base chain support ([#5044](https://github.com/cowprotocol/cowswap/issues/5044)) ([4cf0c91](https://github.com/cowprotocol/cowswap/commit/4cf0c91a300d6fcdc026364e74c45e5b2f729f2b))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/core-v1.2.0...core-v1.3.0) (2024-08-27)


### Features

* **progress-bar-v2:** replace progress bar with v2 ([#4033](https://github.com/cowprotocol/cowswap/issues/4033)) ([e199bff](https://github.com/cowprotocol/cowswap/commit/e199bff492ad3f91df23be34a829ebe1f246444a))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/core-v1.1.0...core-v1.2.0) (2024-07-31)


### Features

* support barn CMS and refactor ([#4630](https://github.com/cowprotocol/cowswap/issues/4630)) ([3b9bbff](https://github.com/cowprotocol/cowswap/commit/3b9bbffd9b916a0f5ec493941bcffd7fb9182972))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/core-v1.0.0...core-v1.1.0) (2024-05-29)


### Features

* **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))

## 1.0.0 (2024-03-29)


### Features

* **networks:** support Sepolia ([#3558](https://github.com/cowprotocol/cowswap/issues/3558)) ([ab8b179](https://github.com/cowprotocol/cowswap/commit/ab8b1794fb60da851f3fccdd861ebef4b18df30e))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))


### Bug Fixes

* merge localStorage state with initial state to prevent empty states ([#3604](https://github.com/cowprotocol/cowswap/issues/3604)) ([9cd4bf5](https://github.com/cowprotocol/cowswap/commit/9cd4bf53807e307c213c547c762907b71bb5b343))
