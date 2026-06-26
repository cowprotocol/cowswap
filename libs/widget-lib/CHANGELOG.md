# Changelog

## [4.4.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.3.1...widget-lib-v4.4.0) (2026-06-25)

### Minor Changes

- feat(widget): control tokens switching (#7717)

- feat: Widget Configurator Revamp (#7604)

### Patch Changes

- fix(widget): add iframe loading retry logic (#7636)

## [4.3.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.3.0...widget-lib-v4.3.1) (2026-06-23)

### Patch Changes

- fix: fix near bridging (#7716)

- Updated dependencies []:
  - @cowprotocol/events@4.7.1
  - @cowprotocol/iframe-transport@2.3.2

## [4.3.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.2.0...widget-lib-v4.3.0) (2026-06-23)

### Minor Changes

- feat: adjust dApp configuration for Solana as supported chain id (#7525)

- feat(bridge): enable sell=buy feature (#7633)

- feat(widget): handle widget loading error (#7574)

- feat(widget): add options to control approval flow (#7571)

- feat(widget): control custom recipient (#7573)

### Patch Changes

- fix: BTC bridging (#7532)

- fix(explorer): solver info displaying (#7667)

- Updated dependencies []:
  - @cowprotocol/events@4.7.0
  - @cowprotocol/iframe-transport@2.3.1

## [4.2.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.1.0...widget-lib-v4.2.0) (2026-06-09)

### Minor Changes

- feat(widget): handle widget loading error (#7574)

- feat(widget): control custom recipient (#7573)

- feat(widget): add options to control approval flow (#7571)

### Patch Changes

- Updated dependencies []:
  - @cowprotocol/events@4.6.0

## [4.1.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.0.5...widget-lib-v4.1.0) (2026-06-08)

### Minor Changes

- feat(captcha): integrate turnstile for quote requests (#7030)

- feat(wallet): enable coinbase wallet connection in standalone mode (#7475)

- feat: enhance CowSwapWidget with Safe SDK bridge option and improve e… (#7460)

### Patch Changes

- Updated dependencies []:
  - @cowprotocol/iframe-transport@2.3.0
  - @cowprotocol/events@4.5.0

## [4.0.5](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.0.4...widget-lib-v4.0.5) (2026-05-22)

### Patch Changes

- fix(widget): support non-browser environment (#7549)

- fix: patch estimated gas value to hex-encode (#7524)

- Updated dependencies []:
  - @cowprotocol/events@4.4.1
  - @cowprotocol/iframe-transport@2.2.6

## 4.0.4

### Patch Changes

- Updated dependencies []:
  - @cowprotocol/iframe-transport@2.2.5
  - @cowprotocol/events@4.4.0

## [4.0.3](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.0.2...widget-lib-v4.0.3) (2026-05-13)

### ✨ Features

- **widget:** add `tokenPairConstraints` option to forbid specific sell→buy combinations, with the new `TokenPairConstraint` exported type ([#7397](https://github.com/cowprotocol/cowswap/issues/7397)) ([0a95a6c](https://github.com/cowprotocol/cowswap/commit/0a95a6cfbabb75b4bf1146e7320752969a846b53))

### 🐛 Bug Fixes

- bump version of widget-lib + iframe-transport ([#7493](https://github.com/cowprotocol/cowswap/issues/7493)) ([b8a3bea](https://github.com/cowprotocol/cowswap/commit/b8a3beaed3ea1aebdfbdd1eee05d34fcb0f9c3a4))

### 🔧 Miscellaneous

- backfills changes shipped to `main` via [#7397](https://github.com/cowprotocol/cowswap/issues/7397) but skipped by release-please during the cowswap-v3.10.0 cycle (committer-date older than the release anchor caused the history iterator to bypass the commit).

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/iframe-transport bumped to 2.2.4

## [4.0.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.0.1...widget-lib-v4.0.2) (2026-04-30)

### 🐛 Bug Fixes

- **widget:** call onReady against iframe ([#7436](https://github.com/cowprotocol/cowswap/issues/7436)) ([e8a9f91](https://github.com/cowprotocol/cowswap/commit/e8a9f912f560a1d849636723717c569b24cc7f83))

## [4.0.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v4.0.0...widget-lib-v4.0.1) (2026-04-22)

### 🐛 Bug Fixes

- take protocol fee into account ([#7385](https://github.com/cowprotocol/cowswap/issues/7385)) ([53057f8](https://github.com/cowprotocol/cowswap/commit/53057f8becaa6cfe9182e2d726471794d03b5775))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.3.1
    - @cowprotocol/iframe-transport bumped to 2.2.3

## [4.0.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v3.1.1...widget-lib-v4.0.0) (2026-04-16)

### ⚠ BREAKING CHANGES

- **widget:** bring cow.fi back ([#7361](https://github.com/cowprotocol/cowswap/issues/7361))

### ✨ Features

- bring cow.fi back (sdk) ([#7359](https://github.com/cowprotocol/cowswap/issues/7359)) ([7c19aee](https://github.com/cowprotocol/cowswap/commit/7c19aee0e0ec06ce9e2b657d79323975a62f6bd7))
- **widget:** bring cow.fi back ([#7361](https://github.com/cowprotocol/cowswap/issues/7361)) ([44fb968](https://github.com/cowprotocol/cowswap/commit/44fb968a2a4c1bc4b738e44fb59623799cc8cdc0))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.3.0
    - @cowprotocol/iframe-transport bumped to 2.2.2

## [3.1.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v3.1.0...widget-lib-v3.1.1) (2026-04-15)

### 🐛 Bug Fixes

- revert back to cow.fi ([1043485](https://github.com/cowprotocol/cowswap/commit/10434853e5b29991ccf94eb15989ba76449caec3))
- revert back to cow.fi ([5192a14](https://github.com/cowprotocol/cowswap/commit/5192a14f90bc4f8863327d1afa07c97cec25a2d1))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/iframe-transport bumped to 2.2.1

## [3.1.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v3.0.0...widget-lib-v3.1.0) (2026-04-15)

### ✨ Features

- **widget:** refactor/improve window.open / deeplink widget logic ([1502fea](https://github.com/cowprotocol/cowswap/commit/1502feafa878d58d3936b427d66ecdd38de217d7))

### 🐛 Bug Fixes

- add disableExternalNavigation option to explicitly disable external navigation ([0c29369](https://github.com/cowprotocol/cowswap/commit/0c29369a11d75092244dc1dae9fdf17958cda3ca))
- fix test ([177ee8c](https://github.com/cowprotocol/cowswap/commit/177ee8cfa4438280a74abc256752ae764e8e1fbb))
- fix tests and remove debug logs from tests ([ab1fca8](https://github.com/cowprotocol/cowswap/commit/ab1fca88df4c2b32b7fbc731af44bb89e55bf479))
- rename disableExternalNavigation to disableWindowOpen ([12e3c5a](https://github.com/cowprotocol/cowswap/commit/12e3c5a25bea25d49c52bdea82d07df728317d70))

### 🔧 Miscellaneous

- merge main and resolve conflicts ([ed8f113](https://github.com/cowprotocol/cowswap/commit/ed8f113fc11c20e7e0fb84f9282abefa0693f8ab))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.2.1
    - @cowprotocol/iframe-transport bumped to 2.2.0

## [3.0.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.3.0...widget-lib-v3.0.0) (2026-04-15)

### ⚠ BREAKING CHANGES

- **widget:** migrate to swap.cow.finance domain ([#7340](https://github.com/cowprotocol/cowswap/issues/7340))

### ✨ Features

- **widget:** migrate to swap.cow.finance domain ([#7340](https://github.com/cowprotocol/cowswap/issues/7340)) ([5e4c2b8](https://github.com/cowprotocol/cowswap/commit/5e4c2b816b386040965c5070e2482449dbe56032))

## [2.3.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.5...widget-lib-v2.3.0) (2026-04-14)

### ✨ Features

- migrate to cow.finance ([#7330](https://github.com/cowprotocol/cowswap/issues/7330)) ([abedba1](https://github.com/cowprotocol/cowswap/commit/abedba1f1d466fae8858d08a62fff4135b7e4956))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.2.0
    - @cowprotocol/iframe-transport bumped to 2.1.0

## [2.2.5](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.4...widget-lib-v2.2.5) (2026-04-10)

### 🐛 Bug Fixes

- **widget:** fix iframe issues ([#7298](https://github.com/cowprotocol/cowswap/issues/7298)) ([3f7094d](https://github.com/cowprotocol/cowswap/commit/3f7094df6389c01bdda515b645b58dcc0b292253))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/iframe-transport bumped to 2.0.13

## [2.2.4](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.3...widget-lib-v2.2.4) (2026-04-08)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.1.2
    - @cowprotocol/iframe-transport bumped to 2.0.12

## [2.2.3](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.2...widget-lib-v2.2.3) (2026-04-07)

### 🐛 Bug Fixes

- **widget:** trigger re-deployment 2 ([6df9c79](https://github.com/cowprotocol/cowswap/commit/6df9c79f407bcdf8a253db3dcf80f5ce41c59fa3))
- **widget:** trigger re-deployment 2 ([a7b60b8](https://github.com/cowprotocol/cowswap/commit/a7b60b85193d9e2a5f7da6fe76e5a1ad590b6cbc))

## [2.2.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.1...widget-lib-v2.2.2) (2026-04-07)

### 🐛 Bug Fixes

- **widget:** trigger a redeployment of widget ([#7270](https://github.com/cowprotocol/cowswap/issues/7270)) ([3abaa22](https://github.com/cowprotocol/cowswap/commit/3abaa222591d487ee62db32df800c6e533db754b))

## [2.2.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.2.0...widget-lib-v2.2.1) (2026-04-07)

### 🐛 Bug Fixes

- fix bridging for affiliates ([#7263](https://github.com/cowprotocol/cowswap/issues/7263)) ([26f1ea4](https://github.com/cowprotocol/cowswap/commit/26f1ea451aa07f6e2d8bcb9918b95771150fac3b))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.1.1
    - @cowprotocol/iframe-transport bumped to 2.0.11

## [2.2.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.1.1...widget-lib-v2.2.0) (2026-04-06)

### ✨ Features

- **widget:** add onReady callback to widget initialization ([#7255](https://github.com/cowprotocol/cowswap/issues/7255)) ([0279aac](https://github.com/cowprotocol/cowswap/commit/0279aacbbe610bbe0cfe66597bd04ebc89bab55c))
- **widget:** allow hiding post trading tips ([#7256](https://github.com/cowprotocol/cowswap/issues/7256)) ([b484ad1](https://github.com/cowprotocol/cowswap/commit/b484ad162fb0834556dd14fcb99fd0cadbfcfaa3))

## [2.1.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.1.0...widget-lib-v2.1.1) (2026-04-03)

### 🐛 Bug Fixes

- **widget:** hooks preventing trading on older versions ([#7249](https://github.com/cowprotocol/cowswap/issues/7249)) ([120e840](https://github.com/cowprotocol/cowswap/commit/120e8402fcbdc95677aa32bc247b55bc12970257))

## [2.1.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.0.2...widget-lib-v2.1.0) (2026-04-02)

### ✨ Features

- **tradeFormValidation:** add loading state for price impact and update validation logic ([681b1d7](https://github.com/cowprotocol/cowswap/commit/681b1d7e77a1fc7bc03063345f71a81169691c53))
- **tradeFormValidation:** add loading state for price impact and update validation logic ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- **widget:** add options to disable trade based on price impact ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- **widget:** control available tokens to select to sell or buy ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- **widget:** control available tokens to select to sell or buy ([#7201](https://github.com/cowprotocol/cowswap/issues/7201)) ([7a74e24](https://github.com/cowprotocol/cowswap/commit/7a74e242deee18b47b36aaf5efefa0d4fb108973))
- **widget:** control trading with price impact ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- **widget:** control trading with price impact [#7202](https://github.com/cowprotocol/cowswap/issues/7202) ([#7238](https://github.com/cowprotocol/cowswap/issues/7238)) ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- **widget:** hook wallet interactions ([#7228](https://github.com/cowprotocol/cowswap/issues/7228)) ([681b1d7](https://github.com/cowprotocol/cowswap/commit/681b1d7e77a1fc7bc03063345f71a81169691c53))

### 🔧 Miscellaneous

- fix test ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))
- run i18n extract ([3af7bf1](https://github.com/cowprotocol/cowswap/commit/3af7bf125aa404ac4bb30b21950eab3ee5b68067))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.1.0

## [2.0.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.0.1...widget-lib-v2.0.2) (2026-03-19)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.0.2
    - @cowprotocol/iframe-transport bumped to 2.0.10

## [2.0.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v2.0.0...widget-lib-v2.0.1) (2026-03-18)

### 🐛 Bug Fixes

- update libs publising and bundling ([#7173](https://github.com/cowprotocol/cowswap/issues/7173)) ([e3bc5f1](https://github.com/cowprotocol/cowswap/commit/e3bc5f179124c11590a992789db43d912f8ee4a6))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.0.1
    - @cowprotocol/iframe-transport bumped to 2.0.9

## [2.0.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.3.0...widget-lib-v2.0.0) (2026-03-11)

### ⚠ BREAKING CHANGES

- Remove support for Lens network ([#7128](https://github.com/cowprotocol/cowswap/issues/7128))

### ✨ Features

- remove support for Lens network ([#7128](https://github.com/cowprotocol/cowswap/issues/7128)) ([ffdd36d](https://github.com/cowprotocol/cowswap/commit/ffdd36db765eb1feb7fc675347de40b1e6df2bdd))

### 🔧 Miscellaneous

- **hotfix:** 2026-03-10 ([8c831f7](https://github.com/cowprotocol/cowswap/commit/8c831f70685c058f460d7a0fabbf2941163b9fba))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 4.0.0
    - @cowprotocol/iframe-transport bumped to 2.0.8

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.2.2...widget-lib-v1.3.0) (2026-03-10)

### ✨ Features

- integrate non-evm sdk changes ([#7085](https://github.com/cowprotocol/cowswap/issues/7085)) ([674602e](https://github.com/cowprotocol/cowswap/commit/674602e19bd97197a98733da51cda186d256384e))

### 🐛 Bug Fixes

- use correct amounts to sign instead of afterSlippage ([#7022](https://github.com/cowprotocol/cowswap/issues/7022)) ([b1020c4](https://github.com/cowprotocol/cowswap/commit/b1020c44615b49c5f05f0a6dcf0d21b96b628846))

### 🔧 Miscellaneous

- **release:** 2026-03-04 ([5612b59](https://github.com/cowprotocol/cowswap/commit/5612b59d690f9081e62d9efc5ea80774428f0366))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.4.0
    - @cowprotocol/iframe-transport bumped to 2.0.7

## [1.2.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.2.1...widget-lib-v1.2.2) (2026-02-25)

### 🔧 Miscellaneous

- main -&gt; dev ([9c6611e](https://github.com/cowprotocol/cowswap/commit/9c6611e90a4b23e23f6aaadc513de3c6d7f3b562))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.3.2
    - @cowprotocol/iframe-transport bumped to 2.0.6

## [1.2.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.2.0...widget-lib-v1.2.1) (2026-02-24)

### 🔧 Miscellaneous

- merge main into dev 23 02 ([#7062](https://github.com/cowprotocol/cowswap/issues/7062)) ([ac48c9c](https://github.com/cowprotocol/cowswap/commit/ac48c9c83284c6228ba71392edc1c1e0483b53ff))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.3.1
    - @cowprotocol/iframe-transport bumped to 2.0.5

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.1.2...widget-lib-v1.2.0) (2026-02-20)

### ✨ Features

- **chains:** disable Lens and support deprecating networks ([#7028](https://github.com/cowprotocol/cowswap/issues/7028)) ([c12d6c2](https://github.com/cowprotocol/cowswap/commit/c12d6c21ad69258c587378add9da86d72ff755b2))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.3.0
    - @cowprotocol/iframe-transport bumped to 2.0.4

## [1.1.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.1.1...widget-lib-v1.1.2) (2026-02-13)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.2.0
    - @cowprotocol/iframe-transport bumped to 2.0.3

## [1.1.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.1.0...widget-lib-v1.1.1) (2026-02-10)

### 🐛 Bug Fixes

- **widget-lib:** clean up code ([#6992](https://github.com/cowprotocol/cowswap/issues/6992)) ([39d9f97](https://github.com/cowprotocol/cowswap/commit/39d9f97966e0a80dbc6b1232676fd18333070e1a))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.0.1...widget-lib-v1.1.0) (2026-02-05)

### ✨ Features

- **trade:** upload appData to IPFS before signing ([#6922](https://github.com/cowprotocol/cowswap/issues/6922)) ([cb94104](https://github.com/cowprotocol/cowswap/commit/cb9410470c549bd5453a7933a0a224ba706ec2c2))

### 🔧 Miscellaneous

- update sdk ([a20814b](https://github.com/cowprotocol/cowswap/commit/a20814b7caf16f495cd0292d5f3469bc552e4d97))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.1.0
    - @cowprotocol/iframe-transport bumped to 2.0.2

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v1.0.0...widget-lib-v1.0.1) (2026-02-02)

### Bug Fixes

- **protocol-fee:** support decimals in protocol fee ([#6948](https://github.com/cowprotocol/cowswap/issues/6948)) ([a572bbe](https://github.com/cowprotocol/cowswap/commit/a572bbe2899b0a48b2c0891922442a4420f6c3ef))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.0.1
    - @cowprotocol/iframe-transport bumped to 2.0.1

## [1.0.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.22.3...widget-lib-v1.0.0) (2026-01-28)

### ⚠ BREAKING CHANGES

- migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847))

### Features

- migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847)) ([1c5d115](https://github.com/cowprotocol/cowswap/commit/1c5d11516d0ddb997b0ebbb4eee4adcb491204a4))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped to 3.0.0
    - @cowprotocol/iframe-transport bumped to 2.0.0

## [0.22.3](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.22.2...widget-lib-v0.22.3) (2026-01-26)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/iframe-transport bumped from ^1.1.1 to ^1.2.0

## [0.22.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.22.1...widget-lib-v0.22.2) (2026-01-26)

### Bug Fixes

- **widget-lib:** add compatibility with server rendering ([#6813](https://github.com/cowprotocol/cowswap/issues/6813)) ([76bd736](https://github.com/cowprotocol/cowswap/commit/76bd736f17d722f0a639542d4fcbd5e3f0be57b2))

## [0.22.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.22.0...widget-lib-v0.22.1) (2025-12-24)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped from ^2.0.2 to ^2.1.0

## [0.22.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.21.1...widget-lib-v0.22.0) (2025-12-22)

### Features

- **widget:** option to disable bridging ([#6730](https://github.com/cowprotocol/cowswap/issues/6730)) ([7fc3949](https://github.com/cowprotocol/cowswap/commit/7fc3949f5d656709e3f812499870313cc3b41b9f))

## [0.21.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.21.0...widget-lib-v0.21.1) (2025-12-16)

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped from ^2.0.1 to ^2.0.2

## [0.21.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.20.0...widget-lib-v0.21.0) (2025-11-24)

### Features

- **internationalization:** add internationalization to CoW Swap ([#6198](https://github.com/cowprotocol/cowswap/issues/6198)) ([bec1e54](https://github.com/cowprotocol/cowswap/commit/bec1e54643d9b20a8b6517eae188993e364fed90))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @cowprotocol/events bumped from ^1.6.1 to ^2.0.1

## [0.20.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.19.2...widget-lib-v0.20.0) (2025-07-10)

### Features

- **trade:** slippage config for integrators ([#5906](https://github.com/cowprotocol/cowswap/issues/5906)) ([cbfa3b1](https://github.com/cowprotocol/cowswap/commit/cbfa3b142571df7bdf55919b8ae6df986017aeab))

## [0.19.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.19.1...widget-lib-v0.19.2) (2025-06-18)

### Bug Fixes

- make order progress bar UI more stable ([#5834](https://github.com/cowprotocol/cowswap/issues/5834)) ([80cebd1](https://github.com/cowprotocol/cowswap/commit/80cebd1104a0a2e30e12ce8a4b3d62c212559cec))

## [0.19.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.19.0...widget-lib-v0.19.1) (2025-05-19)

### Bug Fixes

- **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [0.19.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.18.1...widget-lib-v0.19.0) (2025-03-27)

### Features

- **widget:** allow passing targetChainId for bridge ([#5523](https://github.com/cowprotocol/cowswap/issues/5523)) ([8572095](https://github.com/cowprotocol/cowswap/commit/85720957f2aaf1e8f67d745642f09bf3403ed8a5))

## [0.18.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.18.0...widget-lib-v0.18.1) (2025-02-05)

### Bug Fixes

- **safe-app:** remove approval+order placement bundling banner ([#5393](https://github.com/cowprotocol/cowswap/issues/5393)) ([571029d](https://github.com/cowprotocol/cowswap/commit/571029d11f7c2d1afe608f8dd3481c404e0efea0))

## [0.18.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.17.0...widget-lib-v0.18.0) (2024-12-03)

### Features

- **widget:** add maxHeight parameter for the widget ([#5127](https://github.com/cowprotocol/cowswap/issues/5127)) ([db8b509](https://github.com/cowprotocol/cowswap/commit/db8b509d2d46d1ef5e52a18347d20bbebe96dbbd))

## [0.17.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.16.0...widget-lib-v0.17.0) (2024-10-29)

### Features

- setup vampire attack widget ([#4950](https://github.com/cowprotocol/cowswap/issues/4950)) ([99c4c42](https://github.com/cowprotocol/cowswap/commit/99c4c42aec60a734a37926935be5dca6cd4cf11c))

## [0.16.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.15.0...widget-lib-v0.16.0) (2024-10-18)

### Features

- **widget:** deadline widget param ([#4991](https://github.com/cowprotocol/cowswap/issues/4991)) ([ce3b5b8](https://github.com/cowprotocol/cowswap/commit/ce3b5b8adb5cc95a5ca3097d5cf2d45b249748c2))
- **widget:** hide bridge info ([#4992](https://github.com/cowprotocol/cowswap/issues/4992)) ([9842afd](https://github.com/cowprotocol/cowswap/commit/9842afdb887497d235a01538663488b0b8852bb5))
- **widget:** hide orders table ([#4993](https://github.com/cowprotocol/cowswap/issues/4993)) ([681fb20](https://github.com/cowprotocol/cowswap/commit/681fb20dab0b4155d50ad7f32c7a48cb95e084a3))

## [0.15.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.14.1...widget-lib-v0.15.0) (2024-09-30)

### Features

- **hooks-store:** support iframe hook-dapps ([#4885](https://github.com/cowprotocol/cowswap/issues/4885)) ([5116f29](https://github.com/cowprotocol/cowswap/commit/5116f296a0e4866d0a51a806b7abe55e809d26e9))

## [0.14.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.14.0...widget-lib-v0.14.1) (2024-09-17)

### Bug Fixes

- **libs:** fix import error on multiple libs ([#4869](https://github.com/cowprotocol/cowswap/issues/4869)) ([8cfd70b](https://github.com/cowprotocol/cowswap/commit/8cfd70b6000a1a021b76ad1f924829cb42cb2bcd))

## [0.14.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.13.2...widget-lib-v0.14.0) (2024-08-27)

### Features

- **progress-bar-v2:** replace progress bar with v2 ([#4033](https://github.com/cowprotocol/cowswap/issues/4033)) ([e199bff](https://github.com/cowprotocol/cowswap/commit/e199bff492ad3f91df23be34a829ebe1f246444a))

## [0.13.2](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.13.1...widget-lib-v0.13.2) (2024-07-05)

### Bug Fixes

- **widget-lib:** exclude cow-sdk from the bundle ([#4681](https://github.com/cowprotocol/cowswap/issues/4681)) ([a2eaa3d](https://github.com/cowprotocol/cowswap/commit/a2eaa3d9198a4e5245a70b3a6c71a23337fd0ce8))

## [0.13.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.13.0...widget-lib-v0.13.1) (2024-07-04)

### Bug Fixes

- **widget:** always listen activation event ([#4670](https://github.com/cowprotocol/cowswap/issues/4670)) ([#4673](https://github.com/cowprotocol/cowswap/issues/4673)) ([a74244d](https://github.com/cowprotocol/cowswap/commit/a74244d3ec35f4b96b52b87f0be2e4f082a240e5))

## [0.13.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.12.0...widget-lib-v0.13.0) (2024-06-18)

### Features

- **widget:** use flexible config for partner fee ([#4546](https://github.com/cowprotocol/cowswap/issues/4546)) ([e23194a](https://github.com/cowprotocol/cowswap/commit/e23194acde8d97b8b4f852e73f4f59b33e65a8b8))

### Bug Fixes

- **widget:** allow using walletconnect in widget mobile ([#4522](https://github.com/cowprotocol/cowswap/issues/4522)) ([ff58638](https://github.com/cowprotocol/cowswap/commit/ff586381f673314cf5d847f4f52da2e9e4015bea))

## [0.12.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.11.0...widget-lib-v0.12.0) (2024-05-29)

### Features

- **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))

## [0.11.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.10.1...widget-lib-v0.11.0) (2024-05-01)

### Features

- allow to modify the label of the fee and its tooltip ([a5dd0ba](https://github.com/cowprotocol/cowswap/commit/a5dd0baf19e6831fc135dd6c089e66ea0edd14f4))

## [0.10.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.10.0...widget-lib-v0.10.1) (2024-04-23)

### Bug Fixes

- **widget:** ignore self-fired events in Safe sdk bridge ([#4271](https://github.com/cowprotocol/cowswap/issues/4271)) ([b11eab7](https://github.com/cowprotocol/cowswap/commit/b11eab7ad5dff65bee8ffa2be8aef2fa913af5f2))

## [0.10.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.9.0...widget-lib-v0.10.0) (2024-04-15)

### Features

- add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
- Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))
- remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))
- up events lib version ([#4083](https://github.com/cowprotocol/cowswap/issues/4083)) ([02dbb0b](https://github.com/cowprotocol/cowswap/commit/02dbb0ba6f9f68a333a2fa2b78a961df4f301e36))
- update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
- **widget:** add parametrization for sounds, images, and disabling/hiding features ([#3815](https://github.com/cowprotocol/cowswap/issues/3815)) ([4a6c461](https://github.com/cowprotocol/cowswap/commit/4a6c46133c98bdcffa5ebcfc66cde3bd85b23d9f))
- **widget:** create an iframe event emitter ([#3821](https://github.com/cowprotocol/cowswap/issues/3821)) ([d9d1f23](https://github.com/cowprotocol/cowswap/commit/d9d1f23c1bf90a277a0d559c019b9794e43d8162))
- **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))
- **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
- **widget:** emit post order events ([#3819](https://github.com/cowprotocol/cowswap/issues/3819)) ([0df62ec](https://github.com/cowprotocol/cowswap/commit/0df62ec3679da1841e07f85292a5de5faab74cab))
- **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))
- **widget:** follow ups on issues raised ([#3840](https://github.com/cowprotocol/cowswap/issues/3840)) ([b1d621f](https://github.com/cowprotocol/cowswap/commit/b1d621f98fb1ec807b1ce5360e1f4d3d9cc50f4e))
- **widget:** implement all listeners and fix types ([#3817](https://github.com/cowprotocol/cowswap/issues/3817)) ([11a7226](https://github.com/cowprotocol/cowswap/commit/11a7226a5d3811139e784fe668ee2eebf2167a38))
- **widget:** improve JSON-RPC bridging between iFrame and provider ([#3824](https://github.com/cowprotocol/cowswap/issues/3824)) ([e9652e5](https://github.com/cowprotocol/cowswap/commit/e9652e5835d2c3ca0203349d4eae5b5874891cfc))
- **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))
- **widget:** misc to address issues and comments ([#3827](https://github.com/cowprotocol/cowswap/issues/3827)) ([ef83a5a](https://github.com/cowprotocol/cowswap/commit/ef83a5ad520d072ebf4f2cccde5fcfd0c1d88cd2))
- **widget:** optimise widget updates ([#3822](https://github.com/cowprotocol/cowswap/issues/3822)) ([d1a1e7d](https://github.com/cowprotocol/cowswap/commit/d1a1e7d05a1fed94dece9afbbc65f43af1a4f748))
- **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
- **widget:** subscribe to cow events (from iframe) ([#3816](https://github.com/cowprotocol/cowswap/issues/3816)) ([c3b8104](https://github.com/cowprotocol/cowswap/commit/c3b810435a6e64b12d28aac12cf785eef52f6531))
- **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
- **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))

### Bug Fixes

- update widget-lib readme ([#4090](https://github.com/cowprotocol/cowswap/issues/4090)) ([014e321](https://github.com/cowprotocol/cowswap/commit/014e3210e4195c75a02f8a5e330b98d41a74149c))
- **widget:** call disconnect when destroying the widget ([#4181](https://github.com/cowprotocol/cowswap/issues/4181)) ([93a460a](https://github.com/cowprotocol/cowswap/commit/93a460a0082bc7039dea3cc5c376cc2038917966))
- **widget:** don't reset palette state while navigating ([#4239](https://github.com/cowprotocol/cowswap/issues/4239)) ([b963bc3](https://github.com/cowprotocol/cowswap/commit/b963bc32739084e729320c49c50f51e8aed86616))
- **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))

## [0.9.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.7.1...widget-lib-v0.9.0) (2024-04-11)

### Features

- **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
- **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
- **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
- **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))

### Bug Fixes

- **widget:** call disconnect when destroying the widget ([#4181](https://github.com/cowprotocol/cowswap/issues/4181)) ([93a460a](https://github.com/cowprotocol/cowswap/commit/93a460a0082bc7039dea3cc5c376cc2038917966))

## [0.7.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.7.0...widget-lib-v0.7.1) (2024-03-22)

### Bug Fixes

- update widget-lib readme ([#4090](https://github.com/cowprotocol/cowswap/issues/4090)) ([014e321](https://github.com/cowprotocol/cowswap/commit/014e3210e4195c75a02f8a5e330b98d41a74149c))

## [0.7.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.6.0...widget-lib-v0.7.0) (2024-03-22)

### Features

- up events lib version ([#4083](https://github.com/cowprotocol/cowswap/issues/4083)) ([02dbb0b](https://github.com/cowprotocol/cowswap/commit/02dbb0ba6f9f68a333a2fa2b78a961df4f301e36))

## [0.6.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.5.0...widget-lib-v0.6.0) (2024-03-12)

### Features

- add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
- Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))

## [0.5.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.4.0...widget-lib-v0.5.0) (2024-02-22)

### Features

- **widget:** add parametrization for sounds, images, and disabling/hiding features ([#3815](https://github.com/cowprotocol/cowswap/issues/3815)) ([4a6c461](https://github.com/cowprotocol/cowswap/commit/4a6c46133c98bdcffa5ebcfc66cde3bd85b23d9f))
- **widget:** create an iframe event emitter ([#3821](https://github.com/cowprotocol/cowswap/issues/3821)) ([d9d1f23](https://github.com/cowprotocol/cowswap/commit/d9d1f23c1bf90a277a0d559c019b9794e43d8162))
- **widget:** emit post order events ([#3819](https://github.com/cowprotocol/cowswap/issues/3819)) ([0df62ec](https://github.com/cowprotocol/cowswap/commit/0df62ec3679da1841e07f85292a5de5faab74cab))
- **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))
- **widget:** follow ups on issues raised ([#3840](https://github.com/cowprotocol/cowswap/issues/3840)) ([b1d621f](https://github.com/cowprotocol/cowswap/commit/b1d621f98fb1ec807b1ce5360e1f4d3d9cc50f4e))
- **widget:** implement all listeners and fix types ([#3817](https://github.com/cowprotocol/cowswap/issues/3817)) ([11a7226](https://github.com/cowprotocol/cowswap/commit/11a7226a5d3811139e784fe668ee2eebf2167a38))
- **widget:** improve JSON-RPC bridging between iFrame and provider ([#3824](https://github.com/cowprotocol/cowswap/issues/3824)) ([e9652e5](https://github.com/cowprotocol/cowswap/commit/e9652e5835d2c3ca0203349d4eae5b5874891cfc))
- **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))
- **widget:** misc to address issues and comments ([#3827](https://github.com/cowprotocol/cowswap/issues/3827)) ([ef83a5a](https://github.com/cowprotocol/cowswap/commit/ef83a5ad520d072ebf4f2cccde5fcfd0c1d88cd2))
- **widget:** optimise widget updates ([#3822](https://github.com/cowprotocol/cowswap/issues/3822)) ([d1a1e7d](https://github.com/cowprotocol/cowswap/commit/d1a1e7d05a1fed94dece9afbbc65f43af1a4f748))
- **widget:** subscribe to cow events (from iframe) ([#3816](https://github.com/cowprotocol/cowswap/issues/3816)) ([c3b8104](https://github.com/cowprotocol/cowswap/commit/c3b810435a6e64b12d28aac12cf785eef52f6531))

## [0.4.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.3.0...widget-lib-v0.4.0) (2024-02-01)

### Features

- remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))

## [0.3.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.2.1...widget-lib-v0.3.0) (2024-01-17)

### Features

- update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
- **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))

### Bug Fixes

- **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))
