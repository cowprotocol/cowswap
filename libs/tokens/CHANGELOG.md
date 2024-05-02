# Changelog

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/tokens-v1.1.1...tokens-v1.2.0) (2024-05-02)


### Features

* add coingecko token list to Gnosis chain ([#4305](https://github.com/cowprotocol/cowswap/issues/4305)) ([41d5067](https://github.com/cowprotocol/cowswap/commit/41d5067c7227a321f582a381e039e05997b79908))

## [1.1.1](https://github.com/cowprotocol/cowswap/compare/tokens-v1.1.0...tokens-v1.1.1) (2024-04-18)


### Bug Fixes

* display initial for tokens without image ([#4230](https://github.com/cowprotocol/cowswap/issues/4230)) ([ca7d62c](https://github.com/cowprotocol/cowswap/commit/ca7d62c1469bb54a6955d3007a779b23ea3985e6))
* **sentry:** ignore some sentry geoblock errors ([#4250](https://github.com/cowprotocol/cowswap/issues/4250)) ([daf929e](https://github.com/cowprotocol/cowswap/commit/daf929ee5f628acac94f5bacef57f1db5cdd46c8))
* **trade:** take time offset into account for quote and order validTo ([#4236](https://github.com/cowprotocol/cowswap/issues/4236)) ([7184ad4](https://github.com/cowprotocol/cowswap/commit/7184ad4655c3ae74fde084e306426fc49a11a360))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/tokens-v1.0.1...tokens-v1.1.0) (2024-04-11)


### Features

* **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/tokens-v1.0.0...tokens-v1.0.1) (2024-04-02)


### Bug Fixes

* **april-fools:** revert april fools ([#4116](https://github.com/cowprotocol/cowswap/issues/4116)) ([c8fb7d1](https://github.com/cowprotocol/cowswap/commit/c8fb7d1cb124f154e1b317c3e6fd503a65a12336))

## 1.0.0 (2024-03-29)


### Features

* add tag styling for tokenlist ([#3686](https://github.com/cowprotocol/cowswap/issues/3686)) ([d4d87a6](https://github.com/cowprotocol/cowswap/commit/d4d87a628eb4c41587071ce56e756a6253c7e77b))
* **april-fools:** add `I'm Feeling Lucky` ([#4094](https://github.com/cowprotocol/cowswap/issues/4094)) ([895991b](https://github.com/cowprotocol/cowswap/commit/895991bbdaa6fb496483a8c369b1b0f445828db5))
* limit assets to trade for US users ([#3853](https://github.com/cowprotocol/cowswap/issues/3853)) ([c6e4c0d](https://github.com/cowprotocol/cowswap/commit/c6e4c0d12a0b1431e3a4e06b9f164671599587ef))
* **networks:** support Sepolia ([#3558](https://github.com/cowprotocol/cowswap/issues/3558)) ([ab8b179](https://github.com/cowprotocol/cowswap/commit/ab8b1794fb60da851f3fccdd861ebef4b18df30e))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))
* **token-lists:** limit token lists by 5000 tokens ([#3881](https://github.com/cowprotocol/cowswap/issues/3881)) ([d8a5816](https://github.com/cowprotocol/cowswap/commit/d8a581652fcca40fc8ec2f63e904855b616951c6))
* **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))


### Bug Fixes

* **april-fools:** replace dpaste lists with a version stored on github ([#4112](https://github.com/cowprotocol/cowswap/issues/4112)) ([9ba35d9](https://github.com/cowprotocol/cowswap/commit/9ba35d9ba1f45b834f172d030e27d29ebc6b9774))
* don't crash when there is a new network in lists state ([#3589](https://github.com/cowprotocol/cowswap/issues/3589)) ([246db74](https://github.com/cowprotocol/cowswap/commit/246db7408b14ac737f39a7cde9717e39c84be26d))
* don't crash when there is no fav tokens in new network ([#3651](https://github.com/cowprotocol/cowswap/issues/3651)) ([c6aa91e](https://github.com/cowprotocol/cowswap/commit/c6aa91eb144a427ee5500602067f8140b79719f1))
* merge localStorage state with initial state to prevent empty states ([#3604](https://github.com/cowprotocol/cowswap/issues/3604)) ([9cd4bf5](https://github.com/cowprotocol/cowswap/commit/9cd4bf53807e307c213c547c762907b71bb5b343))
* push log into Sentry when US user is detected ([#3924](https://github.com/cowprotocol/cowswap/issues/3924)) ([bce2f42](https://github.com/cowprotocol/cowswap/commit/bce2f425320b4fca7b901e35860f4cb440bf581d))
* **token-search:** fix token search results ([#3607](https://github.com/cowprotocol/cowswap/issues/3607)) ([955d93f](https://github.com/cowprotocol/cowswap/commit/955d93fd2fce614ff6eb85b358f72ba6c77a1f51))
* **token-search:** ignore search input case when triggering the search ([#3620](https://github.com/cowprotocol/cowswap/issues/3620)) ([4568b21](https://github.com/cowprotocol/cowswap/commit/4568b21d31825eed1197d3e08c7f6f8f071cdf54))
* **tokens:** don't list tokens from other chains ([#4060](https://github.com/cowprotocol/cowswap/issues/4060)) ([f1fd0fc](https://github.com/cowprotocol/cowswap/commit/f1fd0fcce90bc53a493e412cb175497c6e74b6a8))
* **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([025d223](https://github.com/cowprotocol/cowswap/commit/025d2238fd06e14d2bd471f73f02379e86ff94c1))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([eed09c8](https://github.com/cowprotocol/cowswap/commit/eed09c81f941c5d5e11cc9daed92aaf0faa0922e))
