# Changelog

## [1.44.4](https://github.com/cowprotocol/cowswap/compare/v1.44.3...v1.44.4) (2023-08-16)


### Features

* **orders-table:** display order receiver address ([#3042](https://github.com/cowprotocol/cowswap/issues/3042)) ([948c46d](https://github.com/cowprotocol/cowswap/commit/948c46dd6072efb7324b53b4a29a2c9cca268b9f))


### Bug Fixes

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
