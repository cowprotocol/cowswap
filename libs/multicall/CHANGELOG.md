# Changelog

## [2.0.0](https://github.com/cowprotocol/cowswap/compare/multicall-v1.3.2...multicall-v2.0.0) (2026-01-28)


### ⚠ BREAKING CHANGES

* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847))

### Features

* **limit:** load more orders button [#6853](https://github.com/cowprotocol/cowswap/issues/6853) ([b647396](https://github.com/cowprotocol/cowswap/commit/b647396c09f00b878ae06d0b0932c40512c0cba1))
* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847)) ([1c5d115](https://github.com/cowprotocol/cowswap/commit/1c5d11516d0ddb997b0ebbb4eee4adcb491204a4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/common-const bumped to 2.0.0
    * @cowprotocol/cowswap-abis bumped to 2.0.0
    * @cowprotocol/types bumped to 3.0.0
    * @cowprotocol/wallet bumped to 2.0.0
    * @cowprotocol/wallet-provider bumped to 2.0.0

## [1.3.2](https://github.com/cowprotocol/cowswap/compare/multicall-v1.3.1...multicall-v1.3.2) (2026-01-09)


### Bug Fixes

* **multicall:** build fix ([#6776](https://github.com/cowprotocol/cowswap/issues/6776)) ([#6777](https://github.com/cowprotocol/cowswap/issues/6777)) ([e94a3d9](https://github.com/cowprotocol/cowswap/commit/e94a3d94e19245c3b5861f756673d257f3c159b4))

## [1.3.1](https://github.com/cowprotocol/cowswap/compare/multicall-v1.3.0...multicall-v1.3.1) (2025-12-24)


### Bug Fixes

* brave mobile browser and wallet connection ([#6619](https://github.com/cowprotocol/cowswap/issues/6619)) ([a0bbe9e](https://github.com/cowprotocol/cowswap/commit/a0bbe9e682fff2c86af4e1a66d1c59111c61dd75))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/multicall-v1.2.3...multicall-v1.3.0) (2025-11-24)


### Features

* **internationalization:** add internationalization to CoW Swap ([#6198](https://github.com/cowprotocol/cowswap/issues/6198)) ([bec1e54](https://github.com/cowprotocol/cowswap/commit/bec1e54643d9b20a8b6517eae188993e364fed90))

## [1.2.3](https://github.com/cowprotocol/cowswap/compare/multicall-v1.2.2...multicall-v1.2.3) (2025-08-12)


### Bug Fixes

* **balances:** skip balances update from old blocks ([#6137](https://github.com/cowprotocol/cowswap/issues/6137)) ([0748151](https://github.com/cowprotocol/cowswap/commit/074815141e2992171cf752ef395a5dc34ecf6176))

## [1.2.2](https://github.com/cowprotocol/cowswap/compare/multicall-v1.2.1...multicall-v1.2.2) (2025-08-05)


### Bug Fixes

* get relevant provider network for multicall ([#6093](https://github.com/cowprotocol/cowswap/issues/6093)) ([47f4cfb](https://github.com/cowprotocol/cowswap/commit/47f4cfbea5f2a394a0fc10c9b90d313a46613373))

## [1.2.1](https://github.com/cowprotocol/cowswap/compare/multicall-v1.2.0...multicall-v1.2.1) (2025-07-31)


### Bug Fixes

* **safe:** check provider chainId for multicall provider ([#6057](https://github.com/cowprotocol/cowswap/issues/6057)) ([490436a](https://github.com/cowprotocol/cowswap/commit/490436a6b482f75876e471ba45ff1f7e02017ca0))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/multicall-v1.1.2...multicall-v1.2.0) (2025-07-03)


### Features

* **bridge:** display account proxy ([#5881](https://github.com/cowprotocol/cowswap/issues/5881)) ([0692597](https://github.com/cowprotocol/cowswap/commit/0692597adf45b469b5a547057b64e79296714ee2))

## [1.1.2](https://github.com/cowprotocol/cowswap/compare/multicall-v1.1.1...multicall-v1.1.2) (2025-05-19)


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.1.1](https://github.com/cowprotocol/cowswap/compare/multicall-v1.1.0...multicall-v1.1.1) (2025-04-01)


### Bug Fixes

* do not use RPC node when wallet is connected ([#5585](https://github.com/cowprotocol/cowswap/issues/5585)) ([d51fe53](https://github.com/cowprotocol/cowswap/commit/d51fe5394f6c13ed28ac1725331bfb505b8275a5))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/multicall-v1.0.0...multicall-v1.1.0) (2025-03-20)


### Features

* **bridge:** display tokens in selector from bridge provider ([#5489](https://github.com/cowprotocol/cowswap/issues/5489)) ([b5b08ee](https://github.com/cowprotocol/cowswap/commit/b5b08ee8da9c1746bd3b2147444c2090afdf3950))
* **bridge:** do not fetch balances too often ([#5509](https://github.com/cowprotocol/cowswap/issues/5509)) ([a673668](https://github.com/cowprotocol/cowswap/commit/a6736681aadc2e1e42dea3ca13827728976e4ce2))


### Bug Fixes

* **balances:** do not false skip balances fetching ([#5529](https://github.com/cowprotocol/cowswap/issues/5529)) ([f1de831](https://github.com/cowprotocol/cowswap/commit/f1de831143689d12cea15f0348d00561d77bcf68))

## 1.0.0 (2024-11-06)


### Features

* **yield:** fetch balances for LP-tokens ([#5005](https://github.com/cowprotocol/cowswap/issues/5005)) ([2877df5](https://github.com/cowprotocol/cowswap/commit/2877df52be2fd519a20157a1cd91a2e18e954dae))
