# Changelog

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
