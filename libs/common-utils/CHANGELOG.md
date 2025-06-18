# Changelog

## [1.16.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.15.0...common-utils-v1.16.0) (2025-06-18)


### Features

* **analytics:** enhance UTM handling and analytics readiness checks ([#5779](https://github.com/cowprotocol/cowswap/issues/5779)) ([3fb616c](https://github.com/cowprotocol/cowswap/commit/3fb616cf8f5b5ad7c1736bd095912d692bbf1fd5))

## [1.15.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.14.0...common-utils-v1.15.0) (2025-05-28)


### Features

* **appzi:** disable appzi for Coinbase Wallet ([#5671](https://github.com/cowprotocol/cowswap/issues/5671)) ([381e4b1](https://github.com/cowprotocol/cowswap/commit/381e4b1e8a7b1eec9b99d9d21841c647d66a7420))

## [1.14.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.13.2...common-utils-v1.14.0) (2025-05-19)


### Features

* **bridge:** use real bridge provider ([#5588](https://github.com/cowprotocol/cowswap/issues/5588)) ([63981ab](https://github.com/cowprotocol/cowswap/commit/63981ab03a92e115d967ec482e9fec04abb9d9f5))


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.13.2](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.13.1...common-utils-v1.13.2) (2025-05-01)


### Bug Fixes

* **twap:** base dai error v2 ([#5658](https://github.com/cowprotocol/cowswap/issues/5658)) ([368926d](https://github.com/cowprotocol/cowswap/commit/368926d566e58e9558799ed7bebd4ae16f2e6ca3))

## [1.13.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.13.0...common-utils-v1.13.1) (2025-03-27)


### Bug Fixes

* **bridge:** fix getIsNativeToken ([#5565](https://github.com/cowprotocol/cowswap/issues/5565)) ([240134e](https://github.com/cowprotocol/cowswap/commit/240134ecf8ed46bd495bad78547b2c120920e1a1))

## [1.13.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.12.0...common-utils-v1.13.0) (2025-03-20)


### Features

* **bridge:** display tokens in selector from bridge provider ([#5489](https://github.com/cowprotocol/cowswap/issues/5489)) ([b5b08ee](https://github.com/cowprotocol/cowswap/commit/b5b08ee8da9c1746bd3b2147444c2090afdf3950))


### Bug Fixes

* **wallets:** disable coinbase in widget mobile ([#5516](https://github.com/cowprotocol/cowswap/issues/5516)) ([7233573](https://github.com/cowprotocol/cowswap/commit/7233573925c164de35017a3c48fc2af00d6106d2))

## [1.12.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.11.0...common-utils-v1.12.0) (2025-03-10)


### Features

* **swap:** unificate swap widget with other trade widgets ([#5443](https://github.com/cowprotocol/cowswap/issues/5443)) ([f8d47da](https://github.com/cowprotocol/cowswap/commit/f8d47da493e0e6203fac3d1c6cc5abe2af1de403))

## [1.11.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.10.0...common-utils-v1.11.0) (2025-02-25)


### Features

* **analytics:** migrate to GTM-based analytics ([#5360](https://github.com/cowprotocol/cowswap/issues/5360)) ([f404d02](https://github.com/cowprotocol/cowswap/commit/f404d0280d9d1d86cc249d70852a5c0ec9827475))

## [1.10.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.9.1...common-utils-v1.10.0) (2025-02-05)


### Features

* **limit-orders:** upgrade and redesign ([#5249](https://github.com/cowprotocol/cowswap/issues/5249)) ([5c868bb](https://github.com/cowprotocol/cowswap/commit/5c868bb794d648363afb88371178ddc35deaf7a7))

## [1.9.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.9.0...common-utils-v1.9.1) (2025-01-30)


### Bug Fixes

* type guard to make sure provider is a JsonRpcProvider ([#5357](https://github.com/cowprotocol/cowswap/issues/5357)) ([6a2e030](https://github.com/cowprotocol/cowswap/commit/6a2e030aa7f88ef207fad8910750b18dcf719503))

## [1.9.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.8.0...common-utils-v1.9.0) (2025-01-29)


### Features

* make useContract chainId aware and handle errors and loading state ([#5352](https://github.com/cowprotocol/cowswap/issues/5352)) ([d66e8ff](https://github.com/cowprotocol/cowswap/commit/d66e8ffc8668ad7563130228fb9bec28ae1d7e7e))


### Bug Fixes

* use provider.send('eth_chainId',[]) to avoid cached values ([#5354](https://github.com/cowprotocol/cowswap/issues/5354)) ([ad34521](https://github.com/cowprotocol/cowswap/commit/ad3452181287acb151b22d541feb156d208db482))

## [1.8.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.7.2...common-utils-v1.8.0) (2024-12-03)


### Features

* **base:** add base chain support ([#5044](https://github.com/cowprotocol/cowswap/issues/5044)) ([4cf0c91](https://github.com/cowprotocol/cowswap/commit/4cf0c91a300d6fcdc026364e74c45e5b2f729f2b))
* improve custom hook validation messages ([#5123](https://github.com/cowprotocol/cowswap/issues/5123)) ([91bab8d](https://github.com/cowprotocol/cowswap/commit/91bab8dc3b124a32790c3bb1955b01dd3a75ea7b))

## [1.7.2](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.7.1...common-utils-v1.7.2) (2024-09-30)


### Bug Fixes

* **amounts-display:** increase precision for small amounts ([#4793](https://github.com/cowprotocol/cowswap/issues/4793)) ([4195c68](https://github.com/cowprotocol/cowswap/commit/4195c68272eb1e7857458ef3f3b34b3a3864ed6b))

## [1.7.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.7.0...common-utils-v1.7.1) (2024-09-05)


### Bug Fixes

* **twap:** don't crash when slippage is 100 ([#4845](https://github.com/cowprotocol/cowswap/issues/4845)) ([f2f092c](https://github.com/cowprotocol/cowswap/commit/f2f092c66050b7fd9f5e7d56cf71d921c974af12))

## [1.7.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.6.1...common-utils-v1.7.0) (2024-08-27)


### Features

* **dynamic-slippage:** add tooltip and change message ([#4819](https://github.com/cowprotocol/cowswap/issues/4819)) ([75a16ac](https://github.com/cowprotocol/cowswap/commit/75a16aca98541b42583399b6aad3a99f7ced3ab7))

## [1.6.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.6.0...common-utils-v1.6.1) (2024-08-14)


### Bug Fixes

* replace cloudflare-ipfs.com with ipfs.io ([#4786](https://github.com/cowprotocol/cowswap/issues/4786)) ([a10df31](https://github.com/cowprotocol/cowswap/commit/a10df31010c34c90cffdad34b69a320a4167e119))

## [1.6.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.5.0...common-utils-v1.6.0) (2024-07-18)


### Features

* refactor and untangle analytics ([#4718](https://github.com/cowprotocol/cowswap/issues/4718)) ([ee396eb](https://github.com/cowprotocol/cowswap/commit/ee396eb1c4ef9a786810ed20b20020b4cb986460))

## [1.5.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.4.1...common-utils-v1.5.0) (2024-07-12)


### Features

* **hooks:** simulate hook transaction via Tenderly ([#4702](https://github.com/cowprotocol/cowswap/issues/4702)) ([19ee90a](https://github.com/cowprotocol/cowswap/commit/19ee90ab37638df29269bd47572898dcc94be8f4))
* **swap:** use smart slippage ([#4649](https://github.com/cowprotocol/cowswap/issues/4649)) ([ebb22ce](https://github.com/cowprotocol/cowswap/commit/ebb22cec497dfc696d32a2fd75ecc17cfd58eb41))

## [1.4.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.4.0...common-utils-v1.4.1) (2024-06-27)


### Bug Fixes

* **ethflow:** prevent ethflow on wrong network ([#4629](https://github.com/cowprotocol/cowswap/issues/4629)) ([2d5f29f](https://github.com/cowprotocol/cowswap/commit/2d5f29f3fe5c456057d19891ad5529d9d5d8d22d))

## [1.4.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.3.0...common-utils-v1.4.0) (2024-06-24)


### Features

* **explorer:** truncated orderId with CSS ([#4557](https://github.com/cowprotocol/cowswap/issues/4557)) ([88b5c06](https://github.com/cowprotocol/cowswap/commit/88b5c061beefdf7866a39a84a940ea01715e9c0b))
* **rebranding:** merge 📦 Big Package "Re-branding" 📦  ([#4543](https://github.com/cowprotocol/cowswap/issues/4543)) ([ce9ab43](https://github.com/cowprotocol/cowswap/commit/ce9ab4317f304c86e3e1ec37825379e427099518))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.2.0...common-utils-v1.3.0) (2024-06-18)


### Features

* **trade:** sync trade amounts between widgets ([#4521](https://github.com/cowprotocol/cowswap/issues/4521)) ([538bf04](https://github.com/cowprotocol/cowswap/commit/538bf04cc38744af04a719d5f4261f0951a07203))
* **twap:** add partner fee ([#4496](https://github.com/cowprotocol/cowswap/issues/4496)) ([a882522](https://github.com/cowprotocol/cowswap/commit/a88252272229728663941d291a4a3813d90e97a8))


### Bug Fixes

* disable appzi in widget mode ([#4549](https://github.com/cowprotocol/cowswap/issues/4549)) ([b04daf8](https://github.com/cowprotocol/cowswap/commit/b04daf865ff48946d4642c20a08e9cf3ba100494))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.1.1...common-utils-v1.2.0) (2024-05-29)


### Features

* add support for ERC-3770 on recipient addr ([#4418](https://github.com/cowprotocol/cowswap/issues/4418)) ([3e1732d](https://github.com/cowprotocol/cowswap/commit/3e1732dfb11f2cb4fdb815802e68c1d03af29c80))
* **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))

## [1.1.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.1.0...common-utils-v1.1.1) (2024-04-18)


### Bug Fixes

* **trade:** take time offset into account for quote and order validTo ([#4236](https://github.com/cowprotocol/cowswap/issues/4236)) ([7184ad4](https://github.com/cowprotocol/cowswap/commit/7184ad4655c3ae74fde084e306426fc49a11a360))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.0.1...common-utils-v1.1.0) (2024-04-11)


### Features

* **widget:** use custom sounds in widget ([#4162](https://github.com/cowprotocol/cowswap/issues/4162)) ([0dfd679](https://github.com/cowprotocol/cowswap/commit/0dfd67946a1ed383a5ffeeadee3044e45bd92eb0))


### Bug Fixes

* fix doesTokenMatchSymbolOrAddress app crash ([#4193](https://github.com/cowprotocol/cowswap/issues/4193)) ([721ff31](https://github.com/cowprotocol/cowswap/commit/721ff31a6b052f72073adcfd04717856d8530b2f))
* **recreate:** fix recreate buy amount for pairs with different decimal precision ([#4129](https://github.com/cowprotocol/cowswap/issues/4129)) ([64ebbd5](https://github.com/cowprotocol/cowswap/commit/64ebbd53d22f4c6da052039789485aedf85c35a8))
* sentry error toLowerCase ([#4191](https://github.com/cowprotocol/cowswap/issues/4191)) ([8fd5f19](https://github.com/cowprotocol/cowswap/commit/8fd5f19f5bbb3509212cd5d876c3a83f4330410b))

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/common-utils-v1.0.0...common-utils-v1.0.1) (2024-04-02)


### Bug Fixes

* **april-fools:** revert april fools ([#4116](https://github.com/cowprotocol/cowswap/issues/4116)) ([c8fb7d1](https://github.com/cowprotocol/cowswap/commit/c8fb7d1cb124f154e1b317c3e6fd503a65a12336))

## 1.0.0 (2024-03-29)


### Features

* **appzi:** add appzi triggers for limit orders ([#3676](https://github.com/cowprotocol/cowswap/issues/3676)) ([c20ee4a](https://github.com/cowprotocol/cowswap/commit/c20ee4a70e53bc2889a37d48d61145e4e5a5ee46))
* **appzi:** new appzi survey for limit orders ([#3918](https://github.com/cowprotocol/cowswap/issues/3918)) ([99e004a](https://github.com/cowprotocol/cowswap/commit/99e004ad410aefacfd2090423ef2e480ed48302e))
* **april-fools:** add `I'm Feeling Lucky` ([#4094](https://github.com/cowprotocol/cowswap/issues/4094)) ([895991b](https://github.com/cowprotocol/cowswap/commit/895991bbdaa6fb496483a8c369b1b0f445828db5))
* disable Appzi NPS in widget mode ([#3893](https://github.com/cowprotocol/cowswap/issues/3893)) ([e96c1d0](https://github.com/cowprotocol/cowswap/commit/e96c1d0e86a9cd92e22de195170b27e9997ea916))
* Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))
* **networks:** support Sepolia ([#3558](https://github.com/cowprotocol/cowswap/issues/3558)) ([ab8b179](https://github.com/cowprotocol/cowswap/commit/ab8b1794fb60da851f3fccdd861ebef4b18df30e))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))


### Bug Fixes

* better detection of transaction rejection ([#3907](https://github.com/cowprotocol/cowswap/issues/3907)) ([559f8af](https://github.com/cowprotocol/cowswap/commit/559f8af7e9f956be278e3550b9363530e8dde642))
* disable Christmas theme ([#3582](https://github.com/cowprotocol/cowswap/issues/3582)) ([94643fb](https://github.com/cowprotocol/cowswap/commit/94643fb3ca77aea37b772d823cc48665b441eeaa))
* don't request network switching when no chainId in URl ([#3785](https://github.com/cowprotocol/cowswap/issues/3785)) ([f3eaf6e](https://github.com/cowprotocol/cowswap/commit/f3eaf6e38594cfc9e53c231618f02b9f801c7d9f))
* **eth-flow:** prevent orders with expired quotes ([#3965](https://github.com/cowprotocol/cowswap/issues/3965)) ([f965020](https://github.com/cowprotocol/cowswap/commit/f965020cec5e0901138130e050939cc912ca4fd8))
* **eth-flow:** prevent orders with expired quotes ([#3965](https://github.com/cowprotocol/cowswap/issues/3965)) ([c49cf28](https://github.com/cowprotocol/cowswap/commit/c49cf28bea9f49fe188823db1217c13f67e87411))
* **permit:** presign ([#3698](https://github.com/cowprotocol/cowswap/issues/3698)) ([d1c8f65](https://github.com/cowprotocol/cowswap/commit/d1c8f652aa5f16d71221d29804fdc1de01472797))
* **permit:** report wrong permit to sentry for limit and swap flows ([#3565](https://github.com/cowprotocol/cowswap/issues/3565)) ([7067919](https://github.com/cowprotocol/cowswap/commit/706791978ca2e3412ceb33b5a1ff1ed878dd7f84))
* show nice approval rejection msg ([#3946](https://github.com/cowprotocol/cowswap/issues/3946)) ([01f25c3](https://github.com/cowprotocol/cowswap/commit/01f25c3f2f96dc4255c88c0995c60df3e9e025e4))
* **trade:** unify recipient displaying on confirm screen ([#3877](https://github.com/cowprotocol/cowswap/issues/3877)) ([5a86527](https://github.com/cowprotocol/cowswap/commit/5a8652776cd8d93500532f8881894d3a0d3a5a53))
* **twap:** allow creating orders with 100% slippage ([#3897](https://github.com/cowprotocol/cowswap/issues/3897)) ([05a604d](https://github.com/cowprotocol/cowswap/commit/05a604d0fd92f0ca0295b1ccef0cf4c7725ab24c))
