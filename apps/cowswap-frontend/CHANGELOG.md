# Changelog

## [1.109.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.108.2...cowswap-v1.109.0) (2025-06-18)


### Features

* **analytics:** enhance UTM handling and analytics readiness checks ([#5779](https://github.com/cowprotocol/cowswap/issues/5779)) ([3fb616c](https://github.com/cowprotocol/cowswap/commit/3fb616cf8f5b5ad7c1736bd095912d692bbf1fd5))
* hide non-prod envs from search engines ([#5800](https://github.com/cowprotocol/cowswap/issues/5800)) ([5ed181d](https://github.com/cowprotocol/cowswap/commit/5ed181d2a9f1f61f3bed3c971ea4eac4007277ea))


### Bug Fixes

* **limit-orders:** display prices in orders table ([#5808](https://github.com/cowprotocol/cowswap/issues/5808)) ([6393e2c](https://github.com/cowprotocol/cowswap/commit/6393e2c7a5ce0b537dcd10a4564f56106c374beb))
* make order progress bar UI more stable ([#5834](https://github.com/cowprotocol/cowswap/issues/5834)) ([80cebd1](https://github.com/cowprotocol/cowswap/commit/80cebd1104a0a2e30e12ce8a4b3d62c212559cec))
* reduce rerenders count and theme recalculation ([#5831](https://github.com/cowprotocol/cowswap/issues/5831)) ([96a7a35](https://github.com/cowprotocol/cowswap/commit/96a7a350f366615a1e5149097541b5e2ccf880f1))
* refetch quote when slippage changed ([#5824](https://github.com/cowprotocol/cowswap/issues/5824)) ([00238b9](https://github.com/cowprotocol/cowswap/commit/00238b9b526d6f71c16a46704dc22290234d10a1))
* **service-worker:** disable verbose workbox logging in production ([#5815](https://github.com/cowprotocol/cowswap/issues/5815)) ([cb53ccb](https://github.com/cowprotocol/cowswap/commit/cb53ccb5a39a8857dfc030f0fb13869060211c8a))
* **slippage:** cap auto-slippage with 50% ([#5807](https://github.com/cowprotocol/cowswap/issues/5807)) ([1bea824](https://github.com/cowprotocol/cowswap/commit/1bea824717d5e74c5389b7da7d99ac5ca4940925))
* **token-logo:** fix network logo size in mobile ([#5809](https://github.com/cowprotocol/cowswap/issues/5809)) ([6c4d2f4](https://github.com/cowprotocol/cowswap/commit/6c4d2f47771f3868a3fe530bc9ac1779175b2db5))
* **trade:** fix sellToken comparing for quote fetch skip ([#5802](https://github.com/cowprotocol/cowswap/issues/5802)) ([7786c99](https://github.com/cowprotocol/cowswap/commit/7786c99257b75b68c0d7436cd0676c50dd309d1e))
* **trade:** hide auto-slippage warning when amounts are not set ([#5811](https://github.com/cowprotocol/cowswap/issues/5811)) ([a1898bf](https://github.com/cowprotocol/cowswap/commit/a1898bf987156440bfad7e86a1350bf758e8ffc8))
* **trade:** reset loading state when confirm wasn't happen ([#5818](https://github.com/cowprotocol/cowswap/issues/5818)) ([38883ad](https://github.com/cowprotocol/cowswap/commit/38883ad6b137659a11b1ef766231a989b0b16d14))
* update to latest app-data ([#5762](https://github.com/cowprotocol/cowswap/issues/5762)) ([54e6882](https://github.com/cowprotocol/cowswap/commit/54e68826ea00c93834cf8f7cf1c17c7b6c4831e6))
* **widget:** do not request wallet capabilities for wallet-connect ([#5823](https://github.com/cowprotocol/cowswap/issues/5823)) ([49f22ad](https://github.com/cowprotocol/cowswap/commit/49f22ade0da4ffe95aaa11a6265cd4eeaf339e08))
* **widget:** get slippage value directly from active quote ([#5830](https://github.com/cowprotocol/cowswap/issues/5830)) ([154e374](https://github.com/cowprotocol/cowswap/commit/154e37490b7d558a3b182269bee6936751d3eba4))

## [1.108.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.108.1...cowswap-v1.108.2) (2025-06-06)


### Bug Fixes

* empty change to trigger cowswap deployment ([b06ba6a](https://github.com/cowprotocol/cowswap/commit/b06ba6ad20adfbbfbe3366f4eed787e2dd8fd21d))

## [1.108.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.108.0...cowswap-v1.108.1) (2025-05-29)


### Bug Fixes

* **twap:** use indexedDB to persist state ([#5771](https://github.com/cowprotocol/cowswap/issues/5771)) ([bf410ec](https://github.com/cowprotocol/cowswap/commit/bf410ecc1d27d0d9eadd835c1b74141c6cee4341))

## [1.108.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.107.1...cowswap-v1.108.0) (2025-05-28)


### Features

* **appzi:** disable appzi for Coinbase Wallet ([#5671](https://github.com/cowprotocol/cowswap/issues/5671)) ([381e4b1](https://github.com/cowprotocol/cowswap/commit/381e4b1e8a7b1eec9b99d9d21841c647d66a7420))

## [1.107.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.107.0...cowswap-v1.107.1) (2025-05-22)


### Bug Fixes

* update tokens lib ([#5746](https://github.com/cowprotocol/cowswap/issues/5746)) ([10c59fe](https://github.com/cowprotocol/cowswap/commit/10c59fe86ce3a497078e0c1091db0d87fc3493f9))

## [1.107.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.7...cowswap-v1.107.0) (2025-05-21)


### Features

* update tokens lib ([#5738](https://github.com/cowprotocol/cowswap/issues/5738)) ([2939365](https://github.com/cowprotocol/cowswap/commit/29393656301e33b3e38ee78001e18f7627321ea3))

## [1.106.7](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.6...cowswap-v1.106.7) (2025-05-19)


### Bug Fixes

* fix order presign flow ([#5714](https://github.com/cowprotocol/cowswap/issues/5714)) ([2ff6dbd](https://github.com/cowprotocol/cowswap/commit/2ff6dbdb6b723c304107c778f7eba3d0ef5b4a83))
* handle presign tx signature for Safe via Rabby ([#5711](https://github.com/cowprotocol/cowswap/issues/5711)) ([3e33751](https://github.com/cowprotocol/cowswap/commit/3e3375171a59e9fa536442222b87bf9622e7fd68))

## [1.106.6](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.5...cowswap-v1.106.6) (2025-05-16)


### Bug Fixes

* **permit:** dai permit issues ([#5680](https://github.com/cowprotocol/cowswap/issues/5680)) ([a9e2da0](https://github.com/cowprotocol/cowswap/commit/a9e2da026cab2b0e001adc7fb0ebf11d1b028089))

## [1.106.5](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.4...cowswap-v1.106.5) (2025-05-14)


### Bug Fixes

* update curve link ([#5694](https://github.com/cowprotocol/cowswap/issues/5694)) ([718c9b1](https://github.com/cowprotocol/cowswap/commit/718c9b16490fcc27eccbe7b35c033002fe94701a))

## [1.106.4](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.3...cowswap-v1.106.4) (2025-05-08)


### Bug Fixes

* skip quote fetching when appData is not changed ([#5676](https://github.com/cowprotocol/cowswap/issues/5676)) ([4d57e8c](https://github.com/cowprotocol/cowswap/commit/4d57e8c2454ad901a826f015e70dd956c33b6661))

## [1.106.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.2...cowswap-v1.106.3) (2025-05-08)


### Bug Fixes

* null change to trigger cowswap build ([#5675](https://github.com/cowprotocol/cowswap/issues/5675)) ([b6be5f5](https://github.com/cowprotocol/cowswap/commit/b6be5f52dd3c4a5022e21766b5d46d6041d2c4e5))

## [1.106.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.1...cowswap-v1.106.2) (2025-05-07)


### Bug Fixes

* button's text color on Confirm price impact modal ([#5664](https://github.com/cowprotocol/cowswap/issues/5664)) ([8f50581](https://github.com/cowprotocol/cowswap/commit/8f50581df40cedeb9e75b549a842b5afc61ea310))
* mix UI fixes ([#5666](https://github.com/cowprotocol/cowswap/issues/5666)) ([3a9ef2b](https://github.com/cowprotocol/cowswap/commit/3a9ef2baf46364876be84e781d0b456ccb247008))
* **tokens:** fix token import logic for user-added tokens ([#5668](https://github.com/cowprotocol/cowswap/issues/5668)) ([73aeba3](https://github.com/cowprotocol/cowswap/commit/73aeba388892106cb7bf7c9b5addef6d679d491d))
* **twap:** quote 405 error ([#5665](https://github.com/cowprotocol/cowswap/issues/5665)) ([1182531](https://github.com/cowprotocol/cowswap/commit/1182531efc94ec711ea0755d5e78f6b193e81c54))

## [1.106.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.106.0...cowswap-v1.106.1) (2025-05-01)


### Bug Fixes

* **twap:** chainid url v2 ([#5657](https://github.com/cowprotocol/cowswap/issues/5657)) ([aa9c4c5](https://github.com/cowprotocol/cowswap/commit/aa9c4c51706de3928bb46455ad8310d55be3eff4))

## [1.106.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.105.3...cowswap-v1.106.0) (2025-04-25)


### Features

* **notifications:** subscribe to Telegram notifications ([#5613](https://github.com/cowprotocol/cowswap/issues/5613)) ([293f9f7](https://github.com/cowprotocol/cowswap/commit/293f9f7aee73c5c9d0d8fc88e1a3a77bb7fe9456))
* **trade:** use Trading SDK in trade flows ([#5549](https://github.com/cowprotocol/cowswap/issues/5549)) ([d4eaad9](https://github.com/cowprotocol/cowswap/commit/d4eaad91d977a9dcb2add425ca09811c26de4b2c))


### Bug Fixes

* **deps-update:** bump react-router-dom from 6.24.0 to 7.5.1 ([#5618](https://github.com/cowprotocol/cowswap/issues/5618)) ([2470bfa](https://github.com/cowprotocol/cowswap/commit/2470bfaf7ec0629223ea4dd5b42f090dd58a45df))
* disable Swap if insufficient balance ([#5614](https://github.com/cowprotocol/cowswap/issues/5614)) ([71b74bc](https://github.com/cowprotocol/cowswap/commit/71b74bc691c107601500f29644659556bafc1e93))
* disable Swap in insufficient balance - updated logic ([#5637](https://github.com/cowprotocol/cowswap/issues/5637)) ([8f8f599](https://github.com/cowprotocol/cowswap/commit/8f8f599f9c5f6b956fa5fbd132e5ad2a77fc95bb))
* fix token list modal import on mobile ([#5599](https://github.com/cowprotocol/cowswap/issues/5599)) ([d23878e](https://github.com/cowprotocol/cowswap/commit/d23878e9cb09e63d981b7d398b5a0191d0026d30))
* **hooks:** make partiallyFillable orders in Hooks widget ([#5641](https://github.com/cowprotocol/cowswap/issues/5641)) ([1d34f7d](https://github.com/cowprotocol/cowswap/commit/1d34f7dfe29cb473fd9c3492b9e4004e8354051d))
* **links:** change links on suplus card and twap form ([#5596](https://github.com/cowprotocol/cowswap/issues/5596)) ([1674a60](https://github.com/cowprotocol/cowswap/commit/1674a60da10de0cefc4a9348687af9f6c6c2903f))
* progress bar image alignment during `executing` step ([#5624](https://github.com/cowprotocol/cowswap/issues/5624)) ([7fce9ec](https://github.com/cowprotocol/cowswap/commit/7fce9ecc03fa4435d18e16fc7aa4ec85365f4b56))
* update links on limit orders page ([#5636](https://github.com/cowprotocol/cowswap/issues/5636)) ([1350e61](https://github.com/cowprotocol/cowswap/commit/1350e61b31a452e5a7ac85a0e586473762b5bce3))
* **wallets:** hide trezor option ([#5630](https://github.com/cowprotocol/cowswap/issues/5630)) ([16f2eb7](https://github.com/cowprotocol/cowswap/commit/16f2eb7a99ea054e1f4b10be0184099d05ab1918))

## [1.105.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.105.2...cowswap-v1.105.3) (2025-04-03)


### Bug Fixes

* issue [#5379](https://github.com/cowprotocol/cowswap/issues/5379): page name not updating ([#5579](https://github.com/cowprotocol/cowswap/issues/5579)) ([a21e054](https://github.com/cowprotocol/cowswap/commit/a21e054f089ab5c367858800a1ee93c4dbed4af0))
* remove irrelevant link from cancellation modal ([#5580](https://github.com/cowprotocol/cowswap/issues/5580)) ([5c6ac46](https://github.com/cowprotocol/cowswap/commit/5c6ac46b9229d62e590799a8dfe9d01a0121b53a))

## [1.105.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.105.1...cowswap-v1.105.2) (2025-03-31)


### Bug Fixes

* **safe-app-fee:** replace Safe App Fee recipient address ([#5581](https://github.com/cowprotocol/cowswap/issues/5581)) ([f72485b](https://github.com/cowprotocol/cowswap/commit/f72485bc8b16fff0a96b5b045b83be1fd4e53368))

## [1.105.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.105.0...cowswap-v1.105.1) (2025-03-27)


### Bug Fixes

* **balances:** updated balances on network changes ([#5569](https://github.com/cowprotocol/cowswap/issues/5569)) ([1aaf6b5](https://github.com/cowprotocol/cowswap/commit/1aaf6b58a205be331e6668bdf411f93f6cbb32ca))

## [1.105.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.104.2...cowswap-v1.105.0) (2025-03-27)


### Features

* move inside a popup "copy address" and "view details" ([#5532](https://github.com/cowprotocol/cowswap/issues/5532)) ([c060193](https://github.com/cowprotocol/cowswap/commit/c060193028b716b7ba062d55dbc5cac67a170031))


### Bug Fixes

* **bridge:** ignore buy token selection when bridging is not enabled ([#5561](https://github.com/cowprotocol/cowswap/issues/5561)) ([bd7b501](https://github.com/cowprotocol/cowswap/commit/bd7b5012c6d5b4fb98812a4d374fd01da3e11d70))

## [1.104.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.104.1...cowswap-v1.104.2) (2025-03-24)


### Bug Fixes

* do not ask apporval for native sell token ([#5545](https://github.com/cowprotocol/cowswap/issues/5545)) ([ca29c8e](https://github.com/cowprotocol/cowswap/commit/ca29c8eb6dfd0d33f065c7c565ee7dd58378626d))

## [1.104.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.104.0...cowswap-v1.104.1) (2025-03-24)


### Bug Fixes

* **swap:** wait for a optimal quote before eth-flow ([#5530](https://github.com/cowprotocol/cowswap/issues/5530)) ([acd0f49](https://github.com/cowprotocol/cowswap/commit/acd0f493c28af15451b9cae0af34c80917bfb586))
* **trade:** reset recipient when turn off settings ([#5538](https://github.com/cowprotocol/cowswap/issues/5538)) ([0abfb94](https://github.com/cowprotocol/cowswap/commit/0abfb94c29a5317dd2cf920a73640adbaef14063))

## [1.104.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.5...cowswap-v1.104.0) (2025-03-20)


### Features

* add a warning message to the order limit price tooltip modal ([#5487](https://github.com/cowprotocol/cowswap/issues/5487)) ([ebe0bf0](https://github.com/cowprotocol/cowswap/commit/ebe0bf07d07f031660cd2b9044ef57fb794f260d))
* **bridge:** add network logo token icon ([#5511](https://github.com/cowprotocol/cowswap/issues/5511)) ([1e74585](https://github.com/cowprotocol/cowswap/commit/1e74585ebe0d4a2d9f1a535972192b820a643869))
* **bridge:** display tokens in selector from bridge provider ([#5489](https://github.com/cowprotocol/cowswap/issues/5489)) ([b5b08ee](https://github.com/cowprotocol/cowswap/commit/b5b08ee8da9c1746bd3b2147444c2090afdf3950))
* **bridge:** do not fetch balances too often ([#5509](https://github.com/cowprotocol/cowswap/issues/5509)) ([a673668](https://github.com/cowprotocol/cowswap/commit/a6736681aadc2e1e42dea3ca13827728976e4ce2))
* **bridge:** select sell token from another chain ([#5521](https://github.com/cowprotocol/cowswap/issues/5521)) ([f0fc900](https://github.com/cowprotocol/cowswap/commit/f0fc900c7035e47331e07b0d5b7a31674dc7bc13))
* bring arb1 feature flag back "Revert ([#5500](https://github.com/cowprotocol/cowswap/issues/5500))" ([#5519](https://github.com/cowprotocol/cowswap/issues/5519)) ([4aa518e](https://github.com/cowprotocol/cowswap/commit/4aa518e2bf640b0acac6201f773856fa9701554f))
* **learn:** enhance search and article fetching functionality ([#5461](https://github.com/cowprotocol/cowswap/issues/5461)) ([8344440](https://github.com/cowprotocol/cowswap/commit/8344440e8136a2f20fc9c0888ec6a39d64f6214c))
* remove arb1CowSwapFeePercentage feature flag ([#5500](https://github.com/cowprotocol/cowswap/issues/5500)) ([937686e](https://github.com/cowprotocol/cowswap/commit/937686e5a3770f4d99ebc95e032966a8795b86dc))


### Bug Fixes

* issue [#5490](https://github.com/cowprotocol/cowswap/issues/5490) ([#5495](https://github.com/cowprotocol/cowswap/issues/5495)) ([b98737d](https://github.com/cowprotocol/cowswap/commit/b98737de3e6ece64b92d9d62053d843e38069e7d))
* **wallets:** disable coinbase in widget mobile ([#5516](https://github.com/cowprotocol/cowswap/issues/5516)) ([7233573](https://github.com/cowprotocol/cowswap/commit/7233573925c164de35017a3c48fc2af00d6106d2))
* **wallets:** show MM warning only to affected/unknown versions ([#5510](https://github.com/cowprotocol/cowswap/issues/5510)) ([50c65fc](https://github.com/cowprotocol/cowswap/commit/50c65fc3b4b651534178f887c25657669ffd5f21))

## [1.103.5](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.4...cowswap-v1.103.5) (2025-03-10)


### Bug Fixes

* **swap:** disable button when costs warning is not accepted ([#5494](https://github.com/cowprotocol/cowswap/issues/5494)) ([cfdf773](https://github.com/cowprotocol/cowswap/commit/cfdf7731d4e08225f08381a9e3eecfbb67f6feb7))

## [1.103.4](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.3...cowswap-v1.103.4) (2025-03-10)


### Bug Fixes

* **swap:** update quote in confirm screen ([#5485](https://github.com/cowprotocol/cowswap/issues/5485)) ([91187d9](https://github.com/cowprotocol/cowswap/commit/91187d9129f571b131e381a4c1b46814b4f3b479))

## [1.103.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.2...cowswap-v1.103.3) (2025-03-07)


### Bug Fixes

* revert [#5456](https://github.com/cowprotocol/cowswap/issues/5456) as Safe tx service is live again ([#5486](https://github.com/cowprotocol/cowswap/issues/5486)) ([0737eda](https://github.com/cowprotocol/cowswap/commit/0737edab51859d402361b6179668fee6d8c5b595))

## [1.103.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.1...cowswap-v1.103.2) (2025-03-06)


### Bug Fixes

* **appzi:** remove open state styles ([b5f873b](https://github.com/cowprotocol/cowswap/commit/b5f873b944b947d1b6f4d9351c17b965a83a9941))

## [1.103.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.103.0...cowswap-v1.103.1) (2025-02-27)


### Bug Fixes

* **twap:** migrate to new Safe api for orders history ([#5456](https://github.com/cowprotocol/cowswap/issues/5456)) ([03c89fe](https://github.com/cowprotocol/cowswap/commit/03c89fe227c65c3f9f2c0852ff69c5f8170dde40))

## [1.103.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.102.0...cowswap-v1.103.0) (2025-02-25)


### Features

* **analytics:** migrate to GTM-based analytics ([#5360](https://github.com/cowprotocol/cowswap/issues/5360)) ([f404d02](https://github.com/cowprotocol/cowswap/commit/f404d0280d9d1d86cc249d70852a5c0ec9827475))


### Bug Fixes

* Orders table: 'Learn more' link update ([#5440](https://github.com/cowprotocol/cowswap/issues/5440)) ([49f4a26](https://github.com/cowprotocol/cowswap/commit/49f4a262a2262f56615f95e8e15d239a09a2ff81))
* **ui:** minor layout and styling tweaks across components ([#5437](https://github.com/cowprotocol/cowswap/issues/5437)) ([2602d1c](https://github.com/cowprotocol/cowswap/commit/2602d1ca0848571d09ef94a4ee6ff7024cdc736c))
* **volume-fee:** remove hardcoded stablecoins check for Safe fee ([#5436](https://github.com/cowprotocol/cowswap/issues/5436)) ([ce77355](https://github.com/cowprotocol/cowswap/commit/ce773552fe29fbca1571a17b9d0177522a847183))

## [1.102.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.101.0...cowswap-v1.102.0) (2025-02-17)


### Features

* **correlated-tokens:** use new CMS model Correlated Tokens ([#5427](https://github.com/cowprotocol/cowswap/issues/5427)) ([6ed415a](https://github.com/cowprotocol/cowswap/commit/6ed415a05c6a7f228fda704ea27c664d6c8d3321))


### Bug Fixes

* do not check capabilities in mobile wc ([#5429](https://github.com/cowprotocol/cowswap/issues/5429)) ([26b907d](https://github.com/cowprotocol/cowswap/commit/26b907dad4c7310bdc3e560e5592fdeb3db11b95))
* **twap:** do not show FallbackHandler warning after first order ([#5418](https://github.com/cowprotocol/cowswap/issues/5418)) ([337795a](https://github.com/cowprotocol/cowswap/commit/337795a4746e7a36c5144b0ff590c35bcad88a3f))

## [1.101.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.100.1...cowswap-v1.101.0) (2025-02-12)


### Features

* support EIP-5792 batch tx for Safe via WC ([#5417](https://github.com/cowprotocol/cowswap/issues/5417)) ([8aa612f](https://github.com/cowprotocol/cowswap/commit/8aa612f7b93a40d69efa364a10634863bc743e95))


### Bug Fixes

* use quote currency on fill at tooltip ([#5421](https://github.com/cowprotocol/cowswap/issues/5421)) ([24920e8](https://github.com/cowprotocol/cowswap/commit/24920e804b636baf715335a8cabb18d4762036e1))

## [1.100.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.100.0...cowswap-v1.100.1) (2025-02-07)


### Bug Fixes

* use address for default buy token ([#5410](https://github.com/cowprotocol/cowswap/issues/5410)) ([92c3a96](https://github.com/cowprotocol/cowswap/commit/92c3a96972b92807aa81709f08d84f9101264381))

## [1.100.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.99.0...cowswap-v1.100.0) (2025-02-06)


### Features

* use new deterministic ethflow contracts ([#5334](https://github.com/cowprotocol/cowswap/issues/5334)) ([f11fb61](https://github.com/cowprotocol/cowswap/commit/f11fb613b02825aa6c571ffdc3414086557b48e9))

## [1.99.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.98.2...cowswap-v1.99.0) (2025-02-05)


### Features

* **limit-orders:** upgrade and redesign ([#5249](https://github.com/cowprotocol/cowswap/issues/5249)) ([5c868bb](https://github.com/cowprotocol/cowswap/commit/5c868bb794d648363afb88371178ddc35deaf7a7))


### Bug Fixes

* **limit-orders:** do not display rate input when wrap/unwrap ([#5385](https://github.com/cowprotocol/cowswap/issues/5385)) ([d174a31](https://github.com/cowprotocol/cowswap/commit/d174a3128ec9569be4986738172076e2605e4283))
* **orders-table:** prevent excessive transactions on approvals ([#5390](https://github.com/cowprotocol/cowswap/issues/5390)) ([fce1931](https://github.com/cowprotocol/cowswap/commit/fce1931db0d07b33d7d1d03c291c2ff1528956fd))
* reset zero approval state ([#5387](https://github.com/cowprotocol/cowswap/issues/5387)) ([d9cd435](https://github.com/cowprotocol/cowswap/commit/d9cd43589a96084b84195df43d8fde729de66b17))
* **safe-app:** remove approval+order placement bundling banner ([#5393](https://github.com/cowprotocol/cowswap/issues/5393)) ([571029d](https://github.com/cowprotocol/cowswap/commit/571029d11f7c2d1afe608f8dd3481c404e0efea0))
* update chainId in TradeRouteContext from Account page ([#5348](https://github.com/cowprotocol/cowswap/issues/5348)) ([47a2787](https://github.com/cowprotocol/cowswap/commit/47a2787afe8d8b594327741fcca94433ba354baf))
* **usd-rate-input:** keep track of usd toggle in the rate input on limit form ([#5391](https://github.com/cowprotocol/cowswap/issues/5391)) ([95c2e22](https://github.com/cowprotocol/cowswap/commit/95c2e22a5f0e6b54906b5a43ab2d94264be660ae))

## [1.98.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.98.1...cowswap-v1.98.2) (2025-02-03)


### Bug Fixes

* display Metamask warning only for extension/mobile wallets ([#5370](https://github.com/cowprotocol/cowswap/issues/5370)) ([abb5683](https://github.com/cowprotocol/cowswap/commit/abb56834b1e21029ca66362f3b721cd47e080547))

## [1.98.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.98.0...cowswap-v1.98.1) (2025-01-31)


### Bug Fixes

* css for Metamask warning banner ([#5365](https://github.com/cowprotocol/cowswap/issues/5365)) ([753899d](https://github.com/cowprotocol/cowswap/commit/753899d1ec9b0b613a6602e35b24cbe2024c30b3))

## [1.98.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.97.1...cowswap-v1.98.0) (2025-01-31)


### Features

* warn users about metamask transactions ([#5362](https://github.com/cowprotocol/cowswap/issues/5362)) ([55e71b0](https://github.com/cowprotocol/cowswap/commit/55e71b09d512771185c75c80f291098796411689))

## [1.97.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.97.0...cowswap-v1.97.1) (2025-01-30)


### Bug Fixes

* type guard to make sure provider is a JsonRpcProvider ([#5357](https://github.com/cowprotocol/cowswap/issues/5357)) ([6a2e030](https://github.com/cowprotocol/cowswap/commit/6a2e030aa7f88ef207fad8910750b18dcf719503))

## [1.97.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.96.2...cowswap-v1.97.0) (2025-01-29)


### Features

* make useContract chainId aware and handle errors and loading state ([#5352](https://github.com/cowprotocol/cowswap/issues/5352)) ([d66e8ff](https://github.com/cowprotocol/cowswap/commit/d66e8ffc8668ad7563130228fb9bec28ae1d7e7e))


### Bug Fixes

* use provider.send('eth_chainId',[]) to avoid cached values ([#5354](https://github.com/cowprotocol/cowswap/issues/5354)) ([ad34521](https://github.com/cowprotocol/cowswap/commit/ad3452181287acb151b22d541feb156d208db482))

## [1.96.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.96.1...cowswap-v1.96.2) (2025-01-27)


### Bug Fixes

* **wrap/unwrap:** enforce chainId when wrapping/unwrapping ([#5349](https://github.com/cowprotocol/cowswap/issues/5349)) ([7023f6e](https://github.com/cowprotocol/cowswap/commit/7023f6e449924eafc7afa0154844c78b315c6b37))

## [1.96.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.96.0...cowswap-v1.96.1) (2025-01-09)


### Bug Fixes

* **token-lists:** remove old token lists from cache ([#5275](https://github.com/cowprotocol/cowswap/issues/5275)) ([1ca7211](https://github.com/cowprotocol/cowswap/commit/1ca7211729c552c1c834b12c2d343ce981b02cf1))

## [1.96.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.95.3...cowswap-v1.96.0) (2025-01-09)


### Features

* executedSurplusFee removal ([#5262](https://github.com/cowprotocol/cowswap/issues/5262)) ([3be8a65](https://github.com/cowprotocol/cowswap/commit/3be8a65309048d4082f2ce25f5b39624e092dbf2))
* **swap:** partial approve ([#5256](https://github.com/cowprotocol/cowswap/issues/5256)) ([f080ffd](https://github.com/cowprotocol/cowswap/commit/f080ffdb098612e729f3a3f829410ce78697979f))

## [1.95.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.95.2...cowswap-v1.95.3) (2024-12-23)


### Bug Fixes

* fix order filled condition for permit check ([#5253](https://github.com/cowprotocol/cowswap/issues/5253)) ([b81842c](https://github.com/cowprotocol/cowswap/commit/b81842c8aed196f23a9cbcb42d637299f1e7708e))

## [1.95.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.95.1...cowswap-v1.95.2) (2024-12-23)


### Bug Fixes

* **snackbars:** stick snackbars widget to header menu ([4582d67](https://github.com/cowprotocol/cowswap/commit/4582d67156364fe1866a40227f76c8101d11e1bd))
* **widget:** do not display Christmas background ([6a4ae4c](https://github.com/cowprotocol/cowswap/commit/6a4ae4cc7bad90c9dc1fcb1ef71f8635415cd3cd))

## [1.95.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.95.0...cowswap-v1.95.1) (2024-12-20)


### Bug Fixes

* **eth-flow:** set chainId explicitly when sending ethFlow tx ([#5244](https://github.com/cowprotocol/cowswap/issues/5244)) ([983536d](https://github.com/cowprotocol/cowswap/commit/983536d300a17e84dff691eb55d645b46ad1437b))

## [1.95.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.94.0...cowswap-v1.95.0) (2024-12-18)


### Features

* force release to release, pleaseeee ([a59eb27](https://github.com/cowprotocol/cowswap/commit/a59eb275a96fb13c9521784a051f734d947a1b1f))

## [1.94.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.93.2...cowswap-v1.94.0) (2024-12-18)


### Features

* allow 1 year max deadline ([#5227](https://github.com/cowprotocol/cowswap/issues/5227)) ([64e3f40](https://github.com/cowprotocol/cowswap/commit/64e3f40a19da19ba7d44f4ebcb1b494fd4426882))


### Bug Fixes

* account for a bad CMS request ([#5221](https://github.com/cowprotocol/cowswap/issues/5221)) ([8d2edd7](https://github.com/cowprotocol/cowswap/commit/8d2edd7d87f0622fdc5885b45175b89b49eae1ec))

## [1.93.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.93.1...cowswap-v1.93.2) (2024-12-13)


### Bug Fixes

* **twap:** cache fb handler verification for 10min ([#5200](https://github.com/cowprotocol/cowswap/issues/5200)) ([c09f073](https://github.com/cowprotocol/cowswap/commit/c09f07338868654a89ba570987a8bc9bec59141c))

## [1.93.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.93.0...cowswap-v1.93.1) (2024-12-12)


### Bug Fixes

* **volume-fee:** control safe app fees for stablecoins with ff ([#5187](https://github.com/cowprotocol/cowswap/issues/5187)) ([e7bc7c5](https://github.com/cowprotocol/cowswap/commit/e7bc7c5df35e233da9af8da950973a4272f10365))

## [1.93.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.92.2...cowswap-v1.93.0) (2024-12-11)


### Features

* **cow-fi:** upgrade project structure to /app ([#5167](https://github.com/cowprotocol/cowswap/issues/5167)) ([ed152f7](https://github.com/cowprotocol/cowswap/commit/ed152f7ac0fa62ab2c0b9c93035a551c3b8cb4b6))

## [1.92.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.92.1...cowswap-v1.92.2) (2024-12-05)


### Bug Fixes

* add safe apps fee in Base network ([#5161](https://github.com/cowprotocol/cowswap/issues/5161)) ([cefdb55](https://github.com/cowprotocol/cowswap/commit/cefdb55475f4989d745857fc9f8f2cfa77be5243))

## [1.92.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.92.0...cowswap-v1.92.1) (2024-12-05)


### Bug Fixes

* **twap:** fix orders fetching ([#5157](https://github.com/cowprotocol/cowswap/issues/5157)) ([47195e2](https://github.com/cowprotocol/cowswap/commit/47195e2d326650a1fc11960077bd4861bdfcf418))
* update safe fee tooltip label ([#5158](https://github.com/cowprotocol/cowswap/issues/5158)) ([d186042](https://github.com/cowprotocol/cowswap/commit/d186042fc75c79ccd95defe30f6b5e0d17792f17))

## [1.92.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.91.0...cowswap-v1.92.0) (2024-12-04)


### Features

* upgrade react@19 and next@15 ([#5147](https://github.com/cowprotocol/cowswap/issues/5147)) ([a00b1b9](https://github.com/cowprotocol/cowswap/commit/a00b1b930602ab1e6b2f0b3cd148497f68bf4cb5))

## [1.91.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.90.0...cowswap-v1.91.0) (2024-12-03)


### Features

* allow adding networks without invalidating local-storage ([#5134](https://github.com/cowprotocol/cowswap/issues/5134)) ([995b4c0](https://github.com/cowprotocol/cowswap/commit/995b4c05da90356c6621a92dc58efbd6f37349ff))
* **base:** add base chain support ([#5044](https://github.com/cowprotocol/cowswap/issues/5044)) ([4cf0c91](https://github.com/cowprotocol/cowswap/commit/4cf0c91a300d6fcdc026364e74c45e5b2f729f2b))
* improve custom hook validation messages ([#5123](https://github.com/cowprotocol/cowswap/issues/5123)) ([91bab8d](https://github.com/cowprotocol/cowswap/commit/91bab8dc3b124a32790c3bb1955b01dd3a75ea7b))
* **volume-fee:** add volume fee for Safe ([#5139](https://github.com/cowprotocol/cowswap/issues/5139)) ([bb14c6a](https://github.com/cowprotocol/cowswap/commit/bb14c6a6ecfaba7d1a9a1da5366fac054efb97aa))


### Bug Fixes

* display usd value for tokens with small prices ([#5137](https://github.com/cowprotocol/cowswap/issues/5137)) ([74c27fd](https://github.com/cowprotocol/cowswap/commit/74c27fd38e0280a5cf24575bf002a9598994ff95))
* **hooks-store:** update hooks learn link ([#5126](https://github.com/cowprotocol/cowswap/issues/5126)) ([a3b378c](https://github.com/cowprotocol/cowswap/commit/a3b378cda5be4d33fc816e9b3b4c62efe7df5c39))
* reset trade completely if default token is duplicated ([#5140](https://github.com/cowprotocol/cowswap/issues/5140)) ([32e1ca0](https://github.com/cowprotocol/cowswap/commit/32e1ca0108e8bf789d2bad01f8129d9343875bce))
* **wallet:** remove change wallet feature ([#5136](https://github.com/cowprotocol/cowswap/issues/5136)) ([329c1df](https://github.com/cowprotocol/cowswap/commit/329c1df3aa2e2617b0bb15a94904b51c6063ff3d))

## [1.90.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.89.0...cowswap-v1.90.0) (2024-11-21)


### Features

* **hooks-store:** add loading logo for hook-dapp ([#5112](https://github.com/cowprotocol/cowswap/issues/5112)) ([4b7267f](https://github.com/cowprotocol/cowswap/commit/4b7267fb6ea37c7bfcc896c7953b70fa8af2729d))
* refactor badge component and experimental icon ([#5102](https://github.com/cowprotocol/cowswap/issues/5102)) ([f642ce5](https://github.com/cowprotocol/cowswap/commit/f642ce5d5a8f2f81dbc72cb1d8942eaa8905bb3b))
* refactor trade container styles ([#5103](https://github.com/cowprotocol/cowswap/issues/5103)) ([29ab5c4](https://github.com/cowprotocol/cowswap/commit/29ab5c45971767716df2d048b87198ac1acb2c90))


### Bug Fixes

* **hooks-store:** fix custom hook alert title and trim slash from url ([#5117](https://github.com/cowprotocol/cowswap/issues/5117)) ([4858b7c](https://github.com/cowprotocol/cowswap/commit/4858b7c1cfd220b98d2f185682c6f71af2f8edfc))
* **hooks-store:** log simulation only on trade simulation ([#5101](https://github.com/cowprotocol/cowswap/issues/5101)) ([84f5d5e](https://github.com/cowprotocol/cowswap/commit/84f5d5e3252f78564821be67ad738009426150f1))
* **limit-orders:** do not crash when sell amount is giant ([#5120](https://github.com/cowprotocol/cowswap/issues/5120)) ([94d71f1](https://github.com/cowprotocol/cowswap/commit/94d71f1c785a682e608d00ad477f429ee4df4e9d))
* **yield:** show green banner only when vampire attack is ready ([#5064](https://github.com/cowprotocol/cowswap/issues/5064)) ([cd9f2e1](https://github.com/cowprotocol/cowswap/commit/cd9f2e18b36a280d25c8727f730414c95ea90979))

## [1.89.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.88.0...cowswap-v1.89.0) (2024-11-14)


### Features

* enable hooks using settings ([#5081](https://github.com/cowprotocol/cowswap/issues/5081)) ([20f543a](https://github.com/cowprotocol/cowswap/commit/20f543a4690e99e2df18a73995e476ce0efc4a6a))
* make hooks use partially fillable by default ([#5086](https://github.com/cowprotocol/cowswap/issues/5086)) ([27a8d4d](https://github.com/cowprotocol/cowswap/commit/27a8d4d0f827495cefb16c09c228151fc9f89426))
* misc hooks improvements ([#5079](https://github.com/cowprotocol/cowswap/issues/5079)) ([adec6fe](https://github.com/cowprotocol/cowswap/commit/adec6fecaed225531140ae947801be9d5ee52532))


### Bug Fixes

* add cow-shed page ([#5088](https://github.com/cowprotocol/cowswap/issues/5088)) ([a0bc92c](https://github.com/cowprotocol/cowswap/commit/a0bc92cf3ce8263c620ccd488cdf663028490324))
* add cow-shed page ([#5089](https://github.com/cowprotocol/cowswap/issues/5089)) ([1102691](https://github.com/cowprotocol/cowswap/commit/1102691f8f8260dbbcae9f2fba2629ef59b4384d))
* **combinedBalances:** Optimize balance diff calculations ([#5082](https://github.com/cowprotocol/cowswap/issues/5082)) ([38aae71](https://github.com/cowprotocol/cowswap/commit/38aae718e54fb50634706eafb973e8027d2b28df))

## [1.88.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.87.0...cowswap-v1.88.0) (2024-11-06)


### Features

* **protocol-fees:** arb1 protocol fee ([#5055](https://github.com/cowprotocol/cowswap/issues/5055)) ([ed176c3](https://github.com/cowprotocol/cowswap/commit/ed176c3ab95fe51065a905e05ca184f3abf7e282))
* **yield:** define token category by default for selection ([#5018](https://github.com/cowprotocol/cowswap/issues/5018)) ([7c18b7d](https://github.com/cowprotocol/cowswap/commit/7c18b7d85de6feac9c7e64740a93572f3af3c273))
* **yield:** display cow amm banner conditionally ([#5035](https://github.com/cowprotocol/cowswap/issues/5035)) ([1a517a3](https://github.com/cowprotocol/cowswap/commit/1a517a3f21b94c10b8e59e68bc49a569c1be904b))
* **yield:** display pools info in widget ([#5046](https://github.com/cowprotocol/cowswap/issues/5046)) ([562d020](https://github.com/cowprotocol/cowswap/commit/562d0207d1acf4e1735c4b3f629ff63dd65d3725))
* **yield:** use lp-token in widget ([#5013](https://github.com/cowprotocol/cowswap/issues/5013)) ([b66d206](https://github.com/cowprotocol/cowswap/commit/b66d2068a9f3bcaddc8da7df5499c17fc05f693f))


### Bug Fixes

* **hooks:** support native currency rescuing from proxy ([#5062](https://github.com/cowprotocol/cowswap/issues/5062)) ([843e00b](https://github.com/cowprotocol/cowswap/commit/843e00b0e84e8060b9241c6d4767962df3de96eb))
* remove isNotificationsFeedEnabled ([#5054](https://github.com/cowprotocol/cowswap/issues/5054)) ([0fbb9b5](https://github.com/cowprotocol/cowswap/commit/0fbb9b585c4beb0978309c8ebda7e8aa1f8bf57c))
* **swap:** take slippage into account for buy orders ([#5067](https://github.com/cowprotocol/cowswap/issues/5067)) ([21f39fe](https://github.com/cowprotocol/cowswap/commit/21f39fe3811fb65d6f1a98bb2185321f378afdd4))
* **widget:** remove irrelevant change trade params events ([#5060](https://github.com/cowprotocol/cowswap/issues/5060)) ([6ae8ca1](https://github.com/cowprotocol/cowswap/commit/6ae8ca1569d9248bb8f82bb3fea777eb03f12d49))

## [1.87.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.86.1...cowswap-v1.87.0) (2024-10-29)


### Features

* add vampire attack banner ([#4981](https://github.com/cowprotocol/cowswap/issues/4981)) ([5246046](https://github.com/cowprotocol/cowswap/commit/52460461d6cc80635a25aefe5b119dbd7de1fb69))
* **halloween:** add Halloween mode ([#5036](https://github.com/cowprotocol/cowswap/issues/5036)) ([791796d](https://github.com/cowprotocol/cowswap/commit/791796d139828f3dd0657222cbf98a5ce93ff321))
* **hook-store:** create bundle hooks tenderly simulation ([#4943](https://github.com/cowprotocol/cowswap/issues/4943)) ([435bfdf](https://github.com/cowprotocol/cowswap/commit/435bfdfa3e68cea1652bc00dcf5908bbc991d7b1))
* **swap-deadline:** higher swap deadline ([#5002](https://github.com/cowprotocol/cowswap/issues/5002)) ([f6f6f8c](https://github.com/cowprotocol/cowswap/commit/f6f6f8cb9c8df72857d55f42d1e521a6784f9126))


### Bug Fixes

* fix bad merge ([1abd825](https://github.com/cowprotocol/cowswap/commit/1abd82527dc1f96d6897533d750dcc6f2a51e7a0))
* fix trade type selector mobile view ([#5023](https://github.com/cowprotocol/cowswap/issues/5023)) ([661cf2f](https://github.com/cowprotocol/cowswap/commit/661cf2fcffa1b0e329a6df905c5949ee71ee24c7))
* **smart-slippage:** replace volatity with trade size on tooltips ([#5012](https://github.com/cowprotocol/cowswap/issues/5012)) ([9308fc1](https://github.com/cowprotocol/cowswap/commit/9308fc1e35ce5ecfdc69c76974136182352eeca0))
* sound widget logic ([#5051](https://github.com/cowprotocol/cowswap/issues/5051)) ([37d04c1](https://github.com/cowprotocol/cowswap/commit/37d04c168fff949ec453052feabf3e8d8795cfd1))
* **swap:** disable partial fills ([#5016](https://github.com/cowprotocol/cowswap/issues/5016)) ([cbbeb8b](https://github.com/cowprotocol/cowswap/commit/cbbeb8bc3d89796da989fd4b17a6eb6e3a4629a4))
* **swap:** fix safe eth-flow ([#5041](https://github.com/cowprotocol/cowswap/issues/5041)) ([09f5124](https://github.com/cowprotocol/cowswap/commit/09f512407f8a37d49ccd422e951da20e6733afc4))
* **swap:** reset widget start after successful swap ([#5047](https://github.com/cowprotocol/cowswap/issues/5047)) ([a062ff5](https://github.com/cowprotocol/cowswap/commit/a062ff5309c89fa3d1cddb56bc85a0a0badf0ca5))
* **trade:** use recipient address in order data ([#5040](https://github.com/cowprotocol/cowswap/issues/5040)) ([229f243](https://github.com/cowprotocol/cowswap/commit/229f243bd834da7d962c64bf151b5cf5db644259))

## [1.86.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.86.0...cowswap-v1.86.1) (2024-10-18)


### Bug Fixes

* **widget:** ignore selected eip6963 provider when in widget ([#5009](https://github.com/cowprotocol/cowswap/issues/5009)) ([3f8446b](https://github.com/cowprotocol/cowswap/commit/3f8446b48a4f493448b262959b943756a24382d9))

## [1.86.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.85.0...cowswap-v1.86.0) (2024-10-18)


### Features

* display new label for cow amm ([#4994](https://github.com/cowprotocol/cowswap/issues/4994)) ([531e63f](https://github.com/cowprotocol/cowswap/commit/531e63f666ffcafdaf8e2b1c2850991facbe5cf1))
* **hooks-store:** add claim vesting iframe hook ([#4924](https://github.com/cowprotocol/cowswap/issues/4924)) ([395f48f](https://github.com/cowprotocol/cowswap/commit/395f48f57d93de67305791fdb9a668bdd693074e))
* **hooks-store:** add sell/buy amounts to hook-dapp context ([#4990](https://github.com/cowprotocol/cowswap/issues/4990)) ([26cbffb](https://github.com/cowprotocol/cowswap/commit/26cbffbbfe8edbc0a4a9ba31fe9c0d42852118d9))
* **slippage:** small order slippage v2 ([#4934](https://github.com/cowprotocol/cowswap/issues/4934)) ([7b2a49c](https://github.com/cowprotocol/cowswap/commit/7b2a49c41ecfd62107a3128e771003743094d246))
* **smart-slippage:** update smart slippage text ([#4982](https://github.com/cowprotocol/cowswap/issues/4982)) ([4b89ecb](https://github.com/cowprotocol/cowswap/commit/4b89ecbf661e6c30193586c704e23c78b2bfc22b))
* **widget:** deadline widget param ([#4991](https://github.com/cowprotocol/cowswap/issues/4991)) ([ce3b5b8](https://github.com/cowprotocol/cowswap/commit/ce3b5b8adb5cc95a5ca3097d5cf2d45b249748c2))
* **widget:** hide bridge info ([#4992](https://github.com/cowprotocol/cowswap/issues/4992)) ([9842afd](https://github.com/cowprotocol/cowswap/commit/9842afdb887497d235a01538663488b0b8852bb5))
* **widget:** hide orders table ([#4993](https://github.com/cowprotocol/cowswap/issues/4993)) ([681fb20](https://github.com/cowprotocol/cowswap/commit/681fb20dab0b4155d50ad7f32c7a48cb95e084a3))


### Bug Fixes

* **smart-slippage:** fix smart slip tooltip and feature flag ([#5004](https://github.com/cowprotocol/cowswap/issues/5004)) ([c6ea5af](https://github.com/cowprotocol/cowswap/commit/c6ea5af5d24b9a806540d53d2a0d9e12799d4eff))

## [1.85.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.84.0...cowswap-v1.85.0) (2024-10-10)


### Features

* **hooks-store:** add dapp id to hook callData ([#4920](https://github.com/cowprotocol/cowswap/issues/4920)) ([7111756](https://github.com/cowprotocol/cowswap/commit/7111756e359a8e52daa674068f99217efe27ee5b))
* **hooks-store:** adjust hook details and rescue funds styles ([#4948](https://github.com/cowprotocol/cowswap/issues/4948)) ([aedc8d1](https://github.com/cowprotocol/cowswap/commit/aedc8d14c9b8dc3b25f964985b41b25229fd1547))
* **hooks-store:** style hook details ([#4932](https://github.com/cowprotocol/cowswap/issues/4932)) ([83184d2](https://github.com/cowprotocol/cowswap/commit/83184d23da3c812eff87bfc0ec5a2832af0ff235))
* **hooks-store:** use dappId from hook model to match with dapp ([#4938](https://github.com/cowprotocol/cowswap/issues/4938)) ([46699cb](https://github.com/cowprotocol/cowswap/commit/46699cbe6df02b0f7a3c6c380a04842e9f403a88))
* improve mobile rendering of custom recipient ([#4954](https://github.com/cowprotocol/cowswap/issues/4954)) ([64e58c6](https://github.com/cowprotocol/cowswap/commit/64e58c6a6995c8b91792aad5e68129cbf30b7c3a))
* rescue funds from CoW Shed Proxy ([#4935](https://github.com/cowprotocol/cowswap/issues/4935)) ([5fb7f34](https://github.com/cowprotocol/cowswap/commit/5fb7f344bec8dfd26177f62c765ed1e589c56a56))
* **swap:** display order hooks details ([#4925](https://github.com/cowprotocol/cowswap/issues/4925)) ([1e776fc](https://github.com/cowprotocol/cowswap/commit/1e776fc4f6dfb28eebf881e79bb45dbfd693e472))


### Bug Fixes

* **tokens-selector:** fix tokens displaying on mobile view ([#4929](https://github.com/cowprotocol/cowswap/issues/4929)) ([f055957](https://github.com/cowprotocol/cowswap/commit/f055957af450967b4bc4d58a15fc7a7b80f0aa77))

## [1.84.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.83.0...cowswap-v1.84.0) (2024-09-30)


### Features

* **cow-fi:** lazy load cms images /learn/ pages ([#4906](https://github.com/cowprotocol/cowswap/issues/4906)) ([897ce91](https://github.com/cowprotocol/cowswap/commit/897ce91ca60a6b2d3823e6a002c3bf64c5384afe))
* **cow-hooks:** add claim airdrop hook app  ([#4897](https://github.com/cowprotocol/cowswap/issues/4897)) ([cab2407](https://github.com/cowprotocol/cowswap/commit/cab240778128dfbdd29f0873062a39b23695d577))
* **hooks-store:** import custom hook-dapps ([#4910](https://github.com/cowprotocol/cowswap/issues/4910)) ([5847017](https://github.com/cowprotocol/cowswap/commit/584701715500525365475660732edb6bbf7ba396))
* **hooks-store:** style hook store ([#4905](https://github.com/cowprotocol/cowswap/issues/4905)) ([9fca0d9](https://github.com/cowprotocol/cowswap/commit/9fca0d9e9fac5715d3d05eb1c1fe234083af03fc))
* **hooks-store:** support iframe hook-dapps ([#4885](https://github.com/cowprotocol/cowswap/issues/4885)) ([5116f29](https://github.com/cowprotocol/cowswap/commit/5116f296a0e4866d0a51a806b7abe55e809d26e9))


### Bug Fixes

* fix import list warning styles ([#4917](https://github.com/cowprotocol/cowswap/issues/4917)) ([fa3c4cb](https://github.com/cowprotocol/cowswap/commit/fa3c4cb09fb0728233de92c81c1e0a410143f65a))

## [1.83.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.82.0...cowswap-v1.83.0) (2024-09-18)


### Features

* **hook-store:** enhance items sorting ux ([#4893](https://github.com/cowprotocol/cowswap/issues/4893)) ([9d72b77](https://github.com/cowprotocol/cowswap/commit/9d72b77f35358e25510495eeb8903ba9a7c18558))


### Bug Fixes

* don't request network switching at page load ([#4903](https://github.com/cowprotocol/cowswap/issues/4903)) ([da375be](https://github.com/cowprotocol/cowswap/commit/da375be55f34bd35e5cf1152e0f3f5d0bcc92aa5))
* remove blocknative mempool checking ([#4902](https://github.com/cowprotocol/cowswap/issues/4902)) ([79fcfe4](https://github.com/cowprotocol/cowswap/commit/79fcfe41c84a272077e735382ffbbf313b01398c))

## [1.82.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.81.2...cowswap-v1.82.0) (2024-09-17)


### Features

* change finished step layout ([#4880](https://github.com/cowprotocol/cowswap/issues/4880)) ([181acb1](https://github.com/cowprotocol/cowswap/commit/181acb11f55485d6c76cfadbae618a6ed10ea79c))
* **hooks-store:** add order params and signer to hook dapp context ([#4878](https://github.com/cowprotocol/cowswap/issues/4878)) ([700da7e](https://github.com/cowprotocol/cowswap/commit/700da7e64c680072bf97ac240b04439a26ceaa0d))
* **hooks-store:** new design & refactoring ([#4859](https://github.com/cowprotocol/cowswap/issues/4859)) ([1b989fa](https://github.com/cowprotocol/cowswap/commit/1b989fa037b276d507adfa0462129ab53fe2ac6d))
* **smart-slippage:** add smartSlippage flag to appData quote metadata ([#4866](https://github.com/cowprotocol/cowswap/issues/4866)) ([e28364f](https://github.com/cowprotocol/cowswap/commit/e28364fee6c0c0d9b8c07b8bf5892b52e4c6e3dd))
* **smart-slippage:** improve ux ([#4826](https://github.com/cowprotocol/cowswap/issues/4826)) ([ce3ba87](https://github.com/cowprotocol/cowswap/commit/ce3ba875c5f6ebce3032e89ec5b231f59a9a4fc1))


### Bug Fixes

* **hooks-store:** ignore permit data for sc wallets ([#4875](https://github.com/cowprotocol/cowswap/issues/4875)) ([3d0bc32](https://github.com/cowprotocol/cowswap/commit/3d0bc32ea4a2ffa9cb073e321e8382e4a9b6a2e4))
* **widget:** widget tokens flickering ([#4883](https://github.com/cowprotocol/cowswap/issues/4883)) ([0f8f256](https://github.com/cowprotocol/cowswap/commit/0f8f256d3d0e717306be8def7d44aeb35811bb9e))

## [1.81.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.81.1...cowswap-v1.81.2) (2024-09-05)


### Bug Fixes

* **progress-bar:** fix styling issues ([#4841](https://github.com/cowprotocol/cowswap/issues/4841)) ([083d489](https://github.com/cowprotocol/cowswap/commit/083d489198033516d58e769075707d42e4fcaedc))
* **twap:** display relevant price after slippage ([#4844](https://github.com/cowprotocol/cowswap/issues/4844)) ([14064c0](https://github.com/cowprotocol/cowswap/commit/14064c0a8ebc9bbf7ca42edaec1e7311c1dfa641))
* **twap:** don't crash when slippage is 100 ([#4845](https://github.com/cowprotocol/cowswap/issues/4845)) ([f2f092c](https://github.com/cowprotocol/cowswap/commit/f2f092c66050b7fd9f5e7d56cf71d921c974af12))

## [1.81.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.81.0...cowswap-v1.81.1) (2024-08-29)


### Bug Fixes

* **widget:** update tokens based on widget params ([#4820](https://github.com/cowprotocol/cowswap/issues/4820)) ([659c95d](https://github.com/cowprotocol/cowswap/commit/659c95d225a0af2c58a5596ae1e55f3f4b4a1019))

## [1.81.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.80.0...cowswap-v1.81.0) (2024-08-27)


### Features

* **dynamic-slippage:** add tooltip and change message ([#4819](https://github.com/cowprotocol/cowswap/issues/4819)) ([75a16ac](https://github.com/cowprotocol/cowswap/commit/75a16aca98541b42583399b6aad3a99f7ced3ab7))
* **progress-bar-v2:** replace progress bar with v2 ([#4033](https://github.com/cowprotocol/cowswap/issues/4033)) ([e199bff](https://github.com/cowprotocol/cowswap/commit/e199bff492ad3f91df23be34a829ebe1f246444a))


### Bug Fixes

* adjust dynamic slippage wording ([a2375e6](https://github.com/cowprotocol/cowswap/commit/a2375e6651a6fba7d2a99cc67395011133486676))

## [1.80.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.79.0...cowswap-v1.80.0) (2024-08-14)


### Features

* add analytics event for closing CoW AMM banner ([#4790](https://github.com/cowprotocol/cowswap/issues/4790)) ([46add78](https://github.com/cowprotocol/cowswap/commit/46add78c41e8612986514ffa946cb60d1c180a33))
* add analytics for notifications ([#4785](https://github.com/cowprotocol/cowswap/issues/4785)) ([5755ca0](https://github.com/cowprotocol/cowswap/commit/5755ca0b60707319c88d210c32ee8ec0b2e198cd))


### Bug Fixes

* fix issue with the swap label don't showing ([#4789](https://github.com/cowprotocol/cowswap/issues/4789)) ([63c0f55](https://github.com/cowprotocol/cowswap/commit/63c0f55c3a5e6565484708fc0bb27251843cf1ee))

## [1.79.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.78.2...cowswap-v1.79.0) (2024-08-09)


### Features

* add cow amm banner ([#4780](https://github.com/cowprotocol/cowswap/issues/4780)) ([#4781](https://github.com/cowprotocol/cowswap/issues/4781)) ([19791e5](https://github.com/cowprotocol/cowswap/commit/19791e58c7f55248f475bb9ee767d3ca6d6936af))
* switch cowfi header cta button ([#4769](https://github.com/cowprotocol/cowswap/issues/4769)) ([f87c0fe](https://github.com/cowprotocol/cowswap/commit/f87c0feee1bd3dce0a524ff61b54c86265b81605))


### Bug Fixes

* height ([a224463](https://github.com/cowprotocol/cowswap/commit/a22446352e52a9752d5888fd86cbdec43d3f5d64))

## [1.78.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.78.1...cowswap-v1.78.2) (2024-08-02)


### Bug Fixes

* fix race condition with unsuported tokens ([#4762](https://github.com/cowprotocol/cowswap/issues/4762)) ([ee70bb0](https://github.com/cowprotocol/cowswap/commit/ee70bb0b10e98621909d1811c4fece520ae5c6b3))

## [1.78.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.78.0...cowswap-v1.78.1) (2024-07-31)


### Bug Fixes

* flashing network selector/tokens when connect to a wallet in ano… ([#4747](https://github.com/cowprotocol/cowswap/issues/4747)) ([856240f](https://github.com/cowprotocol/cowswap/commit/856240f688a8238ed4138a1c8ec053c34b2e4ce6))
* **twap:** make TWAP warning less scary ([#4728](https://github.com/cowprotocol/cowswap/issues/4728)) ([00b24d1](https://github.com/cowprotocol/cowswap/commit/00b24d1ada6b0673ddefbb3bff5ba4eb9b0988c9))

## [1.78.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.77.1...cowswap-v1.78.0) (2024-07-18)


### Features

* refactor and untangle analytics ([#4718](https://github.com/cowprotocol/cowswap/issues/4718)) ([ee396eb](https://github.com/cowprotocol/cowswap/commit/ee396eb1c4ef9a786810ed20b20020b4cb986460))


### Bug Fixes

* keep accordion open on price refresh ([#4725](https://github.com/cowprotocol/cowswap/issues/4725)) ([99ef519](https://github.com/cowprotocol/cowswap/commit/99ef519b48ea64e9bd76acbfe032778b23997e2d))

## [1.77.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.77.0...cowswap-v1.77.1) (2024-07-17)


### Bug Fixes

* **permit:** filter out permit signer and rotate it ([#4719](https://github.com/cowprotocol/cowswap/issues/4719)) ([bfb1f29](https://github.com/cowprotocol/cowswap/commit/bfb1f295997ba8cf16744afce45dbd19eb8990c6))
* **permit:** typefy hooks and allow only 1 permit ([#4726](https://github.com/cowprotocol/cowswap/issues/4726)) ([0e59ce1](https://github.com/cowprotocol/cowswap/commit/0e59ce1ef730ce37e15a50407da19b6816878c4d))

## [1.77.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.76.2...cowswap-v1.77.0) (2024-07-12)


### Features

* **hooks:** simulate hook transaction via Tenderly ([#4702](https://github.com/cowprotocol/cowswap/issues/4702)) ([19ee90a](https://github.com/cowprotocol/cowswap/commit/19ee90ab37638df29269bd47572898dcc94be8f4))
* **swap:** use smart slippage ([#4649](https://github.com/cowprotocol/cowswap/issues/4649)) ([ebb22ce](https://github.com/cowprotocol/cowswap/commit/ebb22cec497dfc696d32a2fd75ecc17cfd58eb41))
* update favicon icons and manifest ([#4689](https://github.com/cowprotocol/cowswap/issues/4689)) ([549bcc0](https://github.com/cowprotocol/cowswap/commit/549bcc0dea929efdb6adbffa956dac013a73c679))


### Bug Fixes

* **hooks:** link hooks page to swap trade state ([#4698](https://github.com/cowprotocol/cowswap/issues/4698)) ([bab250c](https://github.com/cowprotocol/cowswap/commit/bab250cb9888b3ec3dab422fc91fbaf23541b778))
* **limit:** clear limit output amount when price is empty ([#4678](https://github.com/cowprotocol/cowswap/issues/4678)) ([0620a9a](https://github.com/cowprotocol/cowswap/commit/0620a9a70a31687f70ec4abc6da280d54a823cb8))
* **limit:** missing price error takes precedence over missing approval ([#4693](https://github.com/cowprotocol/cowswap/issues/4693)) ([306059e](https://github.com/cowprotocol/cowswap/commit/306059ee46c57cb14bb69eb48f06aa6c85a9e4f6))
* **safe-bundle:** don't show active SWAP button unless trade is valid ([#4672](https://github.com/cowprotocol/cowswap/issues/4672)) ([1ea49ea](https://github.com/cowprotocol/cowswap/commit/1ea49ea7552ce8a314b35c9092bc234ba38fa66f))
* **trade:** display trade details when there is no usd value of costs ([#4704](https://github.com/cowprotocol/cowswap/issues/4704)) ([62e6b78](https://github.com/cowprotocol/cowswap/commit/62e6b78ea934836f709ef4a4c6ab5f817baf592a))
* vercel redirects ([#4686](https://github.com/cowprotocol/cowswap/issues/4686)) ([107ed3a](https://github.com/cowprotocol/cowswap/commit/107ed3ad74318c14ef608cd090d1086d6389426b))

## [1.76.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.76.1...cowswap-v1.76.2) (2024-07-05)


### Bug Fixes

* don't reset output amount when it's not expected ([#4663](https://github.com/cowprotocol/cowswap/issues/4663)) ([2a0310e](https://github.com/cowprotocol/cowswap/commit/2a0310e6ea56f9115cd435a433520272dbb9bf22))
* uploading appData too late ([#4667](https://github.com/cowprotocol/cowswap/issues/4667)) ([cf6f037](https://github.com/cowprotocol/cowswap/commit/cf6f0377e5f4b9a3fa5298acf6ba55c026ea3232))
* **widget:** always open links from widget markdown in a new tab ([#4671](https://github.com/cowprotocol/cowswap/issues/4671)) ([#4684](https://github.com/cowprotocol/cowswap/issues/4684)) ([9edbe5b](https://github.com/cowprotocol/cowswap/commit/9edbe5bbda714463a7b035624c44aa523b494468))

## [1.76.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.76.0...cowswap-v1.76.1) (2024-07-02)


### Bug Fixes

* **widget:** use custom label and content for partner fee ([#4646](https://github.com/cowprotocol/cowswap/issues/4646)) ([#4651](https://github.com/cowprotocol/cowswap/issues/4651)) ([2d71424](https://github.com/cowprotocol/cowswap/commit/2d714245fded22bba70b0d3197a28d43764eb6ee))

## [1.76.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.75.0...cowswap-v1.76.0) (2024-06-27)


### Features

* update legal pages ([#4619](https://github.com/cowprotocol/cowswap/issues/4619)) ([de136fe](https://github.com/cowprotocol/cowswap/commit/de136fe708aabb32ae9e23ae9170d296956fd737))


### Bug Fixes

* fix inconsistent use of the word favourite between US/UK version ([#4572](https://github.com/cowprotocol/cowswap/issues/4572)) ([c60f8b4](https://github.com/cowprotocol/cowswap/commit/c60f8b409291d6acd1ee997b3cb2fcac24acb325))
* **limit-orders:** redesign confirm modal context usage ([#4628](https://github.com/cowprotocol/cowswap/issues/4628)) ([856f180](https://github.com/cowprotocol/cowswap/commit/856f180573c156c9da73bf68a8a7317eea49cb67))
* **trade:** keep trade state after navigating from trade widgets ([#4601](https://github.com/cowprotocol/cowswap/issues/4601)) ([56d4eda](https://github.com/cowprotocol/cowswap/commit/56d4eda76007d60292a5be288c68e98a918b638a))

## [1.75.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.74.1...cowswap-v1.75.0) (2024-06-25)


### Features

* update vcow image ([#4611](https://github.com/cowprotocol/cowswap/issues/4611)) ([8212880](https://github.com/cowprotocol/cowswap/commit/821288029e011b104598fb58c8174ee2bf840f80))


### Bug Fixes

* update cow token logo ([#4608](https://github.com/cowprotocol/cowswap/issues/4608)) ([51ad5f4](https://github.com/cowprotocol/cowswap/commit/51ad5f47a7e4bf0e4ea8b9998774a82874f47306))
* **widget:** override new button text color ([#4616](https://github.com/cowprotocol/cowswap/issues/4616)) ([77793a4](https://github.com/cowprotocol/cowswap/commit/77793a4f0f740494ec929966efc64ebd0f24b9f9))

## [1.74.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.74.0...cowswap-v1.74.1) (2024-06-25)


### Bug Fixes

* improve UI responsiveness ([#4593](https://github.com/cowprotocol/cowswap/issues/4593)) ([2ba1492](https://github.com/cowprotocol/cowswap/commit/2ba14925c590b5939d26658543c16a512fff7bf1))
* use same settings icon on all forms ([#4594](https://github.com/cowprotocol/cowswap/issues/4594)) ([49f550f](https://github.com/cowprotocol/cowswap/commit/49f550f1ffdeb189c540d6141f23f750e51ba597))

## [1.74.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.73.0...cowswap-v1.74.0) (2024-06-24)


### Features

* **explorer:** truncated orderId with CSS ([#4557](https://github.com/cowprotocol/cowswap/issues/4557)) ([88b5c06](https://github.com/cowprotocol/cowswap/commit/88b5c061beefdf7866a39a84a940ea01715e9c0b))
* **rebranding:** merge 📦 Big Package "Re-branding" 📦  ([#4543](https://github.com/cowprotocol/cowswap/issues/4543)) ([ce9ab43](https://github.com/cowprotocol/cowswap/commit/ce9ab4317f304c86e3e1ec37825379e427099518))
* theme unification and cleaning ([#4580](https://github.com/cowprotocol/cowswap/issues/4580)) ([c1538b1](https://github.com/cowprotocol/cowswap/commit/c1538b16d9c890c95d73ea92ffb93b2065233d90))


### Bug Fixes

* detect a connected user in a safe ([#4508](https://github.com/cowprotocol/cowswap/issues/4508)) ([0fed667](https://github.com/cowprotocol/cowswap/commit/0fed667d7063c9db07f5cd5671dcc36ee25ab685))
* **rebranding:** polish UI ([#4581](https://github.com/cowprotocol/cowswap/issues/4581)) ([a038458](https://github.com/cowprotocol/cowswap/commit/a038458a23d91fb9b624679950ee6492a966ccba))
* remove SafeTokenWarning banner ([#4578](https://github.com/cowprotocol/cowswap/issues/4578)) ([778e392](https://github.com/cowprotocol/cowswap/commit/778e3926d1cc3f7d9daa3e97f09639f5a4352f37))
* reset isDropdownVisible status in large screen ([#4584](https://github.com/cowprotocol/cowswap/issues/4584)) ([d5fa633](https://github.com/cowprotocol/cowswap/commit/d5fa63339f8c65a89631ab07540518329c8c674f))
* **twap:** improve output amount resetting logic ([#4571](https://github.com/cowprotocol/cowswap/issues/4571)) ([9109d7c](https://github.com/cowprotocol/cowswap/commit/9109d7cc5e394d5806e2cf899333de3df5b4db23))
* **widget:** fix widget usage in more than one iframe ([#4586](https://github.com/cowprotocol/cowswap/issues/4586)) ([65522e5](https://github.com/cowprotocol/cowswap/commit/65522e57d0f3f9a5692cadc32bed475e35b9f7d1))

## [1.73.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.72.1...cowswap-v1.73.0) (2024-06-18)


### Features

* cowswap volume fee ([#4547](https://github.com/cowprotocol/cowswap/issues/4547)) ([85ef997](https://github.com/cowprotocol/cowswap/commit/85ef997771a7ce5e51d6b1f41335d89913b5dfbb))
* **limit-orders:** add partner fee (variant A) ([#4502](https://github.com/cowprotocol/cowswap/issues/4502)) ([9e12875](https://github.com/cowprotocol/cowswap/commit/9e12875ed9a7625ae9e7f5c26b3a8a680b828e34))
* **limit-orders:** allow partner fee (variant B) ([#4467](https://github.com/cowprotocol/cowswap/issues/4467)) ([72d9af8](https://github.com/cowprotocol/cowswap/commit/72d9af8869618e8f12aa2170326cf18b35db786a))
* reduce ethflow slippage for non mainnet chains ([#4524](https://github.com/cowprotocol/cowswap/issues/4524)) ([8c47780](https://github.com/cowprotocol/cowswap/commit/8c4778022b9d4970c0aa716f66285a04dac4c101))
* **trade:** sync trade amounts between widgets ([#4521](https://github.com/cowprotocol/cowswap/issues/4521)) ([538bf04](https://github.com/cowprotocol/cowswap/commit/538bf04cc38744af04a719d5f4261f0951a07203))
* **twap:** add partner fee ([#4496](https://github.com/cowprotocol/cowswap/issues/4496)) ([a882522](https://github.com/cowprotocol/cowswap/commit/a88252272229728663941d291a4a3813d90e97a8))
* update T&C for arb1 ([#4552](https://github.com/cowprotocol/cowswap/issues/4552)) ([f43786e](https://github.com/cowprotocol/cowswap/commit/f43786e90a040c42a0cb58c38c8280a0cd5a5acb))
* **widget:** use flexible config for partner fee ([#4546](https://github.com/cowprotocol/cowswap/issues/4546)) ([e23194a](https://github.com/cowprotocol/cowswap/commit/e23194acde8d97b8b4f852e73f4f59b33e65a8b8))


### Bug Fixes

* **arb1:** adjust progress bar timing to 40s ([#4523](https://github.com/cowprotocol/cowswap/issues/4523)) ([49e0957](https://github.com/cowprotocol/cowswap/commit/49e0957a8b2228d655038b3beebf7e5084f70120))
* connect wallet in e2e tests ([#4531](https://github.com/cowprotocol/cowswap/issues/4531)) ([0b5c369](https://github.com/cowprotocol/cowswap/commit/0b5c369f633151fc7f77768d6f39a4580d1c553f))
* display network selector for Rabby + Safe ([#4510](https://github.com/cowprotocol/cowswap/issues/4510)) ([1bfafeb](https://github.com/cowprotocol/cowswap/commit/1bfafeb1b10ea8b5622827a3f84f19faeab95b70))
* **limit:** do not allow wrap without full balance ([#4526](https://github.com/cowprotocol/cowswap/issues/4526)) ([7142d1c](https://github.com/cowprotocol/cowswap/commit/7142d1c3a5215aca3e4c1e793501feb25f0fc402))
* **quotes:** remove verified quotes ([#4528](https://github.com/cowprotocol/cowswap/issues/4528)) ([d05b397](https://github.com/cowprotocol/cowswap/commit/d05b397a2054a88246f4c9e73bc08ee411f33d70))
* **slippage:** always reset ethflow slippage when changing networks ([#4559](https://github.com/cowprotocol/cowswap/issues/4559)) ([e34cf14](https://github.com/cowprotocol/cowswap/commit/e34cf14b6279f12751071762bf97d50240c721b6))
* **trade:** check recipient against account and ens name ([#4530](https://github.com/cowprotocol/cowswap/issues/4530)) ([d2dd0b6](https://github.com/cowprotocol/cowswap/commit/d2dd0b6aa835904e4fbe191ef63bca586a222c60))
* **trade:** display recipient on confirm screen ([#4558](https://github.com/cowprotocol/cowswap/issues/4558)) ([7e8e3e6](https://github.com/cowprotocol/cowswap/commit/7e8e3e6ec9d2ed214ae37481e296800ecb17aed1))
* **widget:** allow using walletconnect in widget mobile ([#4522](https://github.com/cowprotocol/cowswap/issues/4522)) ([ff58638](https://github.com/cowprotocol/cowswap/commit/ff586381f673314cf5d847f4f52da2e9e4015bea))
* **widget:** remove favorite tooltip for widget ([#4527](https://github.com/cowprotocol/cowswap/issues/4527)) ([3b864f5](https://github.com/cowprotocol/cowswap/commit/3b864f57c09fdb74a4fdc90e93c6a64e1e30315f))

## [1.72.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.72.0...cowswap-v1.72.1) (2024-06-06)


### Bug Fixes

* force release please to make a release ([#4517](https://github.com/cowprotocol/cowswap/issues/4517)) ([a5029cd](https://github.com/cowprotocol/cowswap/commit/a5029cd122d9fb2420680b2164573fa182b16bd3))

## [1.72.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.71.1...cowswap-v1.72.0) (2024-06-06)


### Features

* expose the address of a token in the HTML ([#4501](https://github.com/cowprotocol/cowswap/issues/4501)) ([0d5f468](https://github.com/cowprotocol/cowswap/commit/0d5f468e48c1b2dee56375bc80ed3f3c785c6b66))
* use bff proxies ([#4491](https://github.com/cowprotocol/cowswap/issues/4491)) ([cb9586b](https://github.com/cowprotocol/cowswap/commit/cb9586bbb4f78498a39b2b01c6bb1e4255dd0c46))


### Bug Fixes

* fix lint issue ([#4514](https://github.com/cowprotocol/cowswap/issues/4514)) ([48a7536](https://github.com/cowprotocol/cowswap/commit/48a75363422e5e63e246f0553e8372ce94a3f6b6))

## [1.71.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.71.0...cowswap-v1.71.1) (2024-06-04)


### Bug Fixes

* change something for cowswap to deploy with release please ([#4506](https://github.com/cowprotocol/cowswap/issues/4506)) ([df0c832](https://github.com/cowprotocol/cowswap/commit/df0c8325d77a097161aa4da9490d3bc3d6dcd94c))

## [1.71.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.70.0...cowswap-v1.71.0) (2024-05-29)


### Features

* add support for ERC-3770 on recipient addr ([#4418](https://github.com/cowprotocol/cowswap/issues/4418)) ([3e1732d](https://github.com/cowprotocol/cowswap/commit/3e1732dfb11f2cb4fdb815802e68c1d03af29c80))
* **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))
* don't pollute the history with widget changes ([#4470](https://github.com/cowprotocol/cowswap/issues/4470)) ([9e813bd](https://github.com/cowprotocol/cowswap/commit/9e813bd835f67f6d3676a2e06164606e7c434d5a))
* improve message for wrong prefix on networks ([#4468](https://github.com/cowprotocol/cowswap/issues/4468)) ([fdb36e5](https://github.com/cowprotocol/cowswap/commit/fdb36e57ec937c883106d200df130e3072181f02))


### Bug Fixes

* **explorer:** adjust almost fully filled orders displaying ([#4482](https://github.com/cowprotocol/cowswap/issues/4482)) ([3a5d654](https://github.com/cowprotocol/cowswap/commit/3a5d65484ab8818f5a5ba6aa18e6519243f686ee))
* fix safe read-only button tooltip ([#4475](https://github.com/cowprotocol/cowswap/issues/4475)) ([f33a1eb](https://github.com/cowprotocol/cowswap/commit/f33a1ebb5eb347e62deca26211a7779f41db63df))
* **limit-orders:** adjust almost fully filled orders displaying ([#4477](https://github.com/cowprotocol/cowswap/issues/4477)) ([d89a0d4](https://github.com/cowprotocol/cowswap/commit/d89a0d4ba76836c05526091c9ab6bee8a5048616))
* **limit-orders:** don't update trade context after review modal open ([#4476](https://github.com/cowprotocol/cowswap/issues/4476)) ([972ddd9](https://github.com/cowprotocol/cowswap/commit/972ddd93b2ad3c8cb7fbbf7a4ce4c1e452324fe0))
* navigate with widget awareness ([#4471](https://github.com/cowprotocol/cowswap/issues/4471)) ([f0c4134](https://github.com/cowprotocol/cowswap/commit/f0c41344eea751006a4fe0b66865b2c5c30a5310))
* **usd-estimation:** no usd estimations for native ([#4352](https://github.com/cowprotocol/cowswap/issues/4352)) ([e986ec4](https://github.com/cowprotocol/cowswap/commit/e986ec4812119ed5c79347efe8d21aa25c9629dd))

## [1.70.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.69.0...cowswap-v1.70.0) (2024-05-22)


### Features

* notifications feed ([#4409](https://github.com/cowprotocol/cowswap/issues/4409)) ([d6f2987](https://github.com/cowprotocol/cowswap/commit/d6f2987b57e3b5bd90d029aca0215134ec1a050b))
* **usd-estimation:** add defillama price source ([#4341](https://github.com/cowprotocol/cowswap/issues/4341)) ([96a0343](https://github.com/cowprotocol/cowswap/commit/96a03437710b807c966debdaa8ce5219ddaff7a4))
* **wallets:** support eip6963 multi-injected providers ([#4416](https://github.com/cowprotocol/cowswap/issues/4416)) ([85a78bb](https://github.com/cowprotocol/cowswap/commit/85a78bbfe9b0a8fe5428b25aba0b38944b10987d))


### Bug Fixes

* **notifications:** don't fail when CMS API is down ([#4464](https://github.com/cowprotocol/cowswap/issues/4464)) ([6ba4e76](https://github.com/cowprotocol/cowswap/commit/6ba4e76d89304cea1941ba77dd9d976911338288))
* **twap:** lower minimum sell amount ([#4428](https://github.com/cowprotocol/cowswap/issues/4428)) ([fb9e91b](https://github.com/cowprotocol/cowswap/commit/fb9e91ba5e46a2df3bef15842a5da9a1cfa6d534))
* **widget-cfg:** don't request network switching with standalone mode ([#4463](https://github.com/cowprotocol/cowswap/issues/4463)) ([41ef4cc](https://github.com/cowprotocol/cowswap/commit/41ef4cc83358c17742fb3e5472e1aa8dc19d475d))

## [1.69.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.5...cowswap-v1.69.0) (2024-05-14)


### Features

* support counterfactual safes ([461b83a](https://github.com/cowprotocol/cowswap/commit/461b83a139509ef308e3d147e7674f53ca52fe73))

## [1.68.5](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.4...cowswap-v1.68.5) (2024-05-13)


### Bug Fixes

* clean outdated localStorage stores ([#4413](https://github.com/cowprotocol/cowswap/issues/4413)) ([a193338](https://github.com/cowprotocol/cowswap/commit/a193338717134d5a2f3a9c02a73b865553e99d38))

## [1.68.4](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.3...cowswap-v1.68.4) (2024-05-03)


### Bug Fixes

* **widget:** improve PartnerFeeDiscarded error ([#4405](https://github.com/cowprotocol/cowswap/issues/4405)) ([2053e98](https://github.com/cowprotocol/cowswap/commit/2053e980adaac7a422a30933e2ce635ea32c2727))

## [1.68.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.2...cowswap-v1.68.3) (2024-05-03)


### Bug Fixes

* **widget:** log an error when partnerFee was discarded ([#4403](https://github.com/cowprotocol/cowswap/issues/4403)) ([4131598](https://github.com/cowprotocol/cowswap/commit/413159818fc0e44315041dba2daf73a87d021d53))

## [1.68.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.1...cowswap-v1.68.2) (2024-05-02)


### Bug Fixes

* fix ipfs relative paths ([#4400](https://github.com/cowprotocol/cowswap/issues/4400)) ([322d72a](https://github.com/cowprotocol/cowswap/commit/322d72a8e9eb4ef01402af6c7df4dc0cf0ab0428))

## [1.68.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.68.0...cowswap-v1.68.1) (2024-05-02)


### Bug Fixes

* deploy to IPFS automatically ([#4397](https://github.com/cowprotocol/cowswap/issues/4397)) ([754066c](https://github.com/cowprotocol/cowswap/commit/754066c6f58c2195fa392442136205b05ad52cc7))

## [1.68.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.67.0...cowswap-v1.68.0) (2024-05-02)


### Features

* add coingecko token list to Gnosis chain ([#4365](https://github.com/cowprotocol/cowswap/issues/4365)) ([9bc853f](https://github.com/cowprotocol/cowswap/commit/9bc853fd4089669d9bb046d6bb8fc2fe60c0ffe0))

## [1.67.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.66.0...cowswap-v1.67.0) (2024-05-01)


### Features

* allow to modify the label of the fee and its tooltip ([a5dd0ba](https://github.com/cowprotocol/cowswap/commit/a5dd0baf19e6831fc135dd6c089e66ea0edd14f4))
* hide tooltips on scroll ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* improve UX for tooltips on mobile ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* unify all tooltips so the behavior is coherent ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))

## [1.66.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.65.2...cowswap-v1.66.0) (2024-04-23)


### Features

* **swap:** display warning for safe token ([#4290](https://github.com/cowprotocol/cowswap/issues/4290)) ([1e20da6](https://github.com/cowprotocol/cowswap/commit/1e20da6ae9ba4647a139f526ae0548ea67f9180e))
* **swap:** improve read only message for safe ([#4296](https://github.com/cowprotocol/cowswap/issues/4296)) ([e58aee3](https://github.com/cowprotocol/cowswap/commit/e58aee39c3d85f267218a8575f85f7495dc8d290))


### Bug Fixes

* **swap:** display order button in the widget top ([#4297](https://github.com/cowprotocol/cowswap/issues/4297)) ([16d1def](https://github.com/cowprotocol/cowswap/commit/16d1def3fbb1a3bb803cf2e1978dcd96668f8bc9))

## [1.65.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.65.1...cowswap-v1.65.2) (2024-04-18)


### Bug Fixes

* **approve:** remove Metamask special approve flow ([#4244](https://github.com/cowprotocol/cowswap/issues/4244)) ([6d13b22](https://github.com/cowprotocol/cowswap/commit/6d13b223e9cc916a41a9735e9a930880e4a80d15))
* **blocknative:** fix blocknative invalid tx hash ([#4258](https://github.com/cowprotocol/cowswap/issues/4258)) ([2994b50](https://github.com/cowprotocol/cowswap/commit/2994b501aafb0e232c9cc32514f8d708ee5ebbb7))
* display initial for tokens without image ([#4230](https://github.com/cowprotocol/cowswap/issues/4230)) ([ca7d62c](https://github.com/cowprotocol/cowswap/commit/ca7d62c1469bb54a6955d3007a779b23ea3985e6))
* **sentry:** ignore apple devices TypeError ([#4252](https://github.com/cowprotocol/cowswap/issues/4252)) ([33f697b](https://github.com/cowprotocol/cowswap/commit/33f697bd267646b39266831792fb0dc560b8d218))
* **tooltips:** replace tooltip &lt;p&gt; with <br /> ([#4253](https://github.com/cowprotocol/cowswap/issues/4253)) ([ed5f9d2](https://github.com/cowprotocol/cowswap/commit/ed5f9d2346206f194eeeb791a3cb1237d8b934d2))
* **trade:** take time offset into account for quote and order validTo ([#4236](https://github.com/cowprotocol/cowswap/issues/4236)) ([7184ad4](https://github.com/cowprotocol/cowswap/commit/7184ad4655c3ae74fde084e306426fc49a11a360))

## [1.65.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.65.0...cowswap-v1.65.1) (2024-04-15)


### Bug Fixes

* **widget:** don't reset palette state while navigating ([#4239](https://github.com/cowprotocol/cowswap/issues/4239)) ([b963bc3](https://github.com/cowprotocol/cowswap/commit/b963bc32739084e729320c49c50f51e8aed86616))

## [1.65.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.64.3...cowswap-v1.65.0) (2024-04-11)


### Features

* **recreate:** add analytics events for recreate modal ([#4134](https://github.com/cowprotocol/cowswap/issues/4134)) ([fb3a0b9](https://github.com/cowprotocol/cowswap/commit/fb3a0b962833be594f15fd54661bd16c2f482481))
* **tokens-table:** do not show explorer link for native token ([#4187](https://github.com/cowprotocol/cowswap/issues/4187)) ([af89cd1](https://github.com/cowprotocol/cowswap/commit/af89cd1be54a67a3d38c23b59c5ca70b1c6f13f0))
* **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
* **widget:** option to disable sounds ([#4172](https://github.com/cowprotocol/cowswap/issues/4172)) ([a1d330d](https://github.com/cowprotocol/cowswap/commit/a1d330d46620d3724bb97fb03a07e9080966c1e4))
* **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
* **widget:** use custom sounds in widget ([#4162](https://github.com/cowprotocol/cowswap/issues/4162)) ([0dfd679](https://github.com/cowprotocol/cowswap/commit/0dfd67946a1ed383a5ffeeadee3044e45bd92eb0))
* **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
* **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))


### Bug Fixes

* add partner fee too app-data only for swap orders ([#4182](https://github.com/cowprotocol/cowswap/issues/4182)) ([280f94c](https://github.com/cowprotocol/cowswap/commit/280f94c385b059828d60e2dd47d631a4f093ae32))
* **eth-flow:** adjust stepper appearance ([#4154](https://github.com/cowprotocol/cowswap/issues/4154)) ([a13cb95](https://github.com/cowprotocol/cowswap/commit/a13cb953216f2cee2ed590f1afd20409821d359d))
* **eth-flow:** handle creation tx replacement ([#4143](https://github.com/cowprotocol/cowswap/issues/4143)) ([974181c](https://github.com/cowprotocol/cowswap/commit/974181c91a42e6659a7799d93d14dadd47aef4b6))
* fix feedback and fortune buttons displaying ([#4142](https://github.com/cowprotocol/cowswap/issues/4142)) ([d914270](https://github.com/cowprotocol/cowswap/commit/d9142702eb3d8a37a165bcf20f45c1ff888cea78))
* **limit-orders:** revert use ff for zero balance orders ([0ca904c](https://github.com/cowprotocol/cowswap/commit/0ca904c2faab89ec837e4e5fafb7f22ed97fb886))
* **mobile:** adjust fee display for tiny widths ([#4189](https://github.com/cowprotocol/cowswap/issues/4189)) ([6663e0c](https://github.com/cowprotocol/cowswap/commit/6663e0c81475f1421e95da5544adc8ab9abf34bc))
* **permit:** gnosis chain permits ([#4152](https://github.com/cowprotocol/cowswap/issues/4152)) ([26b703f](https://github.com/cowprotocol/cowswap/commit/26b703f2a45715fce0c4418d1f45fdceab2a716e))
* **recreate:** fix recreate buy amount for pairs with different decimal precision ([#4129](https://github.com/cowprotocol/cowswap/issues/4129)) ([64ebbd5](https://github.com/cowprotocol/cowswap/commit/64ebbd53d22f4c6da052039789485aedf85c35a8))
* remove outdated transactions ([#4062](https://github.com/cowprotocol/cowswap/issues/4062)) ([9fc63ed](https://github.com/cowprotocol/cowswap/commit/9fc63ed73b6b79f3df126b2f86ccdef3d2b817df))
* **safe:** add replaced status to transactions ([#4125](https://github.com/cowprotocol/cowswap/issues/4125)) ([6714081](https://github.com/cowprotocol/cowswap/commit/671408195d9e8abef4e39dcc7a86b82bc3707556))
* **safe:** handle tx via wc with 1/1 signs ([#4174](https://github.com/cowprotocol/cowswap/issues/4174)) ([86ae80c](https://github.com/cowprotocol/cowswap/commit/86ae80c56140f35b23c819a801a25a7c33d35125))
* **safe:** hide pre-signed order when it was replaced ([#4130](https://github.com/cowprotocol/cowswap/issues/4130)) ([ecb22a8](https://github.com/cowprotocol/cowswap/commit/ecb22a885b30915b110e12c44364a50b0138867a))
* sentry error toLowerCase ([#4191](https://github.com/cowprotocol/cowswap/issues/4191)) ([8fd5f19](https://github.com/cowprotocol/cowswap/commit/8fd5f19f5bbb3509212cd5d876c3a83f4330410b))
* **transactions:** add expiration time to on-chain txs ([#4140](https://github.com/cowprotocol/cowswap/issues/4140)) ([1f7957a](https://github.com/cowprotocol/cowswap/commit/1f7957abddfe55c2a312dc50c51c43560627071e))
* **widget:** disable connect wallet button in dapp mode ([#4170](https://github.com/cowprotocol/cowswap/issues/4170)) ([46d89da](https://github.com/cowprotocol/cowswap/commit/46d89daa7551be544f272f218e547b5f0c6a0d19))
* **widget:** send trade params to widget integrator ([#4196](https://github.com/cowprotocol/cowswap/issues/4196)) ([0036a6b](https://github.com/cowprotocol/cowswap/commit/0036a6b3cd8ac8015a4271ea3477232d1a4e180d))

## [1.64.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.64.2...cowswap-v1.64.3) (2024-04-02)


### Bug Fixes

* **april-fools:** revert april fools ([#4116](https://github.com/cowprotocol/cowswap/issues/4116)) ([c8fb7d1](https://github.com/cowprotocol/cowswap/commit/c8fb7d1cb124f154e1b317c3e6fd503a65a12336))

## [1.64.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.64.1...cowswap-v1.64.2) (2024-03-29)


### Bug Fixes

* **limit-orders:** use ff for zero balance orders ([#4117](https://github.com/cowprotocol/cowswap/issues/4117)) ([28c60bd](https://github.com/cowprotocol/cowswap/commit/28c60bda7b8817ff7156e9e24f253f57da427b36))

## [1.64.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.64.0...cowswap-v1.64.1) (2024-03-28)


### Bug Fixes

* fix(april-fools): replace dpaste lists with a version stored on github ([#4112](https://github.com/cowprotocol/cowswap/issues/4112)) ([9ba35d9](https://github.com/cowprotocol/cowswap/commit/9ba35d9ba1f45b834f172d030e27d29ebc6b9774))

## [1.64.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.63.3...cowswap-v1.64.0) (2024-03-28)


### Features

* **april-fools:** add `I'm Feeling Lucky` ([#4094](https://github.com/cowprotocol/cowswap/issues/4094)) ([895991b](https://github.com/cowprotocol/cowswap/commit/895991bbdaa6fb496483a8c369b1b0f445828db5))
* **limit:** allow limit orders without balance ([#3742](https://github.com/cowprotocol/cowswap/issues/3742)) ([9c69a01](https://github.com/cowprotocol/cowswap/commit/9c69a011d4575a370eda9ae5bb11538cc9f2ac93))
* **limit:** edit limit order (disabled) ([#4015](https://github.com/cowprotocol/cowswap/issues/4015)) ([a4e9c5b](https://github.com/cowprotocol/cowswap/commit/a4e9c5b545125104d699a878633ef3a54d82fb60))

## [1.63.3](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.63.2...cowswap-v1.63.3) (2024-03-21)


### Bug Fixes

* show link to Explorer for twap orders ([#4075](https://github.com/cowprotocol/cowswap/issues/4075)) ([cab8652](https://github.com/cowprotocol/cowswap/commit/cab86522f8275ae24510e447add7db108ee1149c))

## [1.63.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.63.1...cowswap-v1.63.2) (2024-03-21)


### Bug Fixes

* display correct links for on-chain notifications ([#4072](https://github.com/cowprotocol/cowswap/issues/4072)) ([aef847f](https://github.com/cowprotocol/cowswap/commit/aef847f19e831a6badc81e95a3c008e716ab004c))

## [1.63.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.63.0...cowswap-v1.63.1) (2024-03-21)


### Bug Fixes

* **explorer:** use feature flag to show charts and tokens table ([#4068](https://github.com/cowprotocol/cowswap/issues/4068)) ([9bff945](https://github.com/cowprotocol/cowswap/commit/9bff945c0f891aa5d6527a51c509b9f0802741d5))

## [1.63.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.62.0...cowswap-v1.63.0) (2024-03-20)


### Features

* **events:** fire on-chain transactions events ([#4045](https://github.com/cowprotocol/cowswap/issues/4045)) ([362b937](https://github.com/cowprotocol/cowswap/commit/362b9371e8d0ad09ea5501e5a58608c28eb5cf43))


### Bug Fixes

* **recreate:** fix 1h duration orders ([#4059](https://github.com/cowprotocol/cowswap/issues/4059)) ([d4d82fc](https://github.com/cowprotocol/cowswap/commit/d4d82fca355ac6ff316d7583cbe5de5d7def7fd1))
* **twap:** add on TWAP wallet requirements note about Safe not deployed ([#4061](https://github.com/cowprotocol/cowswap/issues/4061)) ([1223e20](https://github.com/cowprotocol/cowswap/commit/1223e20d7d1b153b726d8033d0829e9fde90aa40))

## [1.62.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.61.1...cowswap-v1.62.0) (2024-03-12)


### Features

* add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
* **partner-fee:** validate, display and sign order with partner fee ([#3941](https://github.com/cowprotocol/cowswap/issues/3941)) ([036f5d7](https://github.com/cowprotocol/cowswap/commit/036f5d7a06eb9d461101b28d917cc8eba3ec4fc2))


### Bug Fixes

* **order-receipt:** fix recreate order button style ([#4019](https://github.com/cowprotocol/cowswap/issues/4019)) ([e023d65](https://github.com/cowprotocol/cowswap/commit/e023d653c6f063232926aaeb83e12dc428acfd39))
* rebrand fee labels and improve tooltips ([#4005](https://github.com/cowprotocol/cowswap/issues/4005)) ([6488f52](https://github.com/cowprotocol/cowswap/commit/6488f52cf84604aae3a63320eee55d5768ef566c))
* **recreate:** add limit to recreate limit order modal title ([#3988](https://github.com/cowprotocol/cowswap/issues/3988)) ([294bc5d](https://github.com/cowprotocol/cowswap/commit/294bc5d6b18cb4f659126aa5141cb9aa99c1ccab))
* **swap:** no quote expired when there's no input ([#3985](https://github.com/cowprotocol/cowswap/issues/3985)) ([d32f07f](https://github.com/cowprotocol/cowswap/commit/d32f07fe47dd62243533f7336c04ecb8e9320d7b))
* use trade object to determine expired quote rather than removed property ([#3994](https://github.com/cowprotocol/cowswap/issues/3994)) ([6c6db8e](https://github.com/cowprotocol/cowswap/commit/6c6db8ecbc86bb948ba0b7e4138f157aabf1e5d4))
* use trade object to determine expired quote rather than removed property ([#3994](https://github.com/cowprotocol/cowswap/issues/3994)) ([#4003](https://github.com/cowprotocol/cowswap/issues/4003)) ([102f2ad](https://github.com/cowprotocol/cowswap/commit/102f2ad0691db4c6dc9dd69c7a2967f3b1807213))

## [1.61.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.61.0...cowswap-v1.61.1) (2024-03-04)


### Bug Fixes

* **eth-flow:** prevent orders with expired quotes ([#3965](https://github.com/cowprotocol/cowswap/issues/3965)) ([f965020](https://github.com/cowprotocol/cowswap/commit/f965020cec5e0901138130e050939cc912ca4fd8))

## [1.61.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.60.0...cowswap-v1.61.0) (2024-02-29)


### Features

* **appzi:** new appzi survey for limit orders ([#3918](https://github.com/cowprotocol/cowswap/issues/3918)) ([99e004a](https://github.com/cowprotocol/cowswap/commit/99e004ad410aefacfd2090423ef2e480ed48302e))
* **settings:** remove expert mode ([#3905](https://github.com/cowprotocol/cowswap/issues/3905)) ([4f98075](https://github.com/cowprotocol/cowswap/commit/4f98075dbcacdbf49e9f43fb2a0936411d6a7365))


### Bug Fixes

* always open hash links in new tab ([#3888](https://github.com/cowprotocol/cowswap/issues/3888)) ([0275de9](https://github.com/cowprotocol/cowswap/commit/0275de9f3ec04f697878b0507a5b09c8842aa7ba))
* increase quote refresh interval for Swap and TWAP ([#3935](https://github.com/cowprotocol/cowswap/issues/3935)) ([55b5e22](https://github.com/cowprotocol/cowswap/commit/55b5e22b8ad0edba5e8c114fcd11f8caa39b5ab4))
* **limit-orders:** price updated warning should not be displayed ([#3925](https://github.com/cowprotocol/cowswap/issues/3925)) ([7a5b64d](https://github.com/cowprotocol/cowswap/commit/7a5b64d9c0c0d7e44aa15502735c843d43bc1fc7))
* **twap:** allow creating orders with 100% slippage ([#3897](https://github.com/cowprotocol/cowswap/issues/3897)) ([05a604d](https://github.com/cowprotocol/cowswap/commit/05a604d0fd92f0ca0295b1ccef0cf4c7725ab24c))

## [1.60.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.59.2...cowswap-v1.60.0) (2024-02-22)


### Features

* style improvements ([#3884](https://github.com/cowprotocol/cowswap/issues/3884)) ([f4d5e17](https://github.com/cowprotocol/cowswap/commit/f4d5e175df0b8090ec68f83af607e3ae407c64e2))
* **token-lists:** limit token lists by 5000 tokens ([#3881](https://github.com/cowprotocol/cowswap/issues/3881)) ([d8a5816](https://github.com/cowprotocol/cowswap/commit/d8a581652fcca40fc8ec2f63e904855b616951c6))
* **trade:** display loading state for trade confirmation ([#3856](https://github.com/cowprotocol/cowswap/issues/3856)) ([980f721](https://github.com/cowprotocol/cowswap/commit/980f721da30af439ef1ed1c28733b717d38bbc7c))
* update T&C content and add ToC to policies pages ([#3865](https://github.com/cowprotocol/cowswap/issues/3865)) ([72f8a43](https://github.com/cowprotocol/cowswap/commit/72f8a4391840b3ad342f14e05bface90ccdc9d60))
* **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))


### Bug Fixes

* don't request network changing just after previous one ([#3848](https://github.com/cowprotocol/cowswap/issues/3848)) ([58c70a0](https://github.com/cowprotocol/cowswap/commit/58c70a07f45c0886fbc75cac0aa33fae015282fe))
* **notifications:** display proper type in order notifications ([#3887](https://github.com/cowprotocol/cowswap/issues/3887)) ([bfb6c01](https://github.com/cowprotocol/cowswap/commit/bfb6c01e9f3e744a47774cb52836469c2ad2f09f))
* place order notification sell amount ([#3857](https://github.com/cowprotocol/cowswap/issues/3857)) ([2909e69](https://github.com/cowprotocol/cowswap/commit/2909e69b30d7c2feb86f86f4a2ab315cec140c26))
* **trade:** unify recipient displaying on confirm screen ([#3877](https://github.com/cowprotocol/cowswap/issues/3877)) ([5a86527](https://github.com/cowprotocol/cowswap/commit/5a8652776cd8d93500532f8881894d3a0d3a5a53))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([025d223](https://github.com/cowprotocol/cowswap/commit/025d2238fd06e14d2bd471f73f02379e86ff94c1))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([eed09c8](https://github.com/cowprotocol/cowswap/commit/eed09c81f941c5d5e11cc9daed92aaf0faa0922e))

## [1.59.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.59.1...cowswap-v1.59.2) (2024-02-14)


### Bug Fixes

* disable ab-testing for fee-zero. Enable flag for all users ([#3850](https://github.com/cowprotocol/cowswap/issues/3850)) ([eb589cf](https://github.com/cowprotocol/cowswap/commit/eb589cf836b60e8009e8333a56b3d6bb0420643a))

## [1.59.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.59.0...cowswap-v1.59.1) (2024-02-12)


### Bug Fixes

* fix wrap/unwrap message ([#3781](https://github.com/cowprotocol/cowswap/issues/3781)) ([0003926](https://github.com/cowprotocol/cowswap/commit/0003926e6c883c9a373bd288ef4633debb42982e))
* **limit:** placement error handling ([#3814](https://github.com/cowprotocol/cowswap/issues/3814)) ([decd0b5](https://github.com/cowprotocol/cowswap/commit/decd0b534ad531e78a027c557d7950fe59d9ec33))

## [1.59.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.58.0...cowswap-v1.59.0) (2024-02-02)


### Features

* increase AB testing for fee 0 to 30% of users ([#3770](https://github.com/cowprotocol/cowswap/issues/3770)) ([ecee36d](https://github.com/cowprotocol/cowswap/commit/ecee36d88dd3f4d5c143d8cd6e54f31342668a61))


### Bug Fixes

* do not touch fee=0 ethflow fees ([#3763](https://github.com/cowprotocol/cowswap/issues/3763)) ([0eabb20](https://github.com/cowprotocol/cowswap/commit/0eabb2049243b24d292a3c12c071fb4a4ec3acdb))

## [1.58.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.57.1...cowswap-v1.58.0) (2024-02-01)


### Features

* account icon improvements ([#3739](https://github.com/cowprotocol/cowswap/issues/3739)) ([9888fa1](https://github.com/cowprotocol/cowswap/commit/9888fa1dbdb2c72de3ffa13254fb1d401e1f9e4f))
* add tag styling for tokenlist ([#3686](https://github.com/cowprotocol/cowswap/issues/3686)) ([d4d87a6](https://github.com/cowprotocol/cowswap/commit/d4d87a628eb4c41587071ce56e756a6253c7e77b))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))


### Bug Fixes

* cancelling status for SWAP/LIMIT ([#3681](https://github.com/cowprotocol/cowswap/issues/3681)) ([6eaf3fe](https://github.com/cowprotocol/cowswap/commit/6eaf3fe252f867c9ced50751553be28421164f16))
* fix fortune cookie position ([#3732](https://github.com/cowprotocol/cowswap/issues/3732)) ([45a534e](https://github.com/cowprotocol/cowswap/commit/45a534e63535bf636551d3e898094ef06c2f32db))
* **permit-utils:** aave permit ([#3684](https://github.com/cowprotocol/cowswap/issues/3684)) ([68566d8](https://github.com/cowprotocol/cowswap/commit/68566d882f0c0bebde93b8228645a59d76c2120d))
* **permit:** presign ([#3698](https://github.com/cowprotocol/cowswap/issues/3698)) ([d1c8f65](https://github.com/cowprotocol/cowswap/commit/d1c8f652aa5f16d71221d29804fdc1de01472797))

## [1.57.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.57.0...cowswap-v1.57.1) (2024-01-25)


### Bug Fixes

* fix label for fee0 ([#3714](https://github.com/cowprotocol/cowswap/issues/3714)) ([4a5c9a3](https://github.com/cowprotocol/cowswap/commit/4a5c9a35ee6d57047353b8a3aa9bb341357d3607))

## [1.57.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.56.1...cowswap-v1.57.0) (2024-01-25)


### Features

* **feeZero:** deliver fee zero only to 10% of users ([#3614](https://github.com/cowprotocol/cowswap/issues/3614)) ([5c6c312](https://github.com/cowprotocol/cowswap/commit/5c6c312cc07030d30e85080a30dfd384b20dba20))


### Bug Fixes

* **permit:** invalidate static and user permit cache ([#3713](https://github.com/cowprotocol/cowswap/issues/3713)) ([2e6504a](https://github.com/cowprotocol/cowswap/commit/2e6504aaa6092bb33b53ee9666d8cafebae62d22))

## [1.56.1](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.56.0...cowswap-v1.56.1) (2024-01-24)


### Bug Fixes

* minimum change just to cowswap app to trigger the release ([#3693](https://github.com/cowprotocol/cowswap/issues/3693)) ([8103980](https://github.com/cowprotocol/cowswap/commit/8103980a28261d4a014948565dafd20b4f6a8aad))

## [1.56.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.55.0...cowswap-v1.56.0) (2024-01-23)


### Features

* **appzi:** add appzi triggers for limit orders ([#3676](https://github.com/cowprotocol/cowswap/issues/3676)) ([c20ee4a](https://github.com/cowprotocol/cowswap/commit/c20ee4a70e53bc2889a37d48d61145e4e5a5ee46))


### Bug Fixes

* **fee=0:** buy order amounts again ([#3679](https://github.com/cowprotocol/cowswap/issues/3679)) ([72526eb](https://github.com/cowprotocol/cowswap/commit/72526eb96da007bf7242a0b6e763acf368a53edf))

## [1.55.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v1.54.2...cowswap-v1.55.0) (2024-01-17)


### Features

* **explorer:** update project and migrate to vite ([#3579](https://github.com/cowprotocol/cowswap/issues/3579)) ([3056162](https://github.com/cowprotocol/cowswap/commit/30561629f872612e85d64757004d9400f1600781))
* **fee=0:** classify order types ([#3559](https://github.com/cowprotocol/cowswap/issues/3559)) ([a2f8def](https://github.com/cowprotocol/cowswap/commit/a2f8def2f203301885e4548b49f73336abbabe21))
* **limit:** max limit order deadline ([#3567](https://github.com/cowprotocol/cowswap/issues/3567)) ([1428596](https://github.com/cowprotocol/cowswap/commit/1428596de28027ea36edbb8a912e7d27750b70d3))
* **networks:** support Sepolia ([#3558](https://github.com/cowprotocol/cowswap/issues/3558)) ([ab8b179](https://github.com/cowprotocol/cowswap/commit/ab8b1794fb60da851f3fccdd861ebef4b18df30e))
* sell eth warning for limit/twap ([#3573](https://github.com/cowprotocol/cowswap/issues/3573)) ([ff14c4b](https://github.com/cowprotocol/cowswap/commit/ff14c4b40a4b356a11b4b746d3240c2660dc0060))
* **surplus:** update surplus percentage calculation ([#3548](https://github.com/cowprotocol/cowswap/issues/3548)) ([3d6dc3d](https://github.com/cowprotocol/cowswap/commit/3d6dc3da1927b9debcbb0458991f18a90c749ca8))
* **twap:** unlimited twap deadline ([#3568](https://github.com/cowprotocol/cowswap/issues/3568)) ([378977c](https://github.com/cowprotocol/cowswap/commit/378977cf0a4d71f165d968d5b665ad6bb524ba67))
* update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
* **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))


### Bug Fixes

* disable Christmas theme ([#3582](https://github.com/cowprotocol/cowswap/issues/3582)) ([94643fb](https://github.com/cowprotocol/cowswap/commit/94643fb3ca77aea37b772d823cc48665b441eeaa))
* display cow token logo in header ([#3608](https://github.com/cowprotocol/cowswap/issues/3608)) ([f374960](https://github.com/cowprotocol/cowswap/commit/f3749601f0105f815ca32d744bb68568be3f7f84))
* don't crash when permittable tokens atom doesn't contain new network ([#3603](https://github.com/cowprotocol/cowswap/issues/3603)) ([ac517e8](https://github.com/cowprotocol/cowswap/commit/ac517e8656e6c0a42d3b3e4eb25318d5bc4c69db))
* don't display Sepolia in supported list when it is off ([#3650](https://github.com/cowprotocol/cowswap/issues/3650)) ([1b97ef5](https://github.com/cowprotocol/cowswap/commit/1b97ef5ed7071b3f83f0dda1c7ea060180fb44d0))
* **limit:** show price impact warning for Safe App when bundling ([#3571](https://github.com/cowprotocol/cowswap/issues/3571)) ([98a11e7](https://github.com/cowprotocol/cowswap/commit/98a11e7f9d41442db9c2ced08430813afce85572))
* merge localStorage state with initial state to prevent empty states ([#3604](https://github.com/cowprotocol/cowswap/issues/3604)) ([9cd4bf5](https://github.com/cowprotocol/cowswap/commit/9cd4bf53807e307c213c547c762907b71bb5b343))
* **permit:** report wrong permit to sentry for limit and swap flows ([#3565](https://github.com/cowprotocol/cowswap/issues/3565)) ([7067919](https://github.com/cowprotocol/cowswap/commit/706791978ca2e3412ceb33b5a1ff1ed878dd7f84))
* **swap:** disable eth flow selling on buy orders ([#3574](https://github.com/cowprotocol/cowswap/issues/3574)) ([17f484b](https://github.com/cowprotocol/cowswap/commit/17f484b4162f0a25f655b49902cf4a33b468db33))
* **swap:** fix swap out of market ([#3576](https://github.com/cowprotocol/cowswap/issues/3576)) ([878e99f](https://github.com/cowprotocol/cowswap/commit/878e99f1cb0079c37ff5b163f31fd1dda578f6c9))
* **token-search:** fix token search results ([#3607](https://github.com/cowprotocol/cowswap/issues/3607)) ([955d93f](https://github.com/cowprotocol/cowswap/commit/955d93fd2fce614ff6eb85b358f72ba6c77a1f51))

## [1.54.2](https://github.com/cowprotocol/cowswap/compare/v1.54.1...v1.54.2) (2024-01-08)


### Bug Fixes

* disable Christmas theme ([#3582](https://github.com/cowprotocol/cowswap/issues/3582)) ([94643fb](https://github.com/cowprotocol/cowswap/commit/94643fb3ca77aea37b772d823cc48665b441eeaa))

## [1.54.1](https://github.com/cowprotocol/cowswap/compare/v1.54.0...v1.54.1) (2023-12-28)


### Bug Fixes

* **permit:** replace permit signer used for quoting ([#3562](https://github.com/cowprotocol/cowswap/issues/3562)) ([907d908](https://github.com/cowprotocol/cowswap/commit/907d90825643a5ad5824ed4ff5d24a9227f96f71))

## [1.54.0](https://github.com/cowprotocol/cowswap/compare/v1.53.1...v1.54.0) (2023-12-26)


### Bug Fixes

* filter out twap orders from limit ([#3550](https://github.com/cowprotocol/cowswap/issues/3550)) ([91ccf8c](https://github.com/cowprotocol/cowswap/commit/91ccf8ceaf52e609b69deab98c2e921f4dd647be))
* **swap:** don't add/sub fee for swap orders ([#3552](https://github.com/cowprotocol/cowswap/issues/3552)) ([784d3a8](https://github.com/cowprotocol/cowswap/commit/784d3a8c847cedf88dbab918bdd03e8a18f1a64f))
* **trade:** update allowance immediately after approval tx mined ([#3543](https://github.com/cowprotocol/cowswap/issues/3543)) ([c0474aa](https://github.com/cowprotocol/cowswap/commit/c0474aa3b8bd4af9995acc0d84d8e8e46d12786a))
* **twap:** display twap orders history ([#3553](https://github.com/cowprotocol/cowswap/issues/3553)) ([4046d59](https://github.com/cowprotocol/cowswap/commit/4046d591c08d49102a413722a927857a5f219158))
* **wallets:** don't request network change when connect injected wallet ([#3544](https://github.com/cowprotocol/cowswap/issues/3544)) ([a6eaaf0](https://github.com/cowprotocol/cowswap/commit/a6eaaf0925248251bac6e9e77b02125e46fd4518))
* **wallets:** send request to switch network ([#3551](https://github.com/cowprotocol/cowswap/issues/3551)) ([2bbb745](https://github.com/cowprotocol/cowswap/commit/2bbb74548a290480c6b3001e7e4a8b2eff9032e0))

## [1.53.1](https://github.com/cowprotocol/cowswap/compare/v1.53.0...v1.53.1) (2023-12-21)


### Bug Fixes

* revert "fix: terms and conditions link hover color ([#3538](https://github.com/cowprotocol/cowswap/issues/3538))" ([#3540](https://github.com/cowprotocol/cowswap/issues/3540)) ([94099aa](https://github.com/cowprotocol/cowswap/commit/94099aae21f96c856099d9a322dc93c0b6e0d8ed))

## [1.53.0](https://github.com/cowprotocol/cowswap/compare/v1.52.0...v1.53.0) (2023-12-20)


### Features

* replace time column labels with nouns ([#3531](https://github.com/cowprotocol/cowswap/issues/3531)) ([bba989a](https://github.com/cowprotocol/cowswap/commit/bba989ad7fdc289cd89e1384c4780facee3624c5))
* styling fix ([#3515](https://github.com/cowprotocol/cowswap/issues/3515)) ([6bf809b](https://github.com/cowprotocol/cowswap/commit/6bf809b90b23d812969c4d5f722915135b86d90e))
* winter theme ([#3514](https://github.com/cowprotocol/cowswap/issues/3514)) ([a8dbf9d](https://github.com/cowprotocol/cowswap/commit/a8dbf9d78c258a1ed56ff6c2e9a03dda7794b79a))


### Bug Fixes

* **deps:** upgrade wagmi version to remove ledger lib ([#3513](https://github.com/cowprotocol/cowswap/issues/3513)) ([bd935a7](https://github.com/cowprotocol/cowswap/commit/bd935a7c129bb1e84c45be4a0697f776d3a444e8))
* fix cosmos ([#3535](https://github.com/cowprotocol/cowswap/issues/3535)) ([c8df8f2](https://github.com/cowprotocol/cowswap/commit/c8df8f2503ff7a7d7997729cc053cf0ac607e18a))
* fix ethflow stepper border color ([#3536](https://github.com/cowprotocol/cowswap/issues/3536)) ([a0ba534](https://github.com/cowprotocol/cowswap/commit/a0ba5347e3f822679464ef3457356a6df3c47630))
* remove ledger connector completely ([#3529](https://github.com/cowprotocol/cowswap/issues/3529)) ([96e349f](https://github.com/cowprotocol/cowswap/commit/96e349fd022622e3f5683fd3217c1ff8ce6fa048))
* terms and conditions link hover color ([#3538](https://github.com/cowprotocol/cowswap/issues/3538)) ([f91aabb](https://github.com/cowprotocol/cowswap/commit/f91aabb1573c3e9fc514efe4bb28169a4febe922))
* unsupported token button text color ([#3537](https://github.com/cowprotocol/cowswap/issues/3537)) ([ec4b222](https://github.com/cowprotocol/cowswap/commit/ec4b222aa499699195f4b8f25befeca4fcf5c5f7))
* use button text color for error button ([#3534](https://github.com/cowprotocol/cowswap/issues/3534)) ([179b0b8](https://github.com/cowprotocol/cowswap/commit/179b0b8a76003cfae8ac8b3d1a8b842b6dd00833))

## [1.52.0](https://github.com/cowprotocol/cowswap/compare/v1.51.2...v1.52.0) (2023-12-19)


### Bug Fixes

* **classic-eth-flow:** wrap no longer clears input amounts ([#3518](https://github.com/cowprotocol/cowswap/issues/3518)) ([cfe5c72](https://github.com/cowprotocol/cowswap/commit/cfe5c72b6f3e3cbf7d153d5840446c1c64f8110c))
* **lint:** comment out unused LedgerIcon import ([3c2cea1](https://github.com/cowprotocol/cowswap/commit/3c2cea1b7dcd4e9a032e51874afd917c9f347c73))
* **swap:** fix sell amount for buy orders with zero fee ([#3506](https://github.com/cowprotocol/cowswap/issues/3506)) ([2af7a10](https://github.com/cowprotocol/cowswap/commit/2af7a10fe446ec210e7a6146cd02e65c0b393601))
* **twap:** deduplicate safe transactions with the same order ([#3521](https://github.com/cowprotocol/cowswap/issues/3521)) ([77a9447](https://github.com/cowprotocol/cowswap/commit/77a9447974db8a12770499af29efae01863c5cb2))
* **wallet:** recognize Safe iOS wallet name ([#3524](https://github.com/cowprotocol/cowswap/issues/3524)) ([5b422d7](https://github.com/cowprotocol/cowswap/commit/5b422d75b708e7afd533f5f4f0dda963758d2b7a))

## [1.51.2](https://github.com/cowprotocol/cowswap/compare/v1.51.1...v1.51.2) (2023-12-14)


### Bug Fixes

* remove ledger integration because it's hacked ([#3509](https://github.com/cowprotocol/cowswap/issues/3509)) ([cbf10a4](https://github.com/cowprotocol/cowswap/commit/cbf10a4e32aeb548840510f2cd1902e5e77d7e1e))

## [1.51.1](https://github.com/cowprotocol/cowswap/compare/v1.51.0...v1.51.1) (2023-12-07)


### Features

* prettify token name displaying for Gnosis chain ([#3489](https://github.com/cowprotocol/cowswap/issues/3489)) ([ac18501](https://github.com/cowprotocol/cowswap/commit/ac185010afa685cbf76da998ba5dbcd2eeedef93))


### Bug Fixes

* **orders-table:** show not enough allowance warning only when needed ([#3487](https://github.com/cowprotocol/cowswap/issues/3487)) ([88e868c](https://github.com/cowprotocol/cowswap/commit/88e868c5745f0882fa5c1d301f47df74c4be06b6))
* **trade:** don't display fiat value when there is no amount ([#3488](https://github.com/cowprotocol/cowswap/issues/3488)) ([df4b278](https://github.com/cowprotocol/cowswap/commit/df4b2781abe904b9eb70295cdd624a4f68ef944a))

## [1.51.0](https://github.com/cowprotocol/cowswap/compare/v1.50.2...v1.51.0) (2023-12-06)


### Features

* balances and allowances lib ([#3414](https://github.com/cowprotocol/cowswap/issues/3414)) ([d575bb0](https://github.com/cowprotocol/cowswap/commit/d575bb0f5cdc5b8d00dd8b42385af234b6535d2f))
* **balances:** update balances for priority tokens ([#3417](https://github.com/cowprotocol/cowswap/issues/3417)) ([1d1458c](https://github.com/cowprotocol/cowswap/commit/1d1458c08a545fd2fdd067389987e99b842b68de))
* multicall library ([#3413](https://github.com/cowprotocol/cowswap/issues/3413)) ([621a384](https://github.com/cowprotocol/cowswap/commit/621a3844b22db2bb59aecc579004f1c85768aedc))
* replace uniswap milticall by new balances and allowances lib ([#3416](https://github.com/cowprotocol/cowswap/issues/3416)) ([1d99299](https://github.com/cowprotocol/cowswap/commit/1d99299610e03ac0644311e16005995cbe60340f))


### Bug Fixes

* **limit-orders:** remove high price impact warning flickering ([#3419](https://github.com/cowprotocol/cowswap/issues/3419)) ([8b14e71](https://github.com/cowprotocol/cowswap/commit/8b14e710db1fcacb076156356a23cac51405e238))
* remove uknown price impact warning flickering ([#3418](https://github.com/cowprotocol/cowswap/issues/3418)) ([faca696](https://github.com/cowprotocol/cowswap/commit/faca696864961dc1ea44423aa00e421ec20d30b5))
* **tokens-selector:** add native token to the top of the list if it's not there already ([#3471](https://github.com/cowprotocol/cowswap/issues/3471)) ([887a076](https://github.com/cowprotocol/cowswap/commit/887a07682891d9bdddebc61bd88bbbf7b11632de))

## [1.50.2](https://github.com/cowprotocol/cowswap/compare/v1.50.1...v1.50.2) (2023-11-29)


### Bug Fixes

* make typescript happy ([24d3924](https://github.com/cowprotocol/cowswap/commit/24d39246a5343656b402671a5bca8cbc94b79242))

## [1.50.1](https://github.com/cowprotocol/cowswap/compare/v1.50.0...v1.50.1) (2023-11-27)


### Bug Fixes

* adds NEW! tag to MORE menu item ([#3448](https://github.com/cowprotocol/cowswap/issues/3448)) ([f6a4358](https://github.com/cowprotocol/cowswap/commit/f6a435847bd872f4e9464ee2eaffced8ea17b755))

## [1.50.0](https://github.com/cowprotocol/cowswap/compare/v1.49.6...v1.50.0) (2023-11-24)


### Features

* refactor snippets ([#3409](https://github.com/cowprotocol/cowswap/issues/3409)) ([1b703ea](https://github.com/cowprotocol/cowswap/commit/1b703ea2aa1735a19be9b90d403b9e952e9a4310))
* widget skeleton ([#3393](https://github.com/cowprotocol/cowswap/issues/3393)) ([af1add9](https://github.com/cowprotocol/cowswap/commit/af1add99627abf7787e6957724fdec67c4cebf9a))
* **widget:** embed icons ([#3389](https://github.com/cowprotocol/cowswap/issues/3389)) ([c07a25f](https://github.com/cowprotocol/cowswap/commit/c07a25f5ba1b9bbbdf90ba5d0406d03d4dda9043))


### Bug Fixes

* do not send permit to quote when enough allowance ([#3433](https://github.com/cowprotocol/cowswap/issues/3433)) ([58b6ade](https://github.com/cowprotocol/cowswap/commit/58b6ade450537d7bb304947697e7b3e47b34408e))
* **widget-configurator:** set default trade pair USDC/COW ([#3420](https://github.com/cowprotocol/cowswap/issues/3420)) ([86743fe](https://github.com/cowprotocol/cowswap/commit/86743fe2d51b851d1830fe9b14e7e4b640a36114))

## [1.49.6](https://github.com/cowprotocol/cowswap/compare/v1.49.5...v1.49.6) (2023-11-16)


### Bug Fixes

* **permit:** disable permit for sc wallets ([#3404](https://github.com/cowprotocol/cowswap/issues/3404)) ([db40626](https://github.com/cowprotocol/cowswap/commit/db406264549efa37b988971b66e02f3d4cf02f3b))
* **widget-react:** export all not just types ([#3402](https://github.com/cowprotocol/cowswap/issues/3402)) ([f7c4b40](https://github.com/cowprotocol/cowswap/commit/f7c4b4070748e3b7733f1835e3542296fbb149fe))

## [1.49.5](https://github.com/cowprotocol/cowswap/compare/v1.49.4...v1.49.5) (2023-11-15)


### Bug Fixes

* **token-selector:** show direct match on top ([#3395](https://github.com/cowprotocol/cowswap/issues/3395)) ([e4c24b0](https://github.com/cowprotocol/cowswap/commit/e4c24b0fb2dc530dda1ba82c67adf6d1aa830fa6))

## [1.49.4](https://github.com/cowprotocol/cowswap/compare/v1.49.3...v1.49.4) (2023-11-14)


### Bug Fixes

* fix issue with ts usage ([8101d29](https://github.com/cowprotocol/cowswap/commit/8101d296099a3eb43efdff3dc53c02af8a6c8fc8))

## [1.49.3](https://github.com/cowprotocol/cowswap/compare/v1.49.1...v1.49.3) (2023-11-11)


### Features

* **widget:** add widget link to main menu ([#3381](https://github.com/cowprotocol/cowswap/issues/3381)) ([aba73fe](https://github.com/cowprotocol/cowswap/commit/aba73fecb7a0c6992d7df29d9987e2b2590bbdf0))


### Bug Fixes

* **balances:** always use network provider for multicalls ([#3387](https://github.com/cowprotocol/cowswap/issues/3387)) ([94728d4](https://github.com/cowprotocol/cowswap/commit/94728d4f31163fd93adef775c61fd4de7e78d96d))
* use cache when building library ([#3383](https://github.com/cowprotocol/cowswap/issues/3383)) ([9b9b598](https://github.com/cowprotocol/cowswap/commit/9b9b598ef042f6737382d5a5b83af8b6244b8627))
* **widget:** polish configurator ([#3380](https://github.com/cowprotocol/cowswap/issues/3380)) ([d76bcdb](https://github.com/cowprotocol/cowswap/commit/d76bcdb9724d06d01ed55acd64c37c9c50d55071))

## [1.49.1](https://github.com/cowprotocol/cowswap/compare/v1.49.0...v1.49.1) (2023-11-10)


### Bug Fixes

* **widget:** add a threshold for the widget height ([#3376](https://github.com/cowprotocol/cowswap/issues/3376)) ([654161f](https://github.com/cowprotocol/cowswap/commit/654161f994066a3f6580a72747cc3b5e61520941))

## [1.49.0](https://github.com/cowprotocol/cowswap/compare/v1.48.17...v1.49.0) (2023-11-09)


### Features

* add comment to config ([#3345](https://github.com/cowprotocol/cowswap/issues/3345)) ([1534611](https://github.com/cowprotocol/cowswap/commit/153461103342fbbaa84d340b4eb48ae94cc5b2d3))
* change appKey into appCode ([#3361](https://github.com/cowprotocol/cowswap/issues/3361)) ([b9127d9](https://github.com/cowprotocol/cowswap/commit/b9127d93c05eaf942913065c008d839f694b2ae1))
* change from node v16 to v18 ([#3350](https://github.com/cowprotocol/cowswap/issues/3350)) ([edc7de3](https://github.com/cowprotocol/cowswap/commit/edc7de3d5bb0e17088a58c266641022e79f0e346))
* hide nose picker loader ([#3338](https://github.com/cowprotocol/cowswap/issues/3338)) ([4cc2f1a](https://github.com/cowprotocol/cowswap/commit/4cc2f1abdc8a2429f2772c2992d76036c8d9ac9e))
* improve appCode, config and readme ([#3362](https://github.com/cowprotocol/cowswap/issues/3362)) ([c18bb2e](https://github.com/cowprotocol/cowswap/commit/c18bb2edc8f4f433a4ca0ef1be78e4222747fe8a))
* iterate on configurator ([#3364](https://github.com/cowprotocol/cowswap/issues/3364)) ([c4ba4bb](https://github.com/cowprotocol/cowswap/commit/c4ba4bb2014291454bcae7d0f2a3f4d99b74a3a5))
* **permit:** don't show gas-free flags when permit is not supported ([#3346](https://github.com/cowprotocol/cowswap/issues/3346)) ([1a56029](https://github.com/cowprotocol/cowswap/commit/1a560290b9fc82f3ba17ac1fd9ca9950da796661))
* **permit:** load pre generated permit info ([#3316](https://github.com/cowprotocol/cowswap/issues/3316)) ([46943ad](https://github.com/cowprotocol/cowswap/commit/46943ad45eb58ec5819dc0d8932017144928c144))
* **permit:** remove permit related feature flags ([#3320](https://github.com/cowprotocol/cowswap/issues/3320)) ([372b1a6](https://github.com/cowprotocol/cowswap/commit/372b1a67de71941f1deca46c0459cef2a32c536b))
* **permit:** update gas-free flag tooltip ([#3332](https://github.com/cowprotocol/cowswap/issues/3332)) ([4caf929](https://github.com/cowprotocol/cowswap/commit/4caf9299c697ab838970cd23e4445397b091cf21))
* simplify theme config ([#3363](https://github.com/cowprotocol/cowswap/issues/3363)) ([6b262ab](https://github.com/cowprotocol/cowswap/commit/6b262ab129cbfa62342b0a17ee2e67f26149f045))
* **wallets:** connect wallet rounded modal ([#3368](https://github.com/cowprotocol/cowswap/issues/3368)) ([d5ef0a8](https://github.com/cowprotocol/cowswap/commit/d5ef0a8898e58f8f85d2f0709a24eae513fe00b7))
* **widget-configurator:** button to show drawer ([#3324](https://github.com/cowprotocol/cowswap/issues/3324)) ([cbc1521](https://github.com/cowprotocol/cowswap/commit/cbc152108910f3d954aca10b5815dcf519aa78fd))
* **widget-configurator:** google analytics events ([#3335](https://github.com/cowprotocol/cowswap/issues/3335)) ([9b1074e](https://github.com/cowprotocol/cowswap/commit/9b1074e021399d25e7f105c3228a26113dc2edf1))
* **widget:** links to landing and docs ([#3359](https://github.com/cowprotocol/cowswap/issues/3359)) ([aeb4e11](https://github.com/cowprotocol/cowswap/commit/aeb4e111c7d047bd9607f1c5af3c4c21305f5096))


### Bug Fixes

* fix issue with RPC env ([#3353](https://github.com/cowprotocol/cowswap/issues/3353)) ([ede338d](https://github.com/cowprotocol/cowswap/commit/ede338d29279654873f0f8677d6e09ca2e41686f))
* fix race condition with widget ([#3367](https://github.com/cowprotocol/cowswap/issues/3367)) ([43e2204](https://github.com/cowprotocol/cowswap/commit/43e22046de4ace3c85b9bb7d1a7409c2851fb395))
* **tokens:** fix token lists styles ([#3360](https://github.com/cowprotocol/cowswap/issues/3360)) ([f9a4d0b](https://github.com/cowprotocol/cowswap/commit/f9a4d0b667c621f6f6692db926a727636b774511))
* **tokens:** use default value for user-added tokens migration ([#3347](https://github.com/cowprotocol/cowswap/issues/3347)) ([c9e235c](https://github.com/cowprotocol/cowswap/commit/c9e235cdf466b80d9241099fcfd4cb7c6230ee89))
* **twap:** fix infinite loop in orders hook ([#3348](https://github.com/cowprotocol/cowswap/issues/3348)) ([097728c](https://github.com/cowprotocol/cowswap/commit/097728c92b25f71c2a0ee0de4b56953c888afc0e))
* update chainId in trade state ([#3340](https://github.com/cowprotocol/cowswap/issues/3340)) ([60a16ec](https://github.com/cowprotocol/cowswap/commit/60a16ec96987ed3e9c6115664dbe0eb164c4ddb7))
* update connect wallet modal styles ([#3341](https://github.com/cowprotocol/cowswap/issues/3341)) ([e577b76](https://github.com/cowprotocol/cowswap/commit/e577b766a3e876e8caf167f3a19206a034b7be06))
* **widget-configurator:** switch network only when user changed in the configurator ([#3369](https://github.com/cowprotocol/cowswap/issues/3369)) ([51eb483](https://github.com/cowprotocol/cowswap/commit/51eb483643d80b1b0a39775b68b055a3ff8a8b92))
* **widget-lib:** adjust code for server-side rendering ([#3339](https://github.com/cowprotocol/cowswap/issues/3339)) ([db8743d](https://github.com/cowprotocol/cowswap/commit/db8743d586a58dc8f38ea7b0167e1369c5bb8f06))

## [1.48.17](https://github.com/cowprotocol/cowswap/compare/v1.48.16...v1.48.17) (2023-11-03)


### Bug Fixes

* reset og image cache ([#3330](https://github.com/cowprotocol/cowswap/issues/3330)) ([b336fac](https://github.com/cowprotocol/cowswap/commit/b336fac4ed6484babcb2a0515d570a105b0ee48e))

## [1.48.16](https://github.com/cowprotocol/cowswap/compare/v1.48.15...v1.48.16) (2023-11-03)


### Bug Fixes

* add env as secret ([#3328](https://github.com/cowprotocol/cowswap/issues/3328)) ([88a19aa](https://github.com/cowprotocol/cowswap/commit/88a19aa49cb22bc0cfda56800843a6025c081f9c))

## [1.48.15](https://github.com/cowprotocol/cowswap/compare/v1.48.14...v1.48.15) (2023-11-03)


### Bug Fixes

* pass env to vercel ([#3326](https://github.com/cowprotocol/cowswap/issues/3326)) ([3845e54](https://github.com/cowprotocol/cowswap/commit/3845e542c27ea2e2dc1000508444068a187285e6))

## [1.48.14](https://github.com/cowprotocol/cowswap/compare/v1.48.13...v1.48.14) (2023-11-03)


### Bug Fixes

* add verification for WC v2 project id ([#3323](https://github.com/cowprotocol/cowswap/issues/3323)) ([995e45e](https://github.com/cowprotocol/cowswap/commit/995e45e5d1069fa05c6afe0d936bdce0a29dc3a1))

## [1.48.13](https://github.com/cowprotocol/cowswap/compare/v1.48.12...v1.48.13) (2023-11-01)


### Bug Fixes

* revert halloween theme ([#3306](https://github.com/cowprotocol/cowswap/issues/3306)) ([0c839bc](https://github.com/cowprotocol/cowswap/commit/0c839bcf7342252d825b031e02b46f39975fdb71))

## [1.48.12](https://github.com/cowprotocol/cowswap/compare/v1.48.11...v1.48.12) (2023-10-30)


### Bug Fixes

* fix og:image ([#3299](https://github.com/cowprotocol/cowswap/issues/3299)) ([d5d7c80](https://github.com/cowprotocol/cowswap/commit/d5d7c807d77b3da17b931a17d44013b4b1f84f31))

## [1.48.11](https://github.com/cowprotocol/cowswap/compare/v1.48.10...v1.48.11) (2023-10-30)


### Bug Fixes

* fix og:image ([#3297](https://github.com/cowprotocol/cowswap/issues/3297)) ([5171bca](https://github.com/cowprotocol/cowswap/commit/5171bca00e9364a14c0710b24ab6236f5636c539))

## [1.48.10](https://github.com/cowprotocol/cowswap/compare/v1.48.9...v1.48.10) (2023-10-30)


### Features

* change og image to halloween ([#3294](https://github.com/cowprotocol/cowswap/issues/3294)) ([3780fd5](https://github.com/cowprotocol/cowswap/commit/3780fd5a4cb6f745a801f80a3fb1450d67d591af))

## [1.48.7](https://github.com/cowprotocol/cowswap/compare/v1.48.6...v1.48.7) (2023-10-19)


### Bug Fixes

* **swap:** periodically refresh unsupported tokens state ([#3252](https://github.com/cowprotocol/cowswap/issues/3252)) ([f5986a3](https://github.com/cowprotocol/cowswap/commit/f5986a30f850eead4eb633069967ac34947ab68e))

## [1.48.6](https://github.com/cowprotocol/cowswap/compare/v1.48.5...v1.48.6) (2023-10-18)


### Bug Fixes

* **permit:** usdc limit orders warning ([#3247](https://github.com/cowprotocol/cowswap/issues/3247)) ([d958d0f](https://github.com/cowprotocol/cowswap/commit/d958d0fefb6f18418fb596b75b872e5b381d915d))

## [1.48.5](https://github.com/cowprotocol/cowswap/compare/v1.48.4...v1.48.5) (2023-10-18)


### Features

* deploy to IPFS ([#3237](https://github.com/cowprotocol/cowswap/issues/3237)) ([e69af4d](https://github.com/cowprotocol/cowswap/commit/e69af4d7140e384180c98b4c5175b341a2e9a542))


### Bug Fixes

* display token logos from CoW Protocol correctly ([#3244](https://github.com/cowprotocol/cowswap/issues/3244)) ([caaf980](https://github.com/cowprotocol/cowswap/commit/caaf9800da89e1df21cdffe2afc4eaa98260d0c3))

## [1.48.4](https://github.com/cowprotocol/cowswap/compare/v1.48.3...v1.48.4) (2023-10-18)


### Bug Fixes

* **permit:** add support for usdc mainnet ([#3231](https://github.com/cowprotocol/cowswap/issues/3231)) ([8de7cfc](https://github.com/cowprotocol/cowswap/commit/8de7cfc51e2324f75b968aee015a2488d4dd2ba9))

## [1.48.3](https://github.com/cowprotocol/cowswap/compare/v1.48.2...v1.48.3) (2023-10-18)


### Bug Fixes

* display trade menu item badge ([#3236](https://github.com/cowprotocol/cowswap/issues/3236)) ([9d54b0a](https://github.com/cowprotocol/cowswap/commit/9d54b0acc8fd1af409776d005a2858647db817c6))

## [1.48.2](https://github.com/cowprotocol/cowswap/compare/v1.48.1...v1.48.2) (2023-10-17)


### Bug Fixes

* **swap:** don't reset swap form on recipient ens input ([#3234](https://github.com/cowprotocol/cowswap/issues/3234)) ([9c1f2f1](https://github.com/cowprotocol/cowswap/commit/9c1f2f1b13597a4af5600c1c915bd59ecf14f578))

## [1.48.1](https://github.com/cowprotocol/cowswap/compare/v1.48.0...v1.48.1) (2023-10-17)


### Bug Fixes

* **swap:** don't crash app when token decimals eq 0 ([#3228](https://github.com/cowprotocol/cowswap/issues/3228)) ([aad09c6](https://github.com/cowprotocol/cowswap/commit/aad09c6b71c1c0a8dabb1f3ea85292bed332dbc7))
* **wc:** add back patch which fixes WC path issue ([#3230](https://github.com/cowprotocol/cowswap/issues/3230)) ([4f4b7d5](https://github.com/cowprotocol/cowswap/commit/4f4b7d56e1cf806d52f09875f95c0afa15a06985))

## [1.48.0](https://github.com/cowprotocol/cowswap/compare/v1.47.1...v1.48.0) (2023-10-16)


### Features

* **permit:** allowance warning ([#3184](https://github.com/cowprotocol/cowswap/issues/3184)) ([f4700d9](https://github.com/cowprotocol/cowswap/commit/f4700d9ac34bf281f6efb9bcbc60bebacb8ac68f))
* **permit:** disable permit for SC wallets ([#3213](https://github.com/cowprotocol/cowswap/issues/3213)) ([29e5178](https://github.com/cowprotocol/cowswap/commit/29e5178a4c15eb56568f5da0d0a30990a47bc76f))
* **permit:** modals LIMIT ([#3164](https://github.com/cowprotocol/cowswap/issues/3164)) ([70e5653](https://github.com/cowprotocol/cowswap/commit/70e56534eaa17456e42e2ba30541537e44d76c78))
* **permit:** modals SWAP ([#3158](https://github.com/cowprotocol/cowswap/issues/3158)) ([ed53662](https://github.com/cowprotocol/cowswap/commit/ed53662eedec3fb4ce3d880c9303df701f5059c1))
* **permit:** refactor permit caching ([#3183](https://github.com/cowprotocol/cowswap/issues/3183)) ([e902e36](https://github.com/cowprotocol/cowswap/commit/e902e36d6d6320dfa1649a448a834df49f115ce4))
* remove walletConnect v1 and use v2 by default ([#3156](https://github.com/cowprotocol/cowswap/issues/3156)) ([4b3fbc0](https://github.com/cowprotocol/cowswap/commit/4b3fbc0f6de2f89235cc69fdc6e7eaefb9bd12b6))
* **tokens:** new UI component for token select modal ([#3166](https://github.com/cowprotocol/cowswap/issues/3166)) ([d5b69cd](https://github.com/cowprotocol/cowswap/commit/d5b69cd4716d1a77e94a4ecba808186e96ef4794))
* **tokens:** new UI for tokens management ([#3174](https://github.com/cowprotocol/cowswap/issues/3174)) ([6c2c253](https://github.com/cowprotocol/cowswap/commit/6c2c2535a11707ad1cc30aa17bd003863d832faa))


### Bug Fixes

* **eth-flow:** update refund info for expired orders ([#3222](https://github.com/cowprotocol/cowswap/issues/3222)) ([dede0d0](https://github.com/cowprotocol/cowswap/commit/dede0d0431511ad1b1ed0548f6d42f881b0f95e0))
* **permit:** improve permittable detection ([#3226](https://github.com/cowprotocol/cowswap/issues/3226)) ([79cb48a](https://github.com/cowprotocol/cowswap/commit/79cb48aa9cd21689d64e13fe57044c4f345c4118))
* **swap:** handle errors from order posting API ([#3224](https://github.com/cowprotocol/cowswap/issues/3224)) ([99df6d2](https://github.com/cowprotocol/cowswap/commit/99df6d2ca9fd5040624977f385e03b2442587c15))

## [1.47.1](https://github.com/cowprotocol/cowswap/compare/v1.47.0...v1.47.1) (2023-09-29)


### Features

* allow to change rpc nodes ([#3160](https://github.com/cowprotocol/cowswap/issues/3160)) ([b9b4be2](https://github.com/cowprotocol/cowswap/commit/b9b4be24ece99ddef83f351d47cc86a9ac3ff5da))
* **orders-table:** approve order token from allowance warn tooltip ([#3144](https://github.com/cowprotocol/cowswap/issues/3144)) ([aa943bf](https://github.com/cowprotocol/cowswap/commit/aa943bf06ab2ba3bb3040bae96106b4463f1283a))
* update approve button color ([#3169](https://github.com/cowprotocol/cowswap/issues/3169)) ([802f288](https://github.com/cowprotocol/cowswap/commit/802f288379329d6a526933be988e6669020bb872))


### Bug Fixes

* don't fetch tokens list ens hashes ([#3152](https://github.com/cowprotocol/cowswap/issues/3152)) ([49989f9](https://github.com/cowprotocol/cowswap/commit/49989f987e729749c17c64984ca3338f774198f9))
* fix bad import ([8546bbc](https://github.com/cowprotocol/cowswap/commit/8546bbc6e792cd913511c87ecfa3ab7453648ce6))
* **twap:** approve infinite amount ([#3141](https://github.com/cowprotocol/cowswap/issues/3141)) ([c5ab768](https://github.com/cowprotocol/cowswap/commit/c5ab768f85a0a463accaf436114fdcab7b538d80))


### Miscellaneous Chores

* **release:** hotfix 1.47.1 Merge pull request [#3171](https://github.com/cowprotocol/cowswap/issues/3171) from cowprotocol/hotfix/1.47.1 ([ce8671f](https://github.com/cowprotocol/cowswap/commit/ce8671fe3705f79a0bb73729855dfd59bbd48b52))

## [1.47.0](https://github.com/cowprotocol/cowswap/compare/v1.47.0-RC.0...v1.47.0) (2023-09-11)


### Bug Fixes

* **usd-price:** handle individual token price query failure ([#3127](https://github.com/cowprotocol/cowswap/issues/3127)) ([7d253d9](https://github.com/cowprotocol/cowswap/commit/7d253d9e654cfb3c0d7b862395637430f833b6df))


### Miscellaneous Chores

* **release:** 1.47.0 ([58b3ff4](https://github.com/cowprotocol/cowswap/commit/58b3ff4674a486c725505f3ec24d39df13f34b8d))

## [1.47.0-RC.0](https://github.com/cowprotocol/cowswap/compare/v1.46.0...v1.47.0-RC.0) (2023-09-08)


### Features

* generate the analyze bundle for vite ([#3096](https://github.com/cowprotocol/cowswap/issues/3096)) ([7611a3d](https://github.com/cowprotocol/cowswap/commit/7611a3deea3349bc0000ae0296f90209e452e049))
* usd prices and amounts module ([#3081](https://github.com/cowprotocol/cowswap/issues/3081)) ([10b1c6d](https://github.com/cowprotocol/cowswap/commit/10b1c6deb25342a4654d15cabafe4fa72f53a384))


### Bug Fixes

* add a space between "Added COW" ([#3094](https://github.com/cowprotocol/cowswap/issues/3094)) ([f4f1236](https://github.com/cowprotocol/cowswap/commit/f4f123607dab4047fa6d23d9e207b4c7e2724d17))
* add html space chars before banner token symbols ([#3117](https://github.com/cowprotocol/cowswap/issues/3117)) ([f87b8d2](https://github.com/cowprotocol/cowswap/commit/f87b8d2f78aa9340b6b1a168b038c2a24d24a69f))
* fix crash tokens page due to tiny price ([#3111](https://github.com/cowprotocol/cowswap/issues/3111)) ([1cf0461](https://github.com/cowprotocol/cowswap/commit/1cf0461aa1a74614db1cdcc4d84f365fa4e0629c))
* fix mapping network name from URL query to chainId ([#3125](https://github.com/cowprotocol/cowswap/issues/3125)) ([a3e8bf5](https://github.com/cowprotocol/cowswap/commit/a3e8bf5d456c0a6ecd1ff5d6cffe65ae6278b86e))
* **price-impact:** display unknown price impact warning only when there is no data ([#3114](https://github.com/cowprotocol/cowswap/issues/3114)) ([984dd66](https://github.com/cowprotocol/cowswap/commit/984dd66a9bf4c2114b525bd32d7de315aa808adb))
* remove quote API usage for fiat amount and price impact calc ([#3074](https://github.com/cowprotocol/cowswap/issues/3074)) ([cdaca30](https://github.com/cowprotocol/cowswap/commit/cdaca30b3f8d5a3585e9fda6b515a94d57641d91))
* surplus modal flickering ([#3124](https://github.com/cowprotocol/cowswap/issues/3124)) ([7d5b7ce](https://github.com/cowprotocol/cowswap/commit/7d5b7ce84078a99a559675529ce17162e0cffbb3))
* **swap:** reset state after network changes ([#3116](https://github.com/cowprotocol/cowswap/issues/3116)) ([6377f58](https://github.com/cowprotocol/cowswap/commit/6377f580b5502556e23bbdab7d2d28e30a179f94))
* **trade:** check allowance before pending tx for approval state ([#3090](https://github.com/cowprotocol/cowswap/issues/3090)) ([bebe49d](https://github.com/cowprotocol/cowswap/commit/bebe49d22df6bdb20a9a952a320b14db2f4fad57))
* **trade:** clean form amounts after wrap/unwrap ([#3095](https://github.com/cowprotocol/cowswap/issues/3095)) ([12d805c](https://github.com/cowprotocol/cowswap/commit/12d805c6d2c396bebf7ed4333a68aedd13d9ef1a))
* **twap:** load TWAP part details ([#3113](https://github.com/cowprotocol/cowswap/issues/3113)) ([cdd3056](https://github.com/cowprotocol/cowswap/commit/cdd305645179fc0c000d26f56fa3edf282e4f191))
* update only current account pending orders ([#3078](https://github.com/cowprotocol/cowswap/issues/3078)) ([5e2fa4c](https://github.com/cowprotocol/cowswap/commit/5e2fa4cf042ff57e0a26ceb079a68ccdf434fbd0))
* update token logo cache after tokens list loading ([#3100](https://github.com/cowprotocol/cowswap/issues/3100)) ([5e2dfd1](https://github.com/cowprotocol/cowswap/commit/5e2dfd12dc693231a41cc1af5dcf44fdfe544cb8))
* **usd-amount:** delete token from queue only if there are no subscribers left ([#3121](https://github.com/cowprotocol/cowswap/issues/3121)) ([bb95c94](https://github.com/cowprotocol/cowswap/commit/bb95c942da8c4d311d668acb5fc515c2e2dde27a))
* **usd-amount:** fallback to native_price API if Coingecko doesn't know the currency ([#3120](https://github.com/cowprotocol/cowswap/issues/3120)) ([1fa5fb2](https://github.com/cowprotocol/cowswap/commit/1fa5fb2185f40c7b1d2b8913ef3f53bca082c79d))


### Miscellaneous Chores

* **release:** 1.47.0-RC.0 ([375cac7](https://github.com/cowprotocol/cowswap/commit/375cac7c0fb9913457f1866497f83dc6753bbc5d))

## [1.46.0](https://github.com/cowprotocol/cowswap/compare/v1.45.1...v1.46.0) (2023-08-29)


### Features

* add badges color functionality ([#3072](https://github.com/cowprotocol/cowswap/issues/3072)) ([8282850](https://github.com/cowprotocol/cowswap/commit/8282850ccb78a61822fde9cda4b006057fb04d3a))
* **trezor**: control for selecting account ([#3048](https://github.com/cowprotocol/cowswap/issues/3048)) ([e391f96](https://github.com/cowprotocol/cowswap/commit/e391f96a626feb1912a0aebfa5710264631110fe))
* **wallets**: trezor wallet support ([#3020](https://github.com/cowprotocol/cowswap/issues/3020)) ([40d1d22](https://github.com/cowprotocol/cowswap/commit/40d1d220ccc81cc98adcbd7ed61fb5eeb10ee347))


### Bug Fixes

* **deployment-script:** fix deployment workflow ([#3084](https://github.com/cowprotocol/cowswap/issues/3084)) ([7b9d07e](https://github.com/cowprotocol/cowswap/commit/7b9d07ef7b5cec51f97e29f948b84e88f3e8fae6))
* **number-inputs:** remove default browser number arrows ([db4e9f4](https://github.com/cowprotocol/cowswap/commit/db4e9f4e46c40432735a22add89e9d371bbd939f))
* **number-inputs:** remove default browser number arrows ([1ccbfac](https://github.com/cowprotocol/cowswap/commit/1ccbfac1378f64e069f85bd5437a139c679d0c3e))
* **sentry:** log error boundary errors to Sentry ([#3077](https://github.com/cowprotocol/cowswap/issues/3077)) ([8c5518b](https://github.com/cowprotocol/cowswap/commit/8c5518b15a69a3049de19972a35b928625170439))
* **snackbars**: fix clickable area for closing ([#3068](https://github.com/cowprotocol/cowswap/issues/3068)) ([8dc8e74](https://github.com/cowprotocol/cowswap/commit/8dc8e7477773b1655e5d2359be93d48cff1ec054))
* **twap**: rename advanced to TWAP ([cb79da9](https://github.com/cowprotocol/cowswap/commit/cb79da9312f32c5f380bea3c3f2ebd6399f60649))
* **wallets**: walletconnect v2 configuration ([#3047](https://github.com/cowprotocol/cowswap/issues/3047)) ([14f2175](https://github.com/cowprotocol/cowswap/commit/14f21753ce6307d76127fb994dd944e68b2fdfe1))

## [1.45.1](https://github.com/cowprotocol/cowswap/compare/v1.45.0...v1.45.1) (2023-08-23)


### Bug Fixes

* handle error in case erc1155 id cannot be converted to BigNumber ([#3073](https://github.com/cowprotocol/cowswap/issues/3073)) ([82a549d](https://github.com/cowprotocol/cowswap/commit/82a549d54b427a5555eb6ddc93135798908c0714))

## [1.45.0](https://github.com/cowprotocol/cowswap/compare/v1.44.7...v1.45.0) (2023-08-21)


### Features

* nx workspaces migration ([#2965](https://github.com/cowprotocol/cowswap/issues/2965)) ([f6f4e4d](https://github.com/cowprotocol/cowswap/commit/f6f4e4d0b143c4ecb056269facf2f26bce638b19))


### Bug Fixes

* **twap:** display "Minimum sell size" banner only when there is a buy amount ([#3064](https://github.com/cowprotocol/cowswap/issues/3064)) ([60c7e36](https://github.com/cowprotocol/cowswap/commit/60c7e36452b923242771f4b28f065625b60b5911))

## [1.44.7](https://github.com/cowprotocol/cowswap/compare/v1.44.6...v1.44.7) (2023-08-16)


### Bug Fixes

* version the storage name for the fallback handler ([#3061](https://github.com/cowprotocol/cowswap/issues/3061)) ([ac63cbf](https://github.com/cowprotocol/cowswap/commit/ac63cbfaf20b2e6d31561ad84f67b936f681d366))

## [1.44.6](https://github.com/cowprotocol/cowswap/compare/v1.44.5...v1.44.6) (2023-08-16)


### Bug Fixes

* fix lint issues ([#3056](https://github.com/cowprotocol/cowswap/issues/3056)) ([9daa175](https://github.com/cowprotocol/cowswap/commit/9daa1756355a297cb2e9090b4a144ae0e862fbab))

## [1.44.5](https://github.com/cowprotocol/cowswap/compare/v1.44.4...v1.44.5) (2023-08-16)


### Bug Fixes

* **twap:** update links to blog ([#3054](https://github.com/cowprotocol/cowswap/issues/3054)) ([f39ee10](https://github.com/cowprotocol/cowswap/commit/f39ee10b9fe1a7c227f149f7ea8a97da3bf70075))

## [1.44.4](https://github.com/cowprotocol/cowswap/compare/v1.44.3...v1.44.4) (2023-08-16)


### Features

* **orders-table:** display order receiver address ([#3042](https://github.com/cowprotocol/cowswap/issues/3042)) ([948c46d](https://github.com/cowprotocol/cowswap/commit/948c46dd6072efb7324b53b4a29a2c9cca268b9f))


### Bug Fixes

* correct version ([4f170ac](https://github.com/cowprotocol/cowswap/commit/4f170ace726efcdb9ea56cf09eac4364ae38b15d))
* disable limit orders state sync between tabs ([#3041](https://github.com/cowprotocol/cowswap/issues/3041)) ([2ac7b1a](https://github.com/cowprotocol/cowswap/commit/2ac7b1abe0104997d3bd914ad4b359f18682a91e))

## [1.44.3](https://github.com/cowprotocol/cowswap/compare/v1.44.2...v1.44.3) (2023-08-11)


### Features

* **twap:** update contract addresses ([#3031](https://github.com/cowprotocol/cowswap/issues/3031)) ([6306bd2](https://github.com/cowprotocol/cowswap/commit/6306bd26ee652be0dde6bb0bf2b9ed1f0ba8ff06))


### Miscellaneous Chores

* **release:** hotfix 1.44.3: Merge pull request [#3039](https://github.com/cowprotocol/cowswap/issues/3039) from cowprotocol/hotfix/1.44.3 ([7334827](https://github.com/cowprotocol/cowswap/commit/733482728a2d84baea42ccdb50ef62c7b943dea5))

## [1.44.2](https://github.com/cowprotocol/cowswap/compare/v1.44.1...v1.44.2) (2023-08-10)


### Features

* enhance input arrows ([69cb56a](https://github.com/cowprotocol/cowswap/commit/69cb56accda4e5a53fd460910b8c3097b31d42e4))
* fix styles custom deadline twap ([#3006](https://github.com/cowprotocol/cowswap/issues/3006)) ([e948bdd](https://github.com/cowprotocol/cowswap/commit/e948bddc57d5481627610f18f7115ca715a09a6b))


### Bug Fixes

* **twap:** don't crash app while swap amount diff calculation ([#3033](https://github.com/cowprotocol/cowswap/issues/3033)) ([950d766](https://github.com/cowprotocol/cowswap/commit/950d7661e2c73df45b7c4c6ee1323928cc0d8d5c))

## [1.44.1](https://github.com/cowprotocol/cowswap/compare/v1.44.0...v1.44.1) (2023-08-10)


### Features

* enhance input arrows ([e1aa378](https://github.com/cowprotocol/cowswap/commit/e1aa3781f2b512b39615b720aca37b4fa83e55b9))
* fix text selection prevention ([6e4e180](https://github.com/cowprotocol/cowswap/commit/6e4e1803415519341c5667d56b1a8c9d6776c25d))
* **number-input-arrows:** re-applying the squashed commit ([#2970](https://github.com/cowprotocol/cowswap/issues/2970)) ([e1aa378](https://github.com/cowprotocol/cowswap/commit/e1aa3781f2b512b39615b720aca37b4fa83e55b9))
* text change ([#3019](https://github.com/cowprotocol/cowswap/issues/3019)) ([3c9c09f](https://github.com/cowprotocol/cowswap/commit/3c9c09f7b1628dbd0c712f50e19c6bee9f30687e))


### Bug Fixes

* **price-impact:** improve price impact loading ([#3014](https://github.com/cowprotocol/cowswap/issues/3014)) ([29763f4](https://github.com/cowprotocol/cowswap/commit/29763f4a5336cc96ef3fe05bcb66d2241216012e))
* **twap:** fix Fulfilled status detection ([#2987](https://github.com/cowprotocol/cowswap/issues/2987)) ([f7631f4](https://github.com/cowprotocol/cowswap/commit/f7631f4b35b32209433a6ea43a6f54188967eee3))
* **twap:** load unknown tokens from blockchain ([#3028](https://github.com/cowprotocol/cowswap/issues/3028)) ([6002ee3](https://github.com/cowprotocol/cowswap/commit/6002ee3be769de4a0963d77be74118a43ae661f1))

## [1.44.0](https://github.com/cowprotocol/cowswap/compare/v1.43.0...v1.44.0) (2023-08-07)


### Features

* disabled to readonly ([#2996](https://github.com/cowprotocol/cowswap/issues/2996)) ([996516e](https://github.com/cowprotocol/cowswap/commit/996516e42679153a700ff75dd3bcac9a2d7ad102))
* revert release version ([57a31e9](https://github.com/cowprotocol/cowswap/commit/57a31e93048ea188a363f24af255c55d225b828f))
* set release version ([15a158c](https://github.com/cowprotocol/cowswap/commit/15a158cfcfb6ad07ba6e5d5019c6d244b87ec0f4))
* **swap:** enhance styles of twap suggestion banner ([#2963](https://github.com/cowprotocol/cowswap/issues/2963)) ([a39550d](https://github.com/cowprotocol/cowswap/commit/a39550d923f9d369bd933b93be303d54a956ca28))
* **swap:** suggest using TWAP ([#2934](https://github.com/cowprotocol/cowswap/issues/2934)) ([c0be792](https://github.com/cowprotocol/cowswap/commit/c0be792ff10f56ea8a0cc6bab41a6692515c8a6a))
* **twap:** display banner with swap amount difference ([#2932](https://github.com/cowprotocol/cowswap/issues/2932)) ([0b081c6](https://github.com/cowprotocol/cowswap/commit/0b081c63ccd6ba003a1d07104eba608c4cd17151))
* **twap:** display Creating... for Scheduled orders when it's supposed to be created already ([#2946](https://github.com/cowprotocol/cowswap/issues/2946)) ([f8fdcc7](https://github.com/cowprotocol/cowswap/commit/f8fdcc75fc8d7ba2a181a724eb959e8d1ad7cc0e))
* **twap:** display order group in history tab ([#2948](https://github.com/cowprotocol/cowswap/issues/2948)) ([3bce96a](https://github.com/cowprotocol/cowswap/commit/3bce96ad79391c4875e66b2b9a6443366db863ad))
* **twap:** fetch first 200 transactions using pagination ([#2994](https://github.com/cowprotocol/cowswap/issues/2994)) ([784ceb1](https://github.com/cowprotocol/cowswap/commit/784ceb175ce0552535bbdbd79ca21ca1bb4ecf3a))
* **verify-quote:** add feature flag ([#2975](https://github.com/cowprotocol/cowswap/issues/2975)) ([8c52641](https://github.com/cowprotocol/cowswap/commit/8c52641780c44158726e9620ed030daa41dbfc2e))


### Bug Fixes

* dont upload app-data in bundle-safe-flow ([#2998](https://github.com/cowprotocol/cowswap/issues/2998)) ([4b88c1d](https://github.com/cowprotocol/cowswap/commit/4b88c1d04fa2f84342f64ebf5c72e587bb59142f))
* fix issue uploading appData in STAGING ([#3012](https://github.com/cowprotocol/cowswap/issues/3012)) ([651cc84](https://github.com/cowprotocol/cowswap/commit/651cc84fb3d35126e3b8a19036f310804601ddf2))
* **menu:** display explorer home link when wallet is not connected ([#2972](https://github.com/cowprotocol/cowswap/issues/2972)) ([4e3f50c](https://github.com/cowprotocol/cowswap/commit/4e3f50ced9baa43391465aba04f77b0559635385))
* pass account address along with other verified quote params ([#3016](https://github.com/cowprotocol/cowswap/issues/3016)) ([7c4d893](https://github.com/cowprotocol/cowswap/commit/7c4d89382cbf86436141a47a7fe314187970016b))
* solve issue in safari being broken ([#2997](https://github.com/cowprotocol/cowswap/issues/2997)) ([7fd99c1](https://github.com/cowprotocol/cowswap/commit/7fd99c1fe44c84ea3f9d5ca6f775e8b544fcc7bd))
* **swap:** change quote amount for price impact calculation on Gnosis chain ([#2980](https://github.com/cowprotocol/cowswap/issues/2980)) ([ca190c4](https://github.com/cowprotocol/cowswap/commit/ca190c4b202f528cc71b44fe6ab22bdcfcdbddbd))
* **swap:** display correct value of slippage in min. price tooltip ([#2982](https://github.com/cowprotocol/cowswap/issues/2982)) ([e519a8f](https://github.com/cowprotocol/cowswap/commit/e519a8f95ebb8f19e0624b6157458e0c9aef5dde))
* **swap:** use symbol instead of address for native tokens ([#2961](https://github.com/cowprotocol/cowswap/issues/2961)) ([0b8caa5](https://github.com/cowprotocol/cowswap/commit/0b8caa59c085bb79eae7f8e0a440404fba3511b5))
* **twap:** always display price diff warning ([#2973](https://github.com/cowprotocol/cowswap/issues/2973)) ([2ed4c5d](https://github.com/cowprotocol/cowswap/commit/2ed4c5df9bdaaed819709ebefcf3aaa711e76834))
* **twap:** display actual value for num of parts and custom deadline ([#2952](https://github.com/cowprotocol/cowswap/issues/2952)) ([4762e6f](https://github.com/cowprotocol/cowswap/commit/4762e6faf29ed93d9e717e98287f3ae800feab63))
* **twap:** don't redirect to swap when feature-flag value is not defined ([#2981](https://github.com/cowprotocol/cowswap/issues/2981)) ([105705b](https://github.com/cowprotocol/cowswap/commit/105705b566c21535b33204679dd3746dfe1dde67))
* upload app-data to the right network ([#2978](https://github.com/cowprotocol/cowswap/issues/2978)) ([42de133](https://github.com/cowprotocol/cowswap/commit/42de1331643779b939229c25449eb7a6efd9281d))
* upload appData to ETH flow ([#2986](https://github.com/cowprotocol/cowswap/issues/2986)) ([7bb7676](https://github.com/cowprotocol/cowswap/commit/7bb76760823d41b66133a07db5b83d42b41edeae))
* use currency decimals for surplus amount calculation ([#3000](https://github.com/cowprotocol/cowswap/issues/3000)) ([1432b6d](https://github.com/cowprotocol/cowswap/commit/1432b6da784bc68f2f07aa8976527c6f83a87470))

## [1.43.0](https://github.com/cowprotocol/cowswap/compare/v1.42.0...v1.43.0) (2023-07-26)


### Features

* **analytics:** add new dimension for market tracking ([#2930](https://github.com/cowprotocol/cowswap/issues/2930)) ([eea4736](https://github.com/cowprotocol/cowswap/commit/eea47364f16bd9af57cf6c915146e3d2a3542f9e))
* split swap/limit/advanced orders tables ([#2901](https://github.com/cowprotocol/cowswap/issues/2901)) ([69e0351](https://github.com/cowprotocol/cowswap/commit/69e03514042a890c1656b4d4de3a5e3d6a172fcc))
* style suspense loader ([#2875](https://github.com/cowprotocol/cowswap/issues/2875)) ([ccd1a77](https://github.com/cowprotocol/cowswap/commit/ccd1a77c66494e5cb7dfd5aaf177fabbcdc69739))
* **trade:** display disabled appearance for currency input panel ([#2921](https://github.com/cowprotocol/cowswap/issues/2921)) ([ae740f9](https://github.com/cowprotocol/cowswap/commit/ae740f9ca5522e68aed826a5813eda0d424c77da))
* **twap:** add missing links ([#2926](https://github.com/cowprotocol/cowswap/issues/2926)) ([30a7b18](https://github.com/cowprotocol/cowswap/commit/30a7b1840c48891df7181b7a79c2e45e9a319b96))
* **twap:** add recipient to summary in cancel modal ([#2904](https://github.com/cowprotocol/cowswap/issues/2904)) ([13d67fe](https://github.com/cowprotocol/cowswap/commit/13d67fe1f119a592a69f821686acc5a75c4b0bf3))
* **twap:** add TWAP learn more link ([91e7b94](https://github.com/cowprotocol/cowswap/commit/91e7b944850badbd28f0c6652e0261bce3182961))
* **twap:** display popup when order is cancelled ([#2914](https://github.com/cowprotocol/cowswap/issues/2914)) ([9dd12ca](https://github.com/cowprotocol/cowswap/commit/9dd12ca6bc2749510b3ea8644c0ff4463a93c287))
* **TWAP:** handle TWAP errors ([#2918](https://github.com/cowprotocol/cowswap/issues/2918)) ([b2f84c5](https://github.com/cowprotocol/cowswap/commit/b2f84c58faa40f4c48dd0e97da2d7cf86cb49fcc))
* **twap:** small price protection warning ([#2920](https://github.com/cowprotocol/cowswap/issues/2920)) ([e91b1e1](https://github.com/cowprotocol/cowswap/commit/e91b1e114ffdead0ddb5929ba52338f28d091c59))
* **TWAP:** update content based on orders type ([#2915](https://github.com/cowprotocol/cowswap/issues/2915)) ([1e1a9bc](https://github.com/cowprotocol/cowswap/commit/1e1a9bcdb3b681632f84540f11f3aa2a82f4eb28))


### Bug Fixes

* **orders-table:** display partially filled status before confirmed states ([#2929](https://github.com/cowprotocol/cowswap/issues/2929)) ([f8478ad](https://github.com/cowprotocol/cowswap/commit/f8478ad2463a9b0a0bbb40d4412ea7e24a82679e))
* **trade:** allow selling all native tokens from any trade widget ([7e566eb](https://github.com/cowprotocol/cowswap/commit/7e566eb661fff87bdc9ed358953f5c0b7f54675e))
* **trade:** allow selling all native tokens from any trade widget ([#2917](https://github.com/cowprotocol/cowswap/issues/2917)) ([c82a963](https://github.com/cowprotocol/cowswap/commit/c82a96398545d64949c87bd41f8854a90b4b97c4))
* **twap:** display a correct link to Safe tx on order creation ([#2919](https://github.com/cowprotocol/cowswap/issues/2919)) ([9e35636](https://github.com/cowprotocol/cowswap/commit/9e3563661288d8489cd7abedbea38ba625c0a3ef))

## [1.42.0](https://github.com/cowprotocol/cowswap/compare/v1.41.0...v1.42.0) (2023-07-18)


### Features

* **form-fields:** misc field forms adjustments ([#2881](https://github.com/cowprotocol/cowswap/issues/2881)) ([c06e24e](https://github.com/cowprotocol/cowswap/commit/c06e24e01d1d95e9cbf1b08bcdd1a0cec1b7e462))
* **twap:** add recipient to advanced orders ([#2877](https://github.com/cowprotocol/cowswap/issues/2877)) ([e4a61e9](https://github.com/cowprotocol/cowswap/commit/e4a61e9fd5bba44bbab8b1b72d19ff0503238245))
* **twap:** display orders grouping ([#2866](https://github.com/cowprotocol/cowswap/issues/2866)) ([0712e86](https://github.com/cowprotocol/cowswap/commit/0712e86eb9bbed20b17eed71d61b2aeb45077a43))
* **twap:** expand/collapse twap order table ([#2884](https://github.com/cowprotocol/cowswap/issues/2884)) ([0e08d12](https://github.com/cowprotocol/cowswap/commit/0e08d127dd4ce2b9fe0e789609fb9fd6c6bf4921))
* **twap:** tooltips try2 ([#2872](https://github.com/cowprotocol/cowswap/issues/2872)) ([b244004](https://github.com/cowprotocol/cowswap/commit/b2440044564cfcff19c5abe6adf80e87fa44b381))


### Bug Fixes

* **trade:** fix UnsupportedToken state displaying conditions ([#2878](https://github.com/cowprotocol/cowswap/issues/2878)) ([1b3107f](https://github.com/cowprotocol/cowswap/commit/1b3107f3d95fabd3d0786d51f808a654fb986b1a))
* **twap:** don't mix twap states between browser tabs ([#2903](https://github.com/cowprotocol/cowswap/issues/2903)) ([f4f2396](https://github.com/cowprotocol/cowswap/commit/f4f23962720ce0a97a2601835f496e212b06301f))
* **twap:** increase max slippage up to 100% ([#2897](https://github.com/cowprotocol/cowswap/issues/2897)) ([8fdc58b](https://github.com/cowprotocol/cowswap/commit/8fdc58ba6de2c2e77113c614b64936d3f7f95cd8))
* **twap:** round time interval value ([7045b2f](https://github.com/cowprotocol/cowswap/commit/7045b2fece1e6872c5af86d28ee43e8dad3aa8a9))
* **twap:** update twap orders state on Prod env ([#2907](https://github.com/cowprotocol/cowswap/issues/2907)) ([be247be](https://github.com/cowprotocol/cowswap/commit/be247be8519a231d7fc5358ca020f028c02a61d7))

## [1.41.0](https://github.com/cowprotocol/cowswap/compare/v1.40.6...v1.41.0) (2023-07-12)


### Features

* change label text ([#2862](https://github.com/cowprotocol/cowswap/issues/2862)) ([f48e892](https://github.com/cowprotocol/cowswap/commit/f48e892778c8bbef47d8f9b29bfa4cdcf3d7fe8b))
* **filled-tooltip:** update filled tooltip ([#2814](https://github.com/cowprotocol/cowswap/issues/2814)) ([704c444](https://github.com/cowprotocol/cowswap/commit/704c44417c6c1e54018e43e70622250d1edc5a92))
* **hackathon-surplus:** add missing link to surplus modal ([#2845](https://github.com/cowprotocol/cowswap/issues/2845)) ([98340d7](https://github.com/cowprotocol/cowswap/commit/98340d73d09ab0b064c65d236885aaf20810579c))
* **hackathon-surplus:** add tooltip for activity modal surplus ([#2831](https://github.com/cowprotocol/cowswap/issues/2831)) ([1dbb1f9](https://github.com/cowprotocol/cowswap/commit/1dbb1f94fdb63f05bb8783da29a7b7cdd2e403c9))
* **hackathon-surplus:** decrease the surplus units amount from 0.1 to 0.01 ([f0a713d](https://github.com/cowprotocol/cowswap/commit/f0a713dafb7efae3bfb04de58c311e6af6c3fa91))
* **hackathon-surplus:** do not show modal when too small amounts ([#2857](https://github.com/cowprotocol/cowswap/issues/2857)) ([6a5fa72](https://github.com/cowprotocol/cowswap/commit/6a5fa725c107bb770ea88110eedb8db2506be487))
* **trade:** generalise wrap/unwrap flow for all trade widgets ([#2861](https://github.com/cowprotocol/cowswap/issues/2861)) ([dcd9f3e](https://github.com/cowprotocol/cowswap/commit/dcd9f3ef6f2d5c82c1c523ade034e0a65e24167b))
* **twap:** review button label on limit ([#2807](https://github.com/cowprotocol/cowswap/issues/2807)) ([5980e64](https://github.com/cowprotocol/cowswap/commit/5980e641dd9f1bf31e18732eac5eff3158724845))
* wrap symbol name surplus modal ([#2842](https://github.com/cowprotocol/cowswap/issues/2842)) ([5a61332](https://github.com/cowprotocol/cowswap/commit/5a6133212b456378491c80457c1deff740ea191a))


### Bug Fixes

* issue with loop in react ([#2860](https://github.com/cowprotocol/cowswap/issues/2860)) ([2bebaa8](https://github.com/cowprotocol/cowswap/commit/2bebaa8deed47a0cb938bce10a88a7875aaf9255))
* **surplus-pending-swap-buy-receipt:** fix receipt for pending buy swap orders ([#2811](https://github.com/cowprotocol/cowswap/issues/2811)) ([8843d73](https://github.com/cowprotocol/cowswap/commit/8843d73d721cba56d14b04b7e98f21e5026c287b))
* **swap:** get rid of infinite updates in useFillSwapDerivedState ([#2858](https://github.com/cowprotocol/cowswap/issues/2858)) ([8a37ec4](https://github.com/cowprotocol/cowswap/commit/8a37ec4d41425742283218b7d1e4a727360716ea))
* **twap:** avoid sending `env` as `undefined` to getOrder query ([#2864](https://github.com/cowprotocol/cowswap/issues/2864)) ([3db9e05](https://github.com/cowprotocol/cowswap/commit/3db9e0575c26a71244a4a7f2f86e8872aa951deb))

## [1.40.6](https://github.com/cowprotocol/cowswap/compare/v1.40.4...v1.40.6) (2023-07-10)


### Features

* **wallet-connect:** add env for specifying the WC v1 bridge ([#2820](https://github.com/cowprotocol/cowswap/issues/2820)) ([045caa3](https://github.com/cowprotocol/cowswap/commit/045caa3785a381cb53dce931c32c712b0844387d))


### Bug Fixes

* **account-page:** cow balance issue ([#2824](https://github.com/cowprotocol/cowswap/issues/2824)) ([863f010](https://github.com/cowprotocol/cowswap/commit/863f0104308969e9dfa8abd34fc00119f6e0d6e0))
* **gas-prices:** update gnosis-chain gas price endpoint link ([#2830](https://github.com/cowprotocol/cowswap/issues/2830)) ([fb7c2c6](https://github.com/cowprotocol/cowswap/commit/fb7c2c6d79ede5078a88b542f6ce211a6285ef3c))
* **utm:** fix issue with utm check ([#2822](https://github.com/cowprotocol/cowswap/issues/2822)) ([9481077](https://github.com/cowprotocol/cowswap/commit/948107794993b23d9529b2f4a7d5f6c4bcfe9cf9))

## [1.40.0](https://github.com/cowprotocol/cowswap/compare/v1.39.0...v1.40.0) (2023-06-07)


### Features

* **limit-orders:** remove beta limit orders label ([#2615](https://github.com/cowprotocol/cowswap/issues/2615)) ([064688f](https://github.com/cowprotocol/cowswap/commit/064688f2b03de78c8c85db741bad9ea97e7f3e6c))
* **safe:** allow to sell all native ([#2610](https://github.com/cowprotocol/cowswap/issues/2610)) ([51931f2](https://github.com/cowprotocol/cowswap/commit/51931f2f9d84370eb8e6e5c9066ebf3dbe5c610c))


### Bug Fixes

* limit wrap/unwrap switch arrow ([#2618](https://github.com/cowprotocol/cowswap/issues/2618)) ([e92fe2c](https://github.com/cowprotocol/cowswap/commit/e92fe2c3e7fef32ea05869192db06bcbf0136a1c))

## [1.39.0](https://github.com/cowprotocol/cowswap/compare/v1.38.1...v1.39.0) (2023-06-06)


### Features

* add rate info ([#2570](https://github.com/cowprotocol/cowswap/issues/2570)) ([52cfa63](https://github.com/cowprotocol/cowswap/commit/52cfa63c50e1fce0fdb476f7b4509b3774c6a185))
* clickable fill+status label for order receipt ([#2559](https://github.com/cowprotocol/cowswap/issues/2559)) ([b56954e](https://github.com/cowprotocol/cowswap/commit/b56954e1b2d46a76ac5dac19f309a82523832bc9))
* **smart-contract-orders:** hide sc presign orders on start ([#2525](https://github.com/cowprotocol/cowswap/issues/2525)) ([96ea696](https://github.com/cowprotocol/cowswap/commit/96ea6960c91c6a0f9aaea2260399a450fcbf4f2b))
* **trade:** move import token and approval modals to TradeWidget ([#2547](https://github.com/cowprotocol/cowswap/issues/2547)) ([3ce3316](https://github.com/cowprotocol/cowswap/commit/3ce3316c46adecc57c92eb4972dc5db68d0a2bd0))
* **twap:** order creation and fallback verification MVP ([#2533](https://github.com/cowprotocol/cowswap/issues/2533)) ([3dea3d4](https://github.com/cowprotocol/cowswap/commit/3dea3d4fb2da7ac97d4f14297c1b5ed8837b668c))


### Bug Fixes

* do not trigger expired NPS for hidden orders ([#2554](https://github.com/cowprotocol/cowswap/issues/2554)) ([e806902](https://github.com/cowprotocol/cowswap/commit/e806902bb78dc094a4f5d2a19383de787d5529db))
* **limit-orders:** fix quoting for buy flow ([#2598](https://github.com/cowprotocol/cowswap/issues/2598)) ([76b927f](https://github.com/cowprotocol/cowswap/commit/76b927f4ac9a1a7a5609947123189a92071415b0))
* make (Trust) wallet icon round on modals ([#2599](https://github.com/cowprotocol/cowswap/issues/2599)) ([dabf88e](https://github.com/cowprotocol/cowswap/commit/dabf88e1af67f872d36846e2e60902dcc7397f61))
* unsupported token error fix ([d05ae0f](https://github.com/cowprotocol/cowswap/commit/d05ae0f5085685aaf07c78d2f42385522c0e051f))

## [1.38.1](https://github.com/cowprotocol/cowswap/compare/v1.38.0...v1.38.1) (2023-05-25)


### Features

* inlineBanner cosmos ([#2494](https://github.com/cowprotocol/cowswap/issues/2494)) ([0e6f6bd](https://github.com/cowprotocol/cowswap/commit/0e6f6bd5d9ed97bc2698f8f42c8b403f8eae0a43))
* **twap:** twap widget UI ([#2426](https://github.com/cowprotocol/cowswap/issues/2426)) ([3417f0e](https://github.com/cowprotocol/cowswap/commit/3417f0e092c9d09ac289ed08f7b365da694cc58f))


### Bug Fixes

* **usdt-approval:** :bug: fix amountToApprove having a non bigint number ([#2549](https://github.com/cowprotocol/cowswap/issues/2549)) ([7609770](https://github.com/cowprotocol/cowswap/commit/76097705bd10241b5f99c28b3d3ab7e770f3d148))

## [1.37.0](https://github.com/cowprotocol/cowswap/compare/v1.36.1...v1.37.0) (2023-05-18)


### Features

* add account address to ga tracking ([#2450](https://github.com/cowprotocol/cowswap/issues/2450)) ([39f67fa](https://github.com/cowprotocol/cowswap/commit/39f67fadae1630971fc8499af4c8e64ef99eeba7))
* **tx-bundling:** update button content ([#2472](https://github.com/cowprotocol/cowswap/issues/2472)) ([ef52f44](https://github.com/cowprotocol/cowswap/commit/ef52f44436dfeaab30c603bec2e9ac8ba4010b1f))
* **tx-bundling:** warning banner ([#2466](https://github.com/cowprotocol/cowswap/issues/2466)) ([9e17a90](https://github.com/cowprotocol/cowswap/commit/9e17a90a0404f12924acaf6ca14d5777e8d6f56a))


### Bug Fixes

* **approval-for-swap-buy-orders:** use actual input amount for calculating approval needed ([#2458](https://github.com/cowprotocol/cowswap/issues/2458)) ([bdc219a](https://github.com/cowprotocol/cowswap/commit/bdc219aca0fe7267dafc9b7a7db74e9cf49d090c))

## [1.36.0](https://github.com/cowprotocol/cowswap/compare/v1.35.0...v1.36.0) (2023-05-10)


### Features

* add tx bundling feature flag ([#2410](https://github.com/cowprotocol/cowswap/issues/2410)) ([8547096](https://github.com/cowprotocol/cowswap/commit/85470967ab6bd52bfc42f054e3831bb339022be2))
* **tokens-search:** autofocus the tokens search input ([#2424](https://github.com/cowprotocol/cowswap/issues/2424)) ([651c43a](https://github.com/cowprotocol/cowswap/commit/651c43a43b96f29d94300c00fae0805484242a4b))
* **twap-orders:** refactor trade states and hooks ([#2411](https://github.com/cowprotocol/cowswap/issues/2411)) ([b072133](https://github.com/cowprotocol/cowswap/commit/b072133c731d5a61b06d0af37a015b9682869896))
* **tx-bundling:** enable bundled approval + presign for Safe App on SWAP ([#2434](https://github.com/cowprotocol/cowswap/issues/2434)) ([f61fb88](https://github.com/cowprotocol/cowswap/commit/f61fb8829726f9970704cd10ed9da59005b2d556))


### Bug Fixes

* **account-modal:** fix cancellation tx link for Gnosis Safe ([#2385](https://github.com/cowprotocol/cowswap/issues/2385)) ([a862b95](https://github.com/cowprotocol/cowswap/commit/a862b9563bca9eedd18db10e44940e1550c130bb))
* **wallets:** fix Metamask detection logic ([#2364](https://github.com/cowprotocol/cowswap/issues/2364)) ([9dea840](https://github.com/cowprotocol/cowswap/commit/9dea840f47c624c6fa9fc6e975c25139762ba43d))

## [1.35.0](https://github.com/cowprotocol/cowswap/compare/v1.34.0...v1.35.0) (2023-05-04)

### Features

- add anniversary hat and confetti ([#2381](https://github.com/cowprotocol/cowswap/issues/2381)) ([73deaef](https://github.com/cowprotocol/cowswap/commit/73deaefbbe428fb5feb6f25396061947ba9dc9fc))
- **approve:** redesign of approving pending modal ("use default") ([#2352](https://github.com/cowprotocol/cowswap/issues/2352)) ([3dcc2b3](https://github.com/cowprotocol/cowswap/commit/3dcc2b364901a37646b2c92f220d2f575a1f788c))
- component TradeWidget to unify layout of all trade widgets ([#2400](https://github.com/cowprotocol/cowswap/issues/2400)) ([4cec19b](https://github.com/cowprotocol/cowswap/commit/4cec19b07888d159cecd5db7d7e8046a5e82a303))
- **confirmation-modal:** ✨ Add confirmation modal with relevant hooks ([#2365](https://github.com/cowprotocol/cowswap/issues/2365)) ([7d40c1b](https://github.com/cowprotocol/cowswap/commit/7d40c1b79dcf156fdc4a109ab3046d29ffe774b0))
- **twap-orders:** integrate TradeWidget in Swap, Limit orders and Advanced orders ([#2401](https://github.com/cowprotocol/cowswap/issues/2401)) ([dcfd5d7](https://github.com/cowprotocol/cowswap/commit/dcfd5d7f111e129167aad15aa22f06118f0cde95))
- **twap-orders:** twap orders page skeleton + feature-flag ([#2399](https://github.com/cowprotocol/cowswap/issues/2399)) ([6d6aa61](https://github.com/cowprotocol/cowswap/commit/6d6aa6173fb2c6987771a1bb51cda8f047b21527))

### Bug Fixes

- :bug: update getAppDataHash to rely on appDataInfoAtom ([#2375](https://github.com/cowprotocol/cowswap/issues/2375)) ([a87116c](https://github.com/cowprotocol/cowswap/commit/a87116cf0c4868f590b9d072e423fe774838ef0d))
- **account-page:** display 0 COW as default balance in Account page ([#2378](https://github.com/cowprotocol/cowswap/issues/2378)) ([ec7d5db](https://github.com/cowprotocol/cowswap/commit/ec7d5db1c70a9e82e2c427ca99764d85ded07bba))
- **cancel-order:** fix order cancellation error message ([#2380](https://github.com/cowprotocol/cowswap/issues/2380)) ([59a5a53](https://github.com/cowprotocol/cowswap/commit/59a5a53ca001574ee7cf814ceb858730eed5e9a7))
- change audits url in approval modal ([#2394](https://github.com/cowprotocol/cowswap/issues/2394)) ([25c247e](https://github.com/cowprotocol/cowswap/commit/25c247e1b042df6ab10812c1e19e88182f2806e3))
- don't display quote errors when wrap/unwrap ([#2384](https://github.com/cowprotocol/cowswap/issues/2384)) ([3c39c93](https://github.com/cowprotocol/cowswap/commit/3c39c9327db9514a71ad8d89217842e9339d1b23))
- fix modal closing by X icon and fix notification banner stack overflow ([#2403](https://github.com/cowprotocol/cowswap/issues/2403)) ([9b2fa81](https://github.com/cowprotocol/cowswap/commit/9b2fa8140c24c73dc88f35ab5161b182e563def7))
- **limit-orders:** don't display trade related warnings when wrap/unwrap ([#2387](https://github.com/cowprotocol/cowswap/issues/2387)) ([1052d05](https://github.com/cowprotocol/cowswap/commit/1052d05cf8250ef7c3a102d4f2339a438f4470cc))
- **limit-orders:** enable orders selection only when off-chain signing is supported ([#2357](https://github.com/cowprotocol/cowswap/issues/2357)) ([339cd74](https://github.com/cowprotocol/cowswap/commit/339cd748cf173d84b8a0632d3776fd58905a1dd2))
- **order-cancellation:** fix detection of isOffChainCancellable flag ([#2395](https://github.com/cowprotocol/cowswap/issues/2395)) ([9efb772](https://github.com/cowprotocol/cowswap/commit/9efb7725e69b5cfbad3ba84b28ad5595a9fdba79))
- remove UMA tokens list because it doesn't work ([#2383](https://github.com/cowprotocol/cowswap/issues/2383)) ([021416d](https://github.com/cowprotocol/cowswap/commit/021416de3dffd03dff53fcd9c7b2bc612b1f0e42))
- rename Gnosis Safe -&gt; Safe ([#2377](https://github.com/cowprotocol/cowswap/issues/2377)) ([c12cc3e](https://github.com/cowprotocol/cowswap/commit/c12cc3e8ad86d4759bf09e61f8750129f83bd89c))
- rename title of TermsAndConditions page ([#2386](https://github.com/cowprotocol/cowswap/issues/2386)) ([eb1b26c](https://github.com/cowprotocol/cowswap/commit/eb1b26c92da4528efc6e12addf7335f4b4cf171e))
- show hang in there until best quote is loaded ([#2379](https://github.com/cowprotocol/cowswap/issues/2379)) ([c442810](https://github.com/cowprotocol/cowswap/commit/c4428106968e34741ed1d6b1c92c802ca84b977d))
