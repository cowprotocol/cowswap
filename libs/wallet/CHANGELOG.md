# Changelog

## [1.12.4](https://github.com/cowprotocol/cowswap/compare/wallet-v1.12.3...wallet-v1.12.4) (2025-06-18)


### Bug Fixes

* make order progress bar UI more stable ([#5834](https://github.com/cowprotocol/cowswap/issues/5834)) ([80cebd1](https://github.com/cowprotocol/cowswap/commit/80cebd1104a0a2e30e12ce8a4b3d62c212559cec))
* **widget:** do not request wallet capabilities for wallet-connect ([#5823](https://github.com/cowprotocol/cowswap/issues/5823)) ([49f22ad](https://github.com/cowprotocol/cowswap/commit/49f22ade0da4ffe95aaa11a6265cd4eeaf339e08))

## [1.12.3](https://github.com/cowprotocol/cowswap/compare/wallet-v1.12.2...wallet-v1.12.3) (2025-06-06)


### Bug Fixes

* **safe-wc:** pass chainId to wallet_sendCalls in the body of the request ([#5793](https://github.com/cowprotocol/cowswap/issues/5793)) ([8e21739](https://github.com/cowprotocol/cowswap/commit/8e21739a9829dc47533767b4d28fbba4dc0759f7))

## [1.12.2](https://github.com/cowprotocol/cowswap/compare/wallet-v1.12.1...wallet-v1.12.2) (2025-05-21)


### Bug Fixes

* detect EIP7702 account ([#5735](https://github.com/cowprotocol/cowswap/issues/5735)) ([bc30d5a](https://github.com/cowprotocol/cowswap/commit/bc30d5a9dbd23a64874df5f6e4776faec0e79277))

## [1.12.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.12.0...wallet-v1.12.1) (2025-05-19)


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.12.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.11.0...wallet-v1.12.0) (2025-03-27)


### Features

* **bridge:** disable bridging sc wallets ([#5536](https://github.com/cowprotocol/cowswap/issues/5536)) ([98372ec](https://github.com/cowprotocol/cowswap/commit/98372ec6b5d2fd8b4f97147197154ae3830497d8))

## [1.11.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.10.1...wallet-v1.11.0) (2025-03-20)


### Features

* **bridge:** select sell token from another chain ([#5521](https://github.com/cowprotocol/cowswap/issues/5521)) ([f0fc900](https://github.com/cowprotocol/cowswap/commit/f0fc900c7035e47331e07b0d5b7a31674dc7bc13))


### Bug Fixes

* **wallets:** disable coinbase in widget mobile ([#5516](https://github.com/cowprotocol/cowswap/issues/5516)) ([7233573](https://github.com/cowprotocol/cowswap/commit/7233573925c164de35017a3c48fc2af00d6106d2))

## [1.10.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.10.0...wallet-v1.10.1) (2025-02-17)


### Bug Fixes

* do not check capabilities in mobile wc ([#5429](https://github.com/cowprotocol/cowswap/issues/5429)) ([26b907d](https://github.com/cowprotocol/cowswap/commit/26b907dad4c7310bdc3e560e5592fdeb3db11b95))

## [1.10.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.9.3...wallet-v1.10.0) (2025-02-12)


### Features

* support EIP-5792 batch tx for Safe via WC ([#5417](https://github.com/cowprotocol/cowswap/issues/5417)) ([8aa612f](https://github.com/cowprotocol/cowswap/commit/8aa612f7b93a40d69efa364a10634863bc743e95))

## [1.9.3](https://github.com/cowprotocol/cowswap/compare/wallet-v1.9.2...wallet-v1.9.3) (2025-02-03)


### Bug Fixes

* display Metamask warning only for extension/mobile wallets ([#5370](https://github.com/cowprotocol/cowswap/issues/5370)) ([abb5683](https://github.com/cowprotocol/cowswap/commit/abb56834b1e21029ca66362f3b721cd47e080547))

## [1.9.2](https://github.com/cowprotocol/cowswap/compare/wallet-v1.9.1...wallet-v1.9.2) (2025-01-30)


### Bug Fixes

* type guard to make sure provider is a JsonRpcProvider ([#5357](https://github.com/cowprotocol/cowswap/issues/5357)) ([6a2e030](https://github.com/cowprotocol/cowswap/commit/6a2e030aa7f88ef207fad8910750b18dcf719503))

## [1.9.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.9.0...wallet-v1.9.1) (2025-01-29)


### Bug Fixes

* use provider.send('eth_chainId',[]) to avoid cached values ([#5354](https://github.com/cowprotocol/cowswap/issues/5354)) ([ad34521](https://github.com/cowprotocol/cowswap/commit/ad3452181287acb151b22d541feb156d208db482))

## [1.9.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.8.1...wallet-v1.9.0) (2025-01-09)


### Features

* **wallets:** reapply "feat(wallets): add metaMask SDK connector ([#5028](https://github.com/cowprotocol/cowswap/issues/5028))" ([#5215](https://github.com/cowprotocol/cowswap/issues/5215)) ([#5223](https://github.com/cowprotocol/cowswap/issues/5223)) ([28fcda9](https://github.com/cowprotocol/cowswap/commit/28fcda95c7002a528c538917450bc38b67c0a5eb))

## [1.8.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.8.0...wallet-v1.8.1) (2024-12-19)


### Bug Fixes

* allow any safe-like apps ([26e68ab](https://github.com/cowprotocol/cowswap/commit/26e68ab1d75905e33cc0c44fec050697447377be))

## [1.8.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.7.0...wallet-v1.8.0) (2024-12-18)


### Features

* **wallets:** add coinshift to allowed domains ([#4931](https://github.com/cowprotocol/cowswap/issues/4931)) ([8be3a45](https://github.com/cowprotocol/cowswap/commit/8be3a458d7918bd79c3f2bb636620c77b560f3b2))
* **wallets:** add metaMask SDK connector ([#5028](https://github.com/cowprotocol/cowswap/issues/5028)) ([fe8f376](https://github.com/cowprotocol/cowswap/commit/fe8f3767593684dc9d825d603a894c3b0934d894))

## [1.7.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.6.1...wallet-v1.7.0) (2024-12-03)


### Features

* **base:** add base chain support ([#5044](https://github.com/cowprotocol/cowswap/issues/5044)) ([4cf0c91](https://github.com/cowprotocol/cowswap/commit/4cf0c91a300d6fcdc026364e74c45e5b2f729f2b))
* **volume-fee:** add volume fee for Safe ([#5139](https://github.com/cowprotocol/cowswap/issues/5139)) ([bb14c6a](https://github.com/cowprotocol/cowswap/commit/bb14c6a6ecfaba7d1a9a1da5366fac054efb97aa))

## [1.6.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.6.0...wallet-v1.6.1) (2024-10-18)


### Bug Fixes

* **widget:** ignore selected eip6963 provider when in widget ([#5009](https://github.com/cowprotocol/cowswap/issues/5009)) ([3f8446b](https://github.com/cowprotocol/cowswap/commit/3f8446b48a4f493448b262959b943756a24382d9))

## [1.6.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.5.2...wallet-v1.6.0) (2024-09-30)


### Features

* **hooks-store:** support iframe hook-dapps ([#4885](https://github.com/cowprotocol/cowswap/issues/4885)) ([5116f29](https://github.com/cowprotocol/cowswap/commit/5116f296a0e4866d0a51a806b7abe55e809d26e9))

## [1.5.2](https://github.com/cowprotocol/cowswap/compare/wallet-v1.5.1...wallet-v1.5.2) (2024-09-05)


### Bug Fixes

* **wallet:** connect eagerly only once ([#4846](https://github.com/cowprotocol/cowswap/issues/4846)) ([65142d5](https://github.com/cowprotocol/cowswap/commit/65142d5b3d2d2d5ee750b5d6a18ef2b0702bc957))

## [1.5.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.5.0...wallet-v1.5.1) (2024-06-25)


### Bug Fixes

* update cow token logo ([#4608](https://github.com/cowprotocol/cowswap/issues/4608)) ([51ad5f4](https://github.com/cowprotocol/cowswap/commit/51ad5f47a7e4bf0e4ea8b9998774a82874f47306))

## [1.5.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.4.1...wallet-v1.5.0) (2024-06-24)


### Features

* **rebranding:** merge 📦 Big Package "Re-branding" 📦  ([#4543](https://github.com/cowprotocol/cowswap/issues/4543)) ([ce9ab43](https://github.com/cowprotocol/cowswap/commit/ce9ab4317f304c86e3e1ec37825379e427099518))
* theme unification and cleaning ([#4580](https://github.com/cowprotocol/cowswap/issues/4580)) ([c1538b1](https://github.com/cowprotocol/cowswap/commit/c1538b16d9c890c95d73ea92ffb93b2065233d90))


### Bug Fixes

* detect a connected user in a safe ([#4508](https://github.com/cowprotocol/cowswap/issues/4508)) ([0fed667](https://github.com/cowprotocol/cowswap/commit/0fed667d7063c9db07f5cd5671dcc36ee25ab685))
* **sentry:** handle unhandled exception calling PUBLIC_disconnectSite ([#4563](https://github.com/cowprotocol/cowswap/issues/4563)) ([d9dd60c](https://github.com/cowprotocol/cowswap/commit/d9dd60c3563c90dbd81b65e76df55beac9084f26))

## [1.4.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.4.0...wallet-v1.4.1) (2024-06-18)


### Bug Fixes

* connect wallet in e2e tests ([#4531](https://github.com/cowprotocol/cowswap/issues/4531)) ([0b5c369](https://github.com/cowprotocol/cowswap/commit/0b5c369f633151fc7f77768d6f39a4580d1c553f))
* display network selector for Rabby + Safe ([#4510](https://github.com/cowprotocol/cowswap/issues/4510)) ([1bfafeb](https://github.com/cowprotocol/cowswap/commit/1bfafeb1b10ea8b5622827a3f84f19faeab95b70))

## [1.4.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.3.0...wallet-v1.4.0) (2024-05-29)


### Features

* **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))


### Bug Fixes

* **wallets:** don't reset wallet on network switching ([#4497](https://github.com/cowprotocol/cowswap/issues/4497)) ([e11a858](https://github.com/cowprotocol/cowswap/commit/e11a85810b881b00b2c6cce0ef040964344122c3))
* **wallets:** update provider when eip6963 wallet changed ([#4483](https://github.com/cowprotocol/cowswap/issues/4483)) ([7c37566](https://github.com/cowprotocol/cowswap/commit/7c37566cce83a2f23c7a63b71717edf67488cb74))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.2.0...wallet-v1.3.0) (2024-05-22)


### Features

* **usd-estimation:** add defillama price source ([#4341](https://github.com/cowprotocol/cowswap/issues/4341)) ([96a0343](https://github.com/cowprotocol/cowswap/commit/96a03437710b807c966debdaa8ce5219ddaff7a4))
* **wallets:** support eip6963 multi-injected providers ([#4416](https://github.com/cowprotocol/cowswap/issues/4416)) ([85a78bb](https://github.com/cowprotocol/cowswap/commit/85a78bbfe9b0a8fe5428b25aba0b38944b10987d))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.1.0...wallet-v1.2.0) (2024-05-14)


### Features

* support counterfactual safes ([#4063](https://github.com/cowprotocol/cowswap/issues/4063)) ([43f86b8](https://github.com/cowprotocol/cowswap/commit/43f86b889b963341f2214a23ee21ae49ae550a8f))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/wallet-v1.0.2...wallet-v1.1.0) (2024-05-01)


### Features

* hide tooltips on scroll ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* improve UX for tooltips on mobile ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* unify all tooltips so the behavior is coherent ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))

## [1.0.2](https://github.com/cowprotocol/cowswap/compare/wallet-v1.0.1...wallet-v1.0.2) (2024-04-18)


### Bug Fixes

* **wallet:** reset safe info when there's no safe data ([#4246](https://github.com/cowprotocol/cowswap/issues/4246)) ([06aa91c](https://github.com/cowprotocol/cowswap/commit/06aa91c3ec8e63e3ed76e623a21ad567b669b062))
* **widget:** adjust rpc timeout conditions ([#4232](https://github.com/cowprotocol/cowswap/issues/4232)) ([4fa95dd](https://github.com/cowprotocol/cowswap/commit/4fa95dd8d21c7277ac3e4af6f17cadfd337e78f4))

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/wallet-v1.0.0...wallet-v1.0.1) (2024-04-11)


### Bug Fixes

* **safe:** add replaced status to transactions ([#4125](https://github.com/cowprotocol/cowswap/issues/4125)) ([6714081](https://github.com/cowprotocol/cowswap/commit/671408195d9e8abef4e39dcc7a86b82bc3707556))

## 1.0.0 (2024-03-29)


### Features

* account icon improvements ([#3739](https://github.com/cowprotocol/cowswap/issues/3739)) ([9888fa1](https://github.com/cowprotocol/cowswap/commit/9888fa1dbdb2c72de3ffa13254fb1d401e1f9e4f))
* **networks:** support Sepolia ([#3558](https://github.com/cowprotocol/cowswap/issues/3558)) ([ab8b179](https://github.com/cowprotocol/cowswap/commit/ab8b1794fb60da851f3fccdd861ebef4b18df30e))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))
* **safe:** rely on safeInfo and iframe detection to identify when loaded as SafeApp ([#3570](https://github.com/cowprotocol/cowswap/issues/3570)) ([93d9cba](https://github.com/cowprotocol/cowswap/commit/93d9cba3f1f2bff8960de79ede04f0b03a69d1bc))


### Bug Fixes

* **permit:** presign ([#3698](https://github.com/cowprotocol/cowswap/issues/3698)) ([d1c8f65](https://github.com/cowprotocol/cowswap/commit/d1c8f652aa5f16d71221d29804fdc1de01472797))
* remove issue with non-argent smart-contract wallet throwing too many unhandled errors ([#3588](https://github.com/cowprotocol/cowswap/issues/3588)) ([a2a40b1](https://github.com/cowprotocol/cowswap/commit/a2a40b155ba8d42289653f7ff2aa212e2552fce1))
* **trezor:** display correct message for connection error ([#3986](https://github.com/cowprotocol/cowswap/issues/3986)) ([dbb0ea7](https://github.com/cowprotocol/cowswap/commit/dbb0ea7c71c36e05d163b4e29a9b9a10a35bbeb0))
