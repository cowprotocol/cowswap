# Changelog

## [1.4.0](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.3.4...balances-and-allowances-v1.4.0) (2025-06-18)


### Features

* **bridge:** swap and bridge refactoring + progress UI ([#5755](https://github.com/cowprotocol/cowswap/issues/5755)) ([8a4cb5c](https://github.com/cowprotocol/cowswap/commit/8a4cb5c497cdd006df860a9240611e12cff3e60c))

## [1.3.4](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.3.3...balances-and-allowances-v1.3.4) (2025-05-19)


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.3.3](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.3.2...balances-and-allowances-v1.3.3) (2025-04-01)


### Bug Fixes

* do not use RPC node when wallet is connected ([#5585](https://github.com/cowprotocol/cowswap/issues/5585)) ([d51fe53](https://github.com/cowprotocol/cowswap/commit/d51fe5394f6c13ed28ac1725331bfb505b8275a5))

## [1.3.2](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.3.1...balances-and-allowances-v1.3.2) (2025-03-27)


### Bug Fixes

* **balances:** updated balances on network changes ([#5569](https://github.com/cowprotocol/cowswap/issues/5569)) ([1aaf6b5](https://github.com/cowprotocol/cowswap/commit/1aaf6b58a205be331e6668bdf411f93f6cbb32ca))

## [1.3.1](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.3.0...balances-and-allowances-v1.3.1) (2025-03-24)


### Bug Fixes

* **swap:** wait for a optimal quote before eth-flow ([#5530](https://github.com/cowprotocol/cowswap/issues/5530)) ([acd0f49](https://github.com/cowprotocol/cowswap/commit/acd0f493c28af15451b9cae0af34c80917bfb586))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.2.0...balances-and-allowances-v1.3.0) (2025-03-20)


### Features

* **bridge:** display tokens in selector from bridge provider ([#5489](https://github.com/cowprotocol/cowswap/issues/5489)) ([b5b08ee](https://github.com/cowprotocol/cowswap/commit/b5b08ee8da9c1746bd3b2147444c2090afdf3950))
* **bridge:** do not fetch balances too often ([#5509](https://github.com/cowprotocol/cowswap/issues/5509)) ([a673668](https://github.com/cowprotocol/cowswap/commit/a6736681aadc2e1e42dea3ca13827728976e4ce2))


### Bug Fixes

* **balances:** do not false skip balances fetching ([#5529](https://github.com/cowprotocol/cowswap/issues/5529)) ([f1de831](https://github.com/cowprotocol/cowswap/commit/f1de831143689d12cea15f0348d00561d77bcf68))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.1.1...balances-and-allowances-v1.2.0) (2024-12-03)


### Features

* allow adding networks without invalidating local-storage ([#5134](https://github.com/cowprotocol/cowswap/issues/5134)) ([995b4c0](https://github.com/cowprotocol/cowswap/commit/995b4c05da90356c6621a92dc58efbd6f37349ff))
* improve custom hook validation messages ([#5123](https://github.com/cowprotocol/cowswap/issues/5123)) ([91bab8d](https://github.com/cowprotocol/cowswap/commit/91bab8dc3b124a32790c3bb1955b01dd3a75ea7b))

## [1.1.1](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.1.0...balances-and-allowances-v1.1.1) (2024-11-21)


### Bug Fixes

* **yield:** show green banner only when vampire attack is ready ([#5064](https://github.com/cowprotocol/cowswap/issues/5064)) ([cd9f2e1](https://github.com/cowprotocol/cowswap/commit/cd9f2e18b36a280d25c8727f730414c95ea90979))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/balances-and-allowances-v1.0.0...balances-and-allowances-v1.1.0) (2024-11-06)


### Features

* **yield:** define token category by default for selection ([#5018](https://github.com/cowprotocol/cowswap/issues/5018)) ([7c18b7d](https://github.com/cowprotocol/cowswap/commit/7c18b7d85de6feac9c7e64740a93572f3af3c273))
* **yield:** display cow amm banner conditionally ([#5035](https://github.com/cowprotocol/cowswap/issues/5035)) ([1a517a3](https://github.com/cowprotocol/cowswap/commit/1a517a3f21b94c10b8e59e68bc49a569c1be904b))
* **yield:** fetch balances for LP-tokens ([#5005](https://github.com/cowprotocol/cowswap/issues/5005)) ([2877df5](https://github.com/cowprotocol/cowswap/commit/2877df52be2fd519a20157a1cd91a2e18e954dae))
* **yield:** use lp-token in widget ([#5013](https://github.com/cowprotocol/cowswap/issues/5013)) ([b66d206](https://github.com/cowprotocol/cowswap/commit/b66d2068a9f3bcaddc8da7df5499c17fc05f693f))


### Bug Fixes

* **hooks:** support native currency rescuing from proxy ([#5062](https://github.com/cowprotocol/cowswap/issues/5062)) ([843e00b](https://github.com/cowprotocol/cowswap/commit/843e00b0e84e8060b9241c6d4767962df3de96eb))

## 1.0.0 (2024-07-12)


### Bug Fixes

* **limit:** clear limit output amount when price is empty ([#4678](https://github.com/cowprotocol/cowswap/issues/4678)) ([0620a9a](https://github.com/cowprotocol/cowswap/commit/0620a9a70a31687f70ec4abc6da280d54a823cb8))
