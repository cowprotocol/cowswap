# Changelog

## [3.2.2](https://github.com/cowprotocol/cowswap/compare/explorer-v3.2.1...explorer-v3.2.2) (2026-02-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.2.2
    * @cowprotocol/common-const bumped to 2.2.2
    * @cowprotocol/common-hooks bumped to 2.2.2
    * @cowprotocol/common-utils bumped to 2.2.2
    * @cowprotocol/ui bumped to 2.2.2

## [3.2.1](https://github.com/cowprotocol/cowswap/compare/explorer-v3.2.0...explorer-v3.2.1) (2026-02-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.2.1
    * @cowprotocol/common-const bumped to 2.2.1
    * @cowprotocol/common-hooks bumped to 2.2.1
    * @cowprotocol/common-utils bumped to 2.2.1
    * @cowprotocol/ui bumped to 2.2.1

## [3.2.0](https://github.com/cowprotocol/cowswap/compare/explorer-v3.1.0...explorer-v3.2.0) (2026-02-13)


### ✨ Features

* add scroll to network selector when needed ([#6962](https://github.com/cowprotocol/cowswap/issues/6962)) ([9688722](https://github.com/cowprotocol/cowswap/commit/968872287030f604fc3ce5b6c11758a98f3334ed))
* replace toLowerCase on getAddressKey ([#6866](https://github.com/cowprotocol/cowswap/issues/6866)) ([a41b23c](https://github.com/cowprotocol/cowswap/commit/a41b23c4384cdbcde9534abcdde37441121381e7))


### 🐛 Bug Fixes

* **#6976:** fix explorer order details not loading if prod request fails ([7e8a6d2](https://github.com/cowprotocol/cowswap/commit/7e8a6d2ce68fe0d93249e99f32aa26f3353270fe))
* cancelled with double 'l' ([#6973](https://github.com/cowprotocol/cowswap/issues/6973)) ([4a5c09f](https://github.com/cowprotocol/cowswap/commit/4a5c09f27b81fcf9342268e4c16c04c1c5160564))


### 🔧 Miscellaneous

* fix some minor issues in the comments ([#6988](https://github.com/cowprotocol/cowswap/issues/6988)) ([9d547cc](https://github.com/cowprotocol/cowswap/commit/9d547cc16304b4d692b8daf7c5ab4219895fadce))
* remove references to yarn ([#6990](https://github.com/cowprotocol/cowswap/issues/6990)) ([950ebc1](https://github.com/cowprotocol/cowswap/commit/950ebc1af65c0f9e75db13972479e398a462a1e3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.2.0
    * @cowprotocol/common-const bumped to 2.2.0
    * @cowprotocol/common-hooks bumped to 2.2.0
    * @cowprotocol/common-utils bumped to 2.2.0
    * @cowprotocol/hook-dapp-lib bumped to 2.0.3
    * @cowprotocol/types bumped to 3.2.0
    * @cowprotocol/ui bumped to 2.2.0

## [3.1.0](https://github.com/cowprotocol/cowswap/compare/explorer-v3.0.2...explorer-v3.1.0) (2026-02-05)


### ✨ Features

* **trade:** upload appData to IPFS before signing ([#6922](https://github.com/cowprotocol/cowswap/issues/6922)) ([cb94104](https://github.com/cowprotocol/cowswap/commit/cb9410470c549bd5453a7933a0a224ba706ec2c2))


### 🐛 Bug Fixes

* **bridge:** make failed bridge orders red ([#6911](https://github.com/cowprotocol/cowswap/issues/6911)) ([58f8abd](https://github.com/cowprotocol/cowswap/commit/58f8abd6ae74b594909d0444ffc31ae06d1b2c48))


### 🔧 Miscellaneous

* update sdk ([a20814b](https://github.com/cowprotocol/cowswap/commit/a20814b7caf16f495cd0292d5f3469bc552e4d97))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.1.0
    * @cowprotocol/common-const bumped to 2.1.0
    * @cowprotocol/common-hooks bumped to 2.1.0
    * @cowprotocol/common-utils bumped to 2.1.0
    * @cowprotocol/hook-dapp-lib bumped to 2.0.2
    * @cowprotocol/types bumped to 3.1.0
    * @cowprotocol/ui bumped to 2.1.0

## [3.0.2](https://github.com/cowprotocol/cowswap/compare/explorer-v3.0.1...explorer-v3.0.2) (2026-02-02)


### Bug Fixes

* **protocol-fee:** support decimals in protocol fee ([#6948](https://github.com/cowprotocol/cowswap/issues/6948)) ([a572bbe](https://github.com/cowprotocol/cowswap/commit/a572bbe2899b0a48b2c0891922442a4420f6c3ef))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.0.1
    * @cowprotocol/common-const bumped to 2.0.1
    * @cowprotocol/common-hooks bumped to 2.0.1
    * @cowprotocol/common-utils bumped to 2.0.1
    * @cowprotocol/hook-dapp-lib bumped to 2.0.1
    * @cowprotocol/types bumped to 3.0.1
    * @cowprotocol/ui bumped to 2.0.1

## [3.0.1](https://github.com/cowprotocol/cowswap/compare/explorer-v3.0.0...explorer-v3.0.1) (2026-01-29)


### Bug Fixes

* **explorer:** minor refactor to trigger the build ([72580d9](https://github.com/cowprotocol/cowswap/commit/72580d920d38f2a97bbb61451e5ffc160598620d))

## [3.0.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.62.0...explorer-v3.0.0) (2026-01-28)


### ⚠ BREAKING CHANGES

* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847))

### Features

* add repo-wide AGENTS.md with app-specific overlays ([#6865](https://github.com/cowprotocol/cowswap/issues/6865)) ([a2a4239](https://github.com/cowprotocol/cowswap/commit/a2a4239b11691585396f1959475cbbcf535e2853))
* **limit:** load more orders button [#6853](https://github.com/cowprotocol/cowswap/issues/6853) ([b647396](https://github.com/cowprotocol/cowswap/commit/b647396c09f00b878ae06d0b0932c40512c0cba1))
* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847)) ([1c5d115](https://github.com/cowprotocol/cowswap/commit/1c5d11516d0ddb997b0ebbb4eee4adcb491204a4))


### Bug Fixes

* **explorer:** fix app-data page scrolling ([#6876](https://github.com/cowprotocol/cowswap/issues/6876)) ([527cc66](https://github.com/cowprotocol/cowswap/commit/527cc666524d2484edce04079e31ebc2aa072dc1))
* optimize bundle size ([#6775](https://github.com/cowprotocol/cowswap/issues/6775)) ([287a94e](https://github.com/cowprotocol/cowswap/commit/287a94e807b3672dbbd291768fb2ad80dbd288e5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.0.0
    * @cowprotocol/common-const bumped to 2.0.0
    * @cowprotocol/common-hooks bumped to 2.0.0
    * @cowprotocol/common-utils bumped to 2.0.0
    * @cowprotocol/hook-dapp-lib bumped to 2.0.0
    * @cowprotocol/types bumped to 3.0.0
    * @cowprotocol/ui bumped to 2.0.0

## [2.62.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.61.0...explorer-v2.62.0) (2026-01-26)


### Features

* **common-utils:** add REACT_APP_BLOCK_EXPLORER_URL environment variable override ([#6774](https://github.com/cowprotocol/cowswap/issues/6774)) ([e23a0df](https://github.com/cowprotocol/cowswap/commit/e23a0df7240787d815c0126f83009895e3d3611a))
* new token selector ([#6790](https://github.com/cowprotocol/cowswap/issues/6790)) ([ccac201](https://github.com/cowprotocol/cowswap/commit/ccac201c860c66e1374798f712999a5962d1bdd5))


### Bug Fixes

* **bridging:** add near api key ([#6854](https://github.com/cowprotocol/cowswap/issues/6854)) ([448e639](https://github.com/cowprotocol/cowswap/commit/448e6392eb235a272b05a286e5cc565f7880396d))

## [2.61.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.60.0...explorer-v2.61.0) (2026-01-09)


### Features

* **trade:** implement consent logic for restricted tokens list ([#6617](https://github.com/cowprotocol/cowswap/issues/6617)) ([14686d1](https://github.com/cowprotocol/cowswap/commit/14686d1c71bae6ceacc14f86679412f06e7297c5))


### Bug Fixes

* **plasma:** minor fixes for plasma chain ([#6795](https://github.com/cowprotocol/cowswap/issues/6795)) ([13b9ffe](https://github.com/cowprotocol/cowswap/commit/13b9ffefe73f27b5a812179840cdcf3f177a0807))
* to address tooltip for bridge orders ([#6766](https://github.com/cowprotocol/cowswap/issues/6766)) ([b1ef329](https://github.com/cowprotocol/cowswap/commit/b1ef32998e603b48c4f8f7f40889ad541e03df3d))

## [2.60.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.59.3...explorer-v2.60.0) (2025-12-24)


### Features

* add offset & limit params to getTrades ([#6567](https://github.com/cowprotocol/cowswap/issues/6567)) ([57d738d](https://github.com/cowprotocol/cowswap/commit/57d738de29b466d9c29b61cb3fd82936f760a336))

## [2.59.3](https://github.com/cowprotocol/cowswap/compare/explorer-v2.59.2...explorer-v2.59.3) (2025-12-19)


### Bug Fixes

* add user context on launch darkly initialization ([#6726](https://github.com/cowprotocol/cowswap/issues/6726)) ([fa02aa4](https://github.com/cowprotocol/cowswap/commit/fa02aa4cf7f951464049cb4f3a92544de457e760))

## [2.59.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.59.1...explorer-v2.59.2) (2025-12-16)


### Bug Fixes

* bnb coin image missing in explorer ([#6643](https://github.com/cowprotocol/cowswap/issues/6643)) ([5d05589](https://github.com/cowprotocol/cowswap/commit/5d05589377722ed3b16f652e944a414f1d32435c))
* **bridge:** display executed amount in bridge details ([#6671](https://github.com/cowprotocol/cowswap/issues/6671)) ([8c5772c](https://github.com/cowprotocol/cowswap/commit/8c5772cba710c43007c9ac925eb28b5d5c3c3d20))
* **bridge:** fix displayed bridge quote amounts ([#6670](https://github.com/cowprotocol/cowswap/issues/6670)) ([623e0e5](https://github.com/cowprotocol/cowswap/commit/623e0e5b09c33132debdfd06493c357c0af8aa80))
* from & to labels for near bridging ([#6653](https://github.com/cowprotocol/cowswap/issues/6653)) ([7a2cfa8](https://github.com/cowprotocol/cowswap/commit/7a2cfa8477936222e019373971111a919e54c85f))
* update schema reference for app data ([#6626](https://github.com/cowprotocol/cowswap/issues/6626)) ([93e78e6](https://github.com/cowprotocol/cowswap/commit/93e78e69454039fc89eeeb170f076a7957db604f))

## [2.59.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.59.0...explorer-v2.59.1) (2025-12-09)


### Bug Fixes

* avoid using i18n in hookDappsRegistry ([#6633](https://github.com/cowprotocol/cowswap/issues/6633)) ([9cfeae0](https://github.com/cowprotocol/cowswap/commit/9cfeae0c107a632e78176c004aa3614fad12f68b))

## [2.59.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.58.0...explorer-v2.59.0) (2025-11-24)


### Features

* **bridge:** add Near provider and provider feature-flags ([#6466](https://github.com/cowprotocol/cowswap/issues/6466)) ([c91b17f](https://github.com/cowprotocol/cowswap/commit/c91b17f9c24fef516eee904e51268264b6adff25))
* **internationalization:** add internationalization to CoW Swap ([#6198](https://github.com/cowprotocol/cowswap/issues/6198)) ([bec1e54](https://github.com/cowprotocol/cowswap/commit/bec1e54643d9b20a8b6517eae188993e364fed90))

## [2.58.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.57.0...explorer-v2.58.0) (2025-11-10)


### Features

* **new-chains:** add q4 chains ([#6404](https://github.com/cowprotocol/cowswap/issues/6404)) ([ba4edb0](https://github.com/cowprotocol/cowswap/commit/ba4edb0fdc7b4c700dfeae9023da330d74a9faea))


### Bug Fixes

* **explorer:** do not add tx row when there's no tx hash ([#6499](https://github.com/cowprotocol/cowswap/issues/6499)) ([3f66a7a](https://github.com/cowprotocol/cowswap/commit/3f66a7adb820fc246fe7b2f9624b157bcb25c5b3))

## [2.57.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.56.0...explorer-v2.57.0) (2025-11-05)


### Features

* adjust params type to trigger a bumping of version ([#6476](https://github.com/cowprotocol/cowswap/issues/6476)) ([1e08587](https://github.com/cowprotocol/cowswap/commit/1e0858701b909fe2847be325ed2a7287592711b8))

## [2.56.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.55.0...explorer-v2.56.0) (2025-10-14)


### Features

* use suggested slippage from BFF ([#6313](https://github.com/cowprotocol/cowswap/issues/6313)) ([30c5ff6](https://github.com/cowprotocol/cowswap/commit/30c5ff6c118513aad75edf2355282f9097194c1d))

## [2.55.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.54.3...explorer-v2.55.0) (2025-10-02)


### Features

* use bff's socket proxy for local/pr envs ([#6292](https://github.com/cowprotocol/cowswap/issues/6292)) ([610a6cc](https://github.com/cowprotocol/cowswap/commit/610a6cc3ba320e3b88f34cfd8ad28e810cc20ae8))

## [2.54.3](https://github.com/cowprotocol/cowswap/compare/explorer-v2.54.2...explorer-v2.54.3) (2025-09-22)


### Bug Fixes

* **explorer:** handle type for order class data ([#6295](https://github.com/cowprotocol/cowswap/issues/6295)) ([60fe5cd](https://github.com/cowprotocol/cowswap/commit/60fe5cd750d065a5210ece2c0101bc1ca7da462b))

## [2.54.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.54.1...explorer-v2.54.2) (2025-09-16)


### Bug Fixes

* explorer environments ([#6271](https://github.com/cowprotocol/cowswap/issues/6271)) ([cffe763](https://github.com/cowprotocol/cowswap/commit/cffe763fd99bb2ee2de50146c6a91ad78f8e71e7))

## [2.54.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.54.0...explorer-v2.54.1) (2025-09-15)


### Bug Fixes

* update CoW Swap and Explorer with bungee changes ([#6265](https://github.com/cowprotocol/cowswap/issues/6265)) ([a38b9d9](https://github.com/cowprotocol/cowswap/commit/a38b9d97ebffd9837ef4d1ea9a946e979d9ed7e4))

## [2.54.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.53.1...explorer-v2.54.0) (2025-09-12)


### Features

* restore Gnosis Affiliate header ([#6228](https://github.com/cowprotocol/cowswap/issues/6228)) ([22d0894](https://github.com/cowprotocol/cowswap/commit/22d08941a67032712e6d206ea8579786ed78715f))

## [2.53.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.53.0...explorer-v2.53.1) (2025-08-28)


### Bug Fixes

* **bungee:** remove custom affiliate logic/endpoints ([#6193](https://github.com/cowprotocol/cowswap/issues/6193)) ([d4feb5c](https://github.com/cowprotocol/cowswap/commit/d4feb5cbdedcbd4761498d0ab7c1e055cbc5e545))

## [2.53.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.52.0...explorer-v2.53.0) (2025-08-28)


### Features

* **bridging:** enable mainnet-&gt;gnosis bridge ([#6172](https://github.com/cowprotocol/cowswap/issues/6172)) ([d1bb3d5](https://github.com/cowprotocol/cowswap/commit/d1bb3d5376cdd09ce2801a9bbf4a67b8b70f5d1b))


### Bug Fixes

* **lens:** follow up fixes ([#6176](https://github.com/cowprotocol/cowswap/issues/6176)) ([cd8f3c0](https://github.com/cowprotocol/cowswap/commit/cd8f3c0201b8f04fc31a59588b6d2d05d215e112))

## [2.52.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.51.0...explorer-v2.52.0) (2025-08-21)


### Features

* **new-networks:** lens and bnb ([#5992](https://github.com/cowprotocol/cowswap/issues/5992)) ([19ac060](https://github.com/cowprotocol/cowswap/commit/19ac060f94088e7a1f6a2a891ef11d2c1ded4525))


### Bug Fixes

* **lens:** fix lens twap cancellation ([#6170](https://github.com/cowprotocol/cowswap/issues/6170)) ([d04d82e](https://github.com/cowprotocol/cowswap/commit/d04d82ebe4eb7943d8cde4493446cdc5e3344f51))

## [2.51.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.50.0...explorer-v2.51.0) (2025-08-07)


### Features

* **explorer:** sort fills tab by execution date, descending ([#6080](https://github.com/cowprotocol/cowswap/issues/6080)) ([3c58f9d](https://github.com/cowprotocol/cowswap/commit/3c58f9d304a755cb4ed9ae8ea1584262bec40917))
* respect explorer environment for explorer navigation to Swap's … ([#6060](https://github.com/cowprotocol/cowswap/issues/6060)) ([c1d778a](https://github.com/cowprotocol/cowswap/commit/c1d778a56d1fc5facbc743b649af23f7953ee364))
* use received label constant for consistency in bridging content ([#6071](https://github.com/cowprotocol/cowswap/issues/6071)) ([709d183](https://github.com/cowprotocol/cowswap/commit/709d183bf7d8e41fc6705dc3dda89214c96e6919))


### Bug Fixes

* **bridge:** use account proxy label for consistent naming ([#6073](https://github.com/cowprotocol/cowswap/issues/6073)) ([d2d4e39](https://github.com/cowprotocol/cowswap/commit/d2d4e392e1c9f05dae2552aba11f07dacee077f0))
* **explorer:** add space between native token and chain name ([#6101](https://github.com/cowprotocol/cowswap/issues/6101)) ([304bbdf](https://github.com/cowprotocol/cowswap/commit/304bbdf3c0a5a675615e6e22a6141ef240acc31a))
* **explorer:** remove flickering from app-data details ([#6083](https://github.com/cowprotocol/cowswap/issues/6083)) ([310f445](https://github.com/cowprotocol/cowswap/commit/310f445444c42440a2c1cf0c7f941ef1f9109fd3))
* **explorer:** resolve native tokens from hardcode ([#6081](https://github.com/cowprotocol/cowswap/issues/6081)) ([6fdec11](https://github.com/cowprotocol/cowswap/commit/6fdec114b2b060de087c7577654697edc1c1d6fe))

## [2.50.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.49.0...explorer-v2.50.0) (2025-07-31)


### Features

* remove from Explorer bridge order `Sender` row ([#6051](https://github.com/cowprotocol/cowswap/issues/6051)) ([bf54034](https://github.com/cowprotocol/cowswap/commit/bf540347234906129496253f0c2c1d51f2fde6f7))

## [2.49.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.48.3...explorer-v2.49.0) (2025-07-30)


### Features

* **bridge:** adjust addresses displaying in Explorer ([#6021](https://github.com/cowprotocol/cowswap/issues/6021)) ([37cdaf0](https://github.com/cowprotocol/cowswap/commit/37cdaf07a74c1b9b4357a4e942cc7ddc139f1873))


### Bug Fixes

* **bridge:** better destination tokens filtering ([#5965](https://github.com/cowprotocol/cowswap/issues/5965)) ([1e738e3](https://github.com/cowprotocol/cowswap/commit/1e738e3b547584158f8083500926819b1bb2de93))
* **explorer:** display unknown network token logo ([#6013](https://github.com/cowprotocol/cowswap/issues/6013)) ([095ad7b](https://github.com/cowprotocol/cowswap/commit/095ad7bce0741fe0a45adc3f65b26cdf88e5dd6f))
* **explorer:** load coingecko tokens for all chains ([#6015](https://github.com/cowprotocol/cowswap/issues/6015)) ([4d57a5c](https://github.com/cowprotocol/cowswap/commit/4d57a5c2caf7b26952a3661c1e6ae76ac5bffb16))
* **explorer:** update bridge status ([#6041](https://github.com/cowprotocol/cowswap/issues/6041)) ([a548008](https://github.com/cowprotocol/cowswap/commit/a548008ba68355a00a7a1a69b32d1b6434a133af))
* improve bridge details on cow explorer ([#6042](https://github.com/cowprotocol/cowswap/issues/6042)) ([77b17ca](https://github.com/cowprotocol/cowswap/commit/77b17ca2f5129aa874ba001b436b7299ade82e4a))

## [2.48.3](https://github.com/cowprotocol/cowswap/compare/explorer-v2.48.2...explorer-v2.48.3) (2025-07-10)


### Bug Fixes

* **explorer:** remove selection styles ([#5941](https://github.com/cowprotocol/cowswap/issues/5941)) ([ad727f6](https://github.com/cowprotocol/cowswap/commit/ad727f6a6d70fa36300875ff4be4a4a51069ddfc))
* update InlineBanner width for UnsignedOrderWarning component ([#5948](https://github.com/cowprotocol/cowswap/issues/5948)) ([bca7971](https://github.com/cowprotocol/cowswap/commit/bca79715be6e43c405be432eacd4a6ef5d8f978f))

## [2.48.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.48.1...explorer-v2.48.2) (2025-07-03)


### Bug Fixes

* **bridge:** do not estimate gas for hook ([#5887](https://github.com/cowprotocol/cowswap/issues/5887)) ([028840b](https://github.com/cowprotocol/cowswap/commit/028840b7c4cab605a17462d98e1a13fb68e16cbc))
* **explorer:** handle limit price is infinite ([#5886](https://github.com/cowprotocol/cowswap/issues/5886)) ([9c333cc](https://github.com/cowprotocol/cowswap/commit/9c333ccb0856b06a19d16f1e6a148655d89d8ba8))

## [2.48.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.48.0...explorer-v2.48.1) (2025-06-20)


### Bug Fixes

* **explorer:** empty change to trigger build ([#5873](https://github.com/cowprotocol/cowswap/issues/5873)) ([b309e70](https://github.com/cowprotocol/cowswap/commit/b309e70fe042f566af2d10097cbcd90e433e2e0e))

## [2.48.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.47.0...explorer-v2.48.0) (2025-06-18)


### Features

* **bridge:** add bridge types and order type guard to explorer ([#5725](https://github.com/cowprotocol/cowswap/issues/5725)) ([e4896fd](https://github.com/cowprotocol/cowswap/commit/e4896fd9bf3d9a8f3315cf8350ab45a702092534))
* **bridge:** add cosmos explorer configuration and global decorator ([#5729](https://github.com/cowprotocol/cowswap/issues/5729)) ([8249f4a](https://github.com/cowprotocol/cowswap/commit/8249f4aa27b067cfecfb164b6ba9c2c2e45d46d4))
* **new-networks:** add support to `Avalanche` and `Polygon` networks ([#5715](https://github.com/cowprotocol/cowswap/issues/5715)) ([e3e8a8d](https://github.com/cowprotocol/cowswap/commit/e3e8a8d6b94569a5dda7a425d1a79f0b4f6d5200))


### Bug Fixes

* **explorer:** adjust items order in order details ([#5846](https://github.com/cowprotocol/cowswap/issues/5846)) ([bf0e321](https://github.com/cowprotocol/cowswap/commit/bf0e3217132d7188bbb6749d2ef1e39c1dbbaa73))
* make order progress bar UI more stable ([#5834](https://github.com/cowprotocol/cowswap/issues/5834)) ([80cebd1](https://github.com/cowprotocol/cowswap/commit/80cebd1104a0a2e30e12ce8a4b3d62c212559cec))

## [2.47.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.46.0...explorer-v2.47.0) (2025-05-19)


### Features

* adapt to new app-data and fix issue decoding ([#5678](https://github.com/cowprotocol/cowswap/issues/5678)) ([db791a2](https://github.com/cowprotocol/cowswap/commit/db791a21afdcd2ec8f10db293833725cd6581a28))


### Bug Fixes

* consistent naming for Order history button and page ([#5683](https://github.com/cowprotocol/cowswap/issues/5683)) ([a34d3f7](https://github.com/cowprotocol/cowswap/commit/a34d3f783e52ec54207a6ec79ce3d9ae9a641e5e))
* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [2.46.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.45.1...explorer-v2.46.0) (2025-05-07)


### Features

* **explorer:** add link to CoW Swap to Explorer menu ([#5649](https://github.com/cowprotocol/cowswap/issues/5649)) ([bc8a100](https://github.com/cowprotocol/cowswap/commit/bc8a10033e92bf615c202127b4b04ab7b84dc5b0))


### Bug Fixes

* **explorer:** fix 'partially filled' status color ([#5647](https://github.com/cowprotocol/cowswap/issues/5647)) ([ce6535d](https://github.com/cowprotocol/cowswap/commit/ce6535dda0f4ead6a5ba97b044acea863eedd3ed))

## [2.45.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.45.0...explorer-v2.45.1) (2025-04-25)


### Bug Fixes

* **deps-update:** bump cytoscape and @types/cytoscape ([#5590](https://github.com/cowprotocol/cowswap/issues/5590)) ([6a83086](https://github.com/cowprotocol/cowswap/commit/6a83086473cb503aa8c69f5e79ccd0ac007f5a27))
* **deps-update:** bump react-router-dom from 6.24.0 to 7.5.1 ([#5618](https://github.com/cowprotocol/cowswap/issues/5618)) ([2470bfa](https://github.com/cowprotocol/cowswap/commit/2470bfaf7ec0629223ea4dd5b42f090dd58a45df))
* **explorer:** fix explorer deep links ([#5631](https://github.com/cowprotocol/cowswap/issues/5631)) ([90b5ae8](https://github.com/cowprotocol/cowswap/commit/90b5ae897a7f365ced1e1ca816a6c851b63a1994))

## [2.45.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.44.0...explorer-v2.45.0) (2025-03-27)


### Features

* enhance event tracking and analytics integration ([#5507](https://github.com/cowprotocol/cowswap/issues/5507)) ([39ea64d](https://github.com/cowprotocol/cowswap/commit/39ea64d7e7c7fe908327590b998bf6efc82c1b07))

## [2.44.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.43.0...explorer-v2.44.0) (2025-02-27)


### Features

* add dummy change to force release ([0a5a954](https://github.com/cowprotocol/cowswap/commit/0a5a9547bdfe9f3bec4fd73dc11ffd0035501d90))

## [2.43.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.42.2...explorer-v2.43.0) (2025-02-25)


### Features

* **analytics:** migrate to GTM-based analytics ([#5360](https://github.com/cowprotocol/cowswap/issues/5360)) ([f404d02](https://github.com/cowprotocol/cowswap/commit/f404d0280d9d1d86cc249d70852a5c0ec9827475))

## [2.42.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.42.1...explorer-v2.42.2) (2025-02-12)


### Bug Fixes

* **explorer:** enhance hooks details layout ([#5416](https://github.com/cowprotocol/cowswap/issues/5416)) ([3259da8](https://github.com/cowprotocol/cowswap/commit/3259da89a791dc04a832ea7093f5b2a9fa441b95))
* tooltip placement inside an order in cow  explorer ([#5400](https://github.com/cowprotocol/cowswap/issues/5400)) ([8288fa6](https://github.com/cowprotocol/cowswap/commit/8288fa6dad18c951c16d428ac6c8f318fce35ca1))

## [2.42.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.42.0...explorer-v2.42.1) (2025-02-05)


### Bug Fixes

* **explorer:** fix navigation between tabs is not working using browser arrows ([#5280](https://github.com/cowprotocol/cowswap/issues/5280)) ([3e1bcfe](https://github.com/cowprotocol/cowswap/commit/3e1bcfe153986f91fa5cd06ee0f3625c8419bba8))
* **explorer:** ui Adjustment ([#5268](https://github.com/cowprotocol/cowswap/issues/5268)) ([7d3242c](https://github.com/cowprotocol/cowswap/commit/7d3242c19f50993babcc71bf988e089c3962f61d))

## [2.42.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.41.0...explorer-v2.42.0) (2025-01-09)


### Features

* executedSurplusFee removal ([#5262](https://github.com/cowprotocol/cowswap/issues/5262)) ([3be8a65](https://github.com/cowprotocol/cowswap/commit/3be8a65309048d4082f2ce25f5b39624e092dbf2))

## [2.41.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.40.1...explorer-v2.41.0) (2024-12-19)


### Features

* fix pagination for fills ([#5228](https://github.com/cowprotocol/cowswap/issues/5228)) ([9563df4](https://github.com/cowprotocol/cowswap/commit/9563df4c55da2e985d303552cc16851cd5b9b533))

## [2.40.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.40.0...explorer-v2.40.1) (2024-12-18)


### Bug Fixes

* fix lint issues ([#5229](https://github.com/cowprotocol/cowswap/issues/5229)) ([25d30bb](https://github.com/cowprotocol/cowswap/commit/25d30bb6496a1fa51719b639948cc4d7b8ec5f20))

## [2.40.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.39.0...explorer-v2.40.0) (2024-12-18)


### Features

* improve orders table when hidden orders ([#5226](https://github.com/cowprotocol/cowswap/issues/5226)) ([a4aaff9](https://github.com/cowprotocol/cowswap/commit/a4aaff94980fad15030bb057bbc45baa20f8336c))

## [2.39.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.38.0...explorer-v2.39.0) (2024-12-17)


### Features

* warn about unsigned orders, and hide not relevant orders ([#5214](https://github.com/cowprotocol/cowswap/issues/5214)) ([0d19616](https://github.com/cowprotocol/cowswap/commit/0d196168076fda10e8e5d823d0288ce0ed1bd612))

## [2.38.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.37.0...explorer-v2.38.0) (2024-12-04)


### Features

* upgrade react@19 and next@15 ([#5147](https://github.com/cowprotocol/cowswap/issues/5147)) ([a00b1b9](https://github.com/cowprotocol/cowswap/commit/a00b1b930602ab1e6b2f0b3cd148497f68bf4cb5))

## [2.37.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.36.1...explorer-v2.37.0) (2024-12-03)


### Features

* allow adding networks without invalidating local-storage ([#5134](https://github.com/cowprotocol/cowswap/issues/5134)) ([995b4c0](https://github.com/cowprotocol/cowswap/commit/995b4c05da90356c6621a92dc58efbd6f37349ff))
* **base:** add base chain support ([#5044](https://github.com/cowprotocol/cowswap/issues/5044)) ([4cf0c91](https://github.com/cowprotocol/cowswap/commit/4cf0c91a300d6fcdc026364e74c45e5b2f729f2b))
* **explorer:** add search bar in order view ([#5118](https://github.com/cowprotocol/cowswap/issues/5118)) ([d708dcf](https://github.com/cowprotocol/cowswap/commit/d708dcf7e8428eaef611a9288f45f2c3f51bc689))
* improve custom hook validation messages ([#5123](https://github.com/cowprotocol/cowswap/issues/5123)) ([91bab8d](https://github.com/cowprotocol/cowswap/commit/91bab8dc3b124a32790c3bb1955b01dd3a75ea7b))

## [2.36.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.36.0...explorer-v2.36.1) (2024-11-06)


### Bug Fixes

* **explorer:** make sure txHash always has the 0x prefix ([#5061](https://github.com/cowprotocol/cowswap/issues/5061)) ([9054969](https://github.com/cowprotocol/cowswap/commit/9054969abcc4daceb16bbc04e186918fb092e3db))

## [2.36.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.35.2...explorer-v2.36.0) (2024-10-18)


### Features

* **explorer:** update explorer graph images ([#5008](https://github.com/cowprotocol/cowswap/issues/5008)) ([8952e9f](https://github.com/cowprotocol/cowswap/commit/8952e9f7b29ff848fa3da3f811e3e6232eb92361))

## [2.35.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.35.1...explorer-v2.35.2) (2024-10-18)


### Bug Fixes

* **explorer:** display hook details of unknown hook-dapp ([#4995](https://github.com/cowprotocol/cowswap/issues/4995)) ([eaa29f3](https://github.com/cowprotocol/cowswap/commit/eaa29f3ed421d92214b857bf1c57d75b0317cbba))

## [2.35.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.35.0...explorer-v2.35.1) (2024-10-14)


### Bug Fixes

* **explorer:** do not crash when appData is not parsed ([#4983](https://github.com/cowprotocol/cowswap/issues/4983)) ([b960bde](https://github.com/cowprotocol/cowswap/commit/b960bde94570dba2a297ecb59a7a79cbbbfcefb8))

## [2.35.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.34.1...explorer-v2.35.0) (2024-10-10)


### Features

* **explorer:** display order hooks details ([#4921](https://github.com/cowprotocol/cowswap/issues/4921)) ([9c364bd](https://github.com/cowprotocol/cowswap/commit/9c364bd81f2e392a8cece06f6470734ee3d7623c))
* **hooks-store:** adjust hook details and rescue funds styles ([#4948](https://github.com/cowprotocol/cowswap/issues/4948)) ([aedc8d1](https://github.com/cowprotocol/cowswap/commit/aedc8d14c9b8dc3b25f964985b41b25229fd1547))

## [2.34.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.34.0...explorer-v2.34.1) (2024-09-30)


### Bug Fixes

* **explorer:** get token logo url from known token lists ([#4922](https://github.com/cowprotocol/cowswap/issues/4922)) ([2f2f572](https://github.com/cowprotocol/cowswap/commit/2f2f572c1e05e65fc41e89361d28b267054a8428))

## [2.34.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.33.1...explorer-v2.34.0) (2024-09-17)


### Features

* **hooks-store:** new design & refactoring ([#4859](https://github.com/cowprotocol/cowswap/issues/4859)) ([1b989fa](https://github.com/cowprotocol/cowswap/commit/1b989fa037b276d507adfa0462129ab53fe2ac6d))

## [2.33.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.33.0...explorer-v2.33.1) (2024-08-14)


### Bug Fixes

* fix wrong quote in explorer ([#4791](https://github.com/cowprotocol/cowswap/issues/4791)) ([b70b27c](https://github.com/cowprotocol/cowswap/commit/b70b27cf6d25e76ae79b3906693095a2e92e64d9))
* replace cloudflare-ipfs.com with ipfs.io ([#4786](https://github.com/cowprotocol/cowswap/issues/4786)) ([a10df31](https://github.com/cowprotocol/cowswap/commit/a10df31010c34c90cffdad34b69a320a4167e119))

## [2.33.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.32.3...explorer-v2.33.0) (2024-07-18)


### Features

* refactor and untangle analytics ([#4718](https://github.com/cowprotocol/cowswap/issues/4718)) ([ee396eb](https://github.com/cowprotocol/cowswap/commit/ee396eb1c4ef9a786810ed20b20020b4cb986460))


### Bug Fixes

* invalid HTML tag nesting ([#4708](https://github.com/cowprotocol/cowswap/issues/4708)) ([f6b09a0](https://github.com/cowprotocol/cowswap/commit/f6b09a0ba5e12b65b85d53b68f993fe690c0eddb))

## [2.32.3](https://github.com/cowprotocol/cowswap/compare/explorer-v2.32.2...explorer-v2.32.3) (2024-07-12)


### Bug Fixes

* **explorer:** fix linter issues ([#4714](https://github.com/cowprotocol/cowswap/issues/4714)) ([7cebbdc](https://github.com/cowprotocol/cowswap/commit/7cebbdccc1e71c878be6a97c7f894ed57c7d4821))

## [2.32.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.32.1...explorer-v2.32.2) (2024-07-10)


### Bug Fixes

* fix broken links in gnosis chain ([#4706](https://github.com/cowprotocol/cowswap/issues/4706)) ([af8172d](https://github.com/cowprotocol/cowswap/commit/af8172d3b2d97e3c7c1150a8237344e5182a310d))

## [2.32.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.32.0...explorer-v2.32.1) (2024-07-05)


### Bug Fixes

* **explorer:** invert fills table order (newest first) ([#4642](https://github.com/cowprotocol/cowswap/issues/4642)) ([b249413](https://github.com/cowprotocol/cowswap/commit/b2494137c75dbd98ccb3278940b409f0e4c95dd9))

## [2.32.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.31.1...explorer-v2.32.0) (2024-06-27)


### Features

* add easy link for Etherscan ([#4573](https://github.com/cowprotocol/cowswap/issues/4573)) ([bfd5cf9](https://github.com/cowprotocol/cowswap/commit/bfd5cf9bd6d2aa121bf1c3e81a81652aacd271d0))


### Bug Fixes

* **limit-orders:** redesign confirm modal context usage ([#4628](https://github.com/cowprotocol/cowswap/issues/4628)) ([856f180](https://github.com/cowprotocol/cowswap/commit/856f180573c156c9da73bf68a8a7317eea49cb67))

## [2.31.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.31.0...explorer-v2.31.1) (2024-06-25)


### Bug Fixes

* **cow-fi:** improve twitter ports loading ([#4606](https://github.com/cowprotocol/cowswap/issues/4606)) ([989091b](https://github.com/cowprotocol/cowswap/commit/989091b74000b6142eb31fce18ec71b7e5fe4dfc))
* reduce decimals to percentage ([#4574](https://github.com/cowprotocol/cowswap/issues/4574)) ([b95205a](https://github.com/cowprotocol/cowswap/commit/b95205a0f107c8231840a03aa248a26b8f4d1172))

## [2.31.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.30.1...explorer-v2.31.0) (2024-06-24)


### Features

* **explorer:** show execution time when available ([#4575](https://github.com/cowprotocol/cowswap/issues/4575)) ([f93a8d3](https://github.com/cowprotocol/cowswap/commit/f93a8d315788d47e1b9932d946b91b41fc12a2cd))
* **explorer:** truncated orderId with CSS ([#4557](https://github.com/cowprotocol/cowswap/issues/4557)) ([88b5c06](https://github.com/cowprotocol/cowswap/commit/88b5c061beefdf7866a39a84a940ea01715e9c0b))
* **rebranding:** merge 📦 Big Package "Re-branding" 📦  ([#4543](https://github.com/cowprotocol/cowswap/issues/4543)) ([ce9ab43](https://github.com/cowprotocol/cowswap/commit/ce9ab4317f304c86e3e1ec37825379e427099518))
* theme unification and cleaning ([#4580](https://github.com/cowprotocol/cowswap/issues/4580)) ([c1538b1](https://github.com/cowprotocol/cowswap/commit/c1538b16d9c890c95d73ea92ffb93b2065233d90))


### Bug Fixes

* **rebranding:** polish UI ([#4581](https://github.com/cowprotocol/cowswap/issues/4581)) ([a038458](https://github.com/cowprotocol/cowswap/commit/a038458a23d91fb9b624679950ee6492a966ccba))

## [2.30.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.30.0...explorer-v2.30.1) (2024-06-11)


### Bug Fixes

* change something in the explorer to trigger with release please ([#4538](https://github.com/cowprotocol/cowswap/issues/4538)) ([9c5176b](https://github.com/cowprotocol/cowswap/commit/9c5176b697a99ad9f384741291c6e08a0ce72937))

## [2.30.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.6...explorer-v2.30.0) (2024-05-29)


### Features

* add arbitrum uni token list ([#4488](https://github.com/cowprotocol/cowswap/issues/4488)) ([057bc68](https://github.com/cowprotocol/cowswap/commit/057bc689771bd256d667f3335a3da0b683f1bd8d))
* **arbitrum:** add arbitrum_one ([#4407](https://github.com/cowprotocol/cowswap/issues/4407)) ([166e33f](https://github.com/cowprotocol/cowswap/commit/166e33f3c494972738b154cf844584dd78e12c7d))


### Bug Fixes

* **explorer:** adjust almost fully filled orders displaying ([#4482](https://github.com/cowprotocol/cowswap/issues/4482)) ([3a5d654](https://github.com/cowprotocol/cowswap/commit/3a5d65484ab8818f5a5ba6aa18e6519243f686ee))
* navigate with widget awareness ([#4471](https://github.com/cowprotocol/cowswap/issues/4471)) ([f0c4134](https://github.com/cowprotocol/cowswap/commit/f0c41344eea751006a4fe0b66865b2c5c30a5310))

## [2.29.6](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.5...explorer-v2.29.6) (2024-05-22)


### Bug Fixes

* **explorer:** reduce retries for tx orders requests ([#4438](https://github.com/cowprotocol/cowswap/issues/4438)) ([2ee1a8d](https://github.com/cowprotocol/cowswap/commit/2ee1a8dfa79aed6d68a89feae7a3c757addcbdf0))

## [2.29.5](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.4...explorer-v2.29.5) (2024-04-22)


### Bug Fixes

* **explorer:** fix browser crashing ([#4287](https://github.com/cowprotocol/cowswap/issues/4287)) ([879b5eb](https://github.com/cowprotocol/cowswap/commit/879b5eba4644401864349f944472e5e5757430e1))

## [2.29.4](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.3...explorer-v2.29.4) (2024-04-19)


### Bug Fixes

* **explorer:** add sepolia token list ([#4280](https://github.com/cowprotocol/cowswap/issues/4280)) ([1def104](https://github.com/cowprotocol/cowswap/commit/1def104caf6a05cf0788b42a5ba4ac7f377d8f9f))

## [2.29.3](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.2...explorer-v2.29.3) (2024-04-18)


### Bug Fixes

* **explorer:** fix tokens not loaded on explorer ([#4245](https://github.com/cowprotocol/cowswap/issues/4245)) ([6546008](https://github.com/cowprotocol/cowswap/commit/6546008956b50d99294b26962c4c385e47c3b6d2))

## [2.29.2](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.1...explorer-v2.29.2) (2024-03-21)


### Bug Fixes

* **explorer:** use feature flag to show charts and tokens table ([#4068](https://github.com/cowprotocol/cowswap/issues/4068)) ([9bff945](https://github.com/cowprotocol/cowswap/commit/9bff945c0f891aa5d6527a51c509b9f0802741d5))

## [2.29.1](https://github.com/cowprotocol/cowswap/compare/explorer-v2.29.0...explorer-v2.29.1) (2024-03-13)


### Bug Fixes

* **explorer:** migrate to nodereal api from infura ([#4041](https://github.com/cowprotocol/cowswap/issues/4041)) ([c4ae5a2](https://github.com/cowprotocol/cowswap/commit/c4ae5a21d5429ccb8b2456848add5fb9b8a14f5d))

## [2.29.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.28.0...explorer-v2.29.0) (2024-03-12)


### Features

* Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))


### Bug Fixes

* **explorer:** do not show tokens table on gchain ([#3948](https://github.com/cowprotocol/cowswap/issues/3948)) ([712e6db](https://github.com/cowprotocol/cowswap/commit/712e6dbeee799191102e4fb27bc43c72f19db1ed))

## [2.28.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.27.0...explorer-v2.28.0) (2024-02-01)


### Features

* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))

## [2.27.0](https://github.com/cowprotocol/cowswap/compare/explorer-v2.26.0...explorer-v2.27.0) (2024-01-17)


### Features

* cleanup and minify assets ([#3609](https://github.com/cowprotocol/cowswap/issues/3609)) ([62dd797](https://github.com/cowprotocol/cowswap/commit/62dd79796047500dd10b13a53a581c68ef8fc7c1))
* **explorer:** copy-paste files from previous repo ([#3578](https://github.com/cowprotocol/cowswap/issues/3578)) ([9561bcb](https://github.com/cowprotocol/cowswap/commit/9561bcb42dd835197e272c734691a854ef089c7b))
* **explorer:** support Sepolia network ([#3580](https://github.com/cowprotocol/cowswap/issues/3580)) ([d744c4a](https://github.com/cowprotocol/cowswap/commit/d744c4adc595b93b55310fd5d4e57594f45d9b26))
* **explorer:** update project and migrate to vite ([#3579](https://github.com/cowprotocol/cowswap/issues/3579)) ([3056162](https://github.com/cowprotocol/cowswap/commit/30561629f872612e85d64757004d9400f1600781))


### Bug Fixes

* **explorer:** cast string SupportedChainId to number ([#3624](https://github.com/cowprotocol/cowswap/issues/3624)) ([784ce32](https://github.com/cowprotocol/cowswap/commit/784ce32bcfa7908999f3130357582602f02802a5))
* **explorer:** change link to explorer version ([#3653](https://github.com/cowprotocol/cowswap/issues/3653)) ([e086118](https://github.com/cowprotocol/cowswap/commit/e086118295fe788afc9aac6ecd68defc9d634e79))
