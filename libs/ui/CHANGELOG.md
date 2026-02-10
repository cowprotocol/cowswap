# Changelog

## [2.1.0](https://github.com/cowprotocol/cowswap/compare/ui-v2.0.1...ui-v2.1.0) (2026-02-05)


### ✨ Features

* **trade:** upload appData to IPFS before signing ([#6922](https://github.com/cowprotocol/cowswap/issues/6922)) ([cb94104](https://github.com/cowprotocol/cowswap/commit/cb9410470c549bd5453a7933a0a224ba706ec2c2))


### 🔧 Miscellaneous

* update sdk ([a20814b](https://github.com/cowprotocol/cowswap/commit/a20814b7caf16f495cd0292d5f3469bc552e4d97))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.1.0
    * @cowprotocol/assets bumped to 2.0.1
    * @cowprotocol/common-const bumped to 2.1.0
    * @cowprotocol/common-hooks bumped to 2.1.0
    * @cowprotocol/common-utils bumped to 2.1.0
    * @cowprotocol/core bumped to 2.1.0
    * @cowprotocol/types bumped to 3.1.0
    * @cowprotocol/ui-utils bumped to 2.0.1

## [2.0.1](https://github.com/cowprotocol/cowswap/compare/ui-v2.0.0...ui-v2.0.1) (2026-02-02)


### Bug Fixes

* **protocol-fee:** support decimals in protocol fee ([#6948](https://github.com/cowprotocol/cowswap/issues/6948)) ([a572bbe](https://github.com/cowprotocol/cowswap/commit/a572bbe2899b0a48b2c0891922442a4420f6c3ef))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.0.1
    * @cowprotocol/common-const bumped to 2.0.1
    * @cowprotocol/common-hooks bumped to 2.0.1
    * @cowprotocol/common-utils bumped to 2.0.1
    * @cowprotocol/core bumped to 2.0.1
    * @cowprotocol/types bumped to 3.0.1

## [2.0.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.31.0...ui-v2.0.0) (2026-01-28)


### ⚠ BREAKING CHANGES

* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847))

### Features

* **limit:** load more orders button [#6853](https://github.com/cowprotocol/cowswap/issues/6853) ([b647396](https://github.com/cowprotocol/cowswap/commit/b647396c09f00b878ae06d0b0932c40512c0cba1))
* migrate from yarn to pnpm ([#6847](https://github.com/cowprotocol/cowswap/issues/6847)) ([1c5d115](https://github.com/cowprotocol/cowswap/commit/1c5d11516d0ddb997b0ebbb4eee4adcb491204a4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @cowprotocol/analytics bumped to 2.0.0
    * @cowprotocol/assets bumped to 2.0.0
    * @cowprotocol/common-const bumped to 2.0.0
    * @cowprotocol/common-hooks bumped to 2.0.0
    * @cowprotocol/common-utils bumped to 2.0.0
    * @cowprotocol/core bumped to 2.0.0
    * @cowprotocol/types bumped to 3.0.0
    * @cowprotocol/ui-utils bumped to 2.0.0

## [1.31.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.30.1...ui-v1.31.0) (2025-12-24)


### Features

* **bridge:** enable Near bridge provider for smart-contract wallets ([#6618](https://github.com/cowprotocol/cowswap/issues/6618)) ([0da32ab](https://github.com/cowprotocol/cowswap/commit/0da32abcd12183396870055f3cf92bc7b53002a3))

## [1.30.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.30.0...ui-v1.30.1) (2025-12-15)


### Bug Fixes

* menu theme logo ([#6672](https://github.com/cowprotocol/cowswap/issues/6672)) ([8eab3c9](https://github.com/cowprotocol/cowswap/commit/8eab3c994f0caf3ad62b51b8136f1202b42fdcf6))
* theme logo and Christmas background assets ([c2cd43a](https://github.com/cowprotocol/cowswap/commit/c2cd43a1e71062636dd5d18f246d7a41dc79388b))

## [1.30.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.29.0...ui-v1.30.0) (2025-11-24)


### Features

* **i18n:** finish internationalization setup ([#6526](https://github.com/cowprotocol/cowswap/issues/6526)) ([7b596e4](https://github.com/cowprotocol/cowswap/commit/7b596e49b132179152c6b8c5436dc5dd199f7aa8))
* **internationalization:** add internationalization to CoW Swap ([#6198](https://github.com/cowprotocol/cowswap/issues/6198)) ([bec1e54](https://github.com/cowprotocol/cowswap/commit/bec1e54643d9b20a8b6517eae188993e364fed90))

## [1.29.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.28.0...ui-v1.29.0) (2025-10-23)


### Features

* align seasonal theme priority with feature flags and dark mode ([#6378](https://github.com/cowprotocol/cowswap/issues/6378)) ([94e79c6](https://github.com/cowprotocol/cowswap/commit/94e79c6e697237c5f206f94b17065e93deaa6bb0))
* **notifications:** show trade alerts popover ([#6208](https://github.com/cowprotocol/cowswap/issues/6208)) ([d97c801](https://github.com/cowprotocol/cowswap/commit/d97c801ab43dd6ec208326ba80e145471a53a16d))


### Bug Fixes

* update font family to include 'Inter' in UI constants and theme ([#6370](https://github.com/cowprotocol/cowswap/issues/6370)) ([024ffb2](https://github.com/cowprotocol/cowswap/commit/024ffb26984fd1d862fa8143b8bee78e43ce6a50))

## [1.28.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.27.0...ui-v1.28.0) (2025-10-14)


### Features

* implement partial approve with new ui/ux ([7826f77](https://github.com/cowprotocol/cowswap/commit/7826f772d131055c7ccbb8fd9e1aeb7b4e5ac1b0))

## [1.27.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.26.1...ui-v1.27.0) (2025-08-21)


### Features

* **new-networks:** lens and bnb ([#5992](https://github.com/cowprotocol/cowswap/issues/5992)) ([19ac060](https://github.com/cowprotocol/cowswap/commit/19ac060f94088e7a1f6a2a891ef11d2c1ded4525))

## [1.26.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.26.0...ui-v1.26.1) (2025-07-31)


### Bug Fixes

* **bridge:** update protocol icons to use correct color scheme ([#6056](https://github.com/cowprotocol/cowswap/issues/6056)) ([2530852](https://github.com/cowprotocol/cowswap/commit/2530852b801eb11c3246c1b8107d68f709a26d18))

## [1.26.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.25.1...ui-v1.26.0) (2025-07-30)


### Features

* add warning banner if bridge fees are over limit ([#6009](https://github.com/cowprotocol/cowswap/issues/6009)) ([a11bd0a](https://github.com/cowprotocol/cowswap/commit/a11bd0a6d5c6145cb52bdd09d1286b35e565b80d))


### Bug Fixes

* **trade:** do not display quote error when loading ([#5979](https://github.com/cowprotocol/cowswap/issues/5979)) ([d7cc313](https://github.com/cowprotocol/cowswap/commit/d7cc3133872d3fb950f3d89c967c4325b9ab3a01))

## [1.25.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.25.0...ui-v1.25.1) (2025-07-10)


### Bug Fixes

* add fontBold prop for customizable font weight ([#5949](https://github.com/cowprotocol/cowswap/issues/5949)) ([f212bf5](https://github.com/cowprotocol/cowswap/commit/f212bf56feec9ec1e3b39be9e75a670f8690bbfe))
* update InlineBanner width for UnsignedOrderWarning component ([#5948](https://github.com/cowprotocol/cowswap/issues/5948)) ([bca7971](https://github.com/cowprotocol/cowswap/commit/bca79715be6e43c405be432eacd4a6ef5d8f978f))

## [1.25.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.24.0...ui-v1.25.0) (2025-07-03)


### Features

* **bridge:** add collapsible banner for proxy account information  ([#5895](https://github.com/cowprotocol/cowswap/issues/5895)) ([0825186](https://github.com/cowprotocol/cowswap/commit/0825186e2870abf4c3251dd819a07802c69456dc))
* **bridge:** display account proxy ([#5881](https://github.com/cowprotocol/cowswap/issues/5881)) ([0692597](https://github.com/cowprotocol/cowswap/commit/0692597adf45b469b5a547057b64e79296714ee2))
* **explorer:** display bridging data in order page ([#5787](https://github.com/cowprotocol/cowswap/issues/5787)) ([cd398f0](https://github.com/cowprotocol/cowswap/commit/cd398f0987064311d80c1628550a83df5ad31386))
* **trade:** display quote refetch indicator ([#5859](https://github.com/cowprotocol/cowswap/issues/5859)) ([c4f163f](https://github.com/cowprotocol/cowswap/commit/c4f163f8f7d56fc79057ed6d64e6fee4c8758824))

## [1.24.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.23.2...ui-v1.24.0) (2025-06-18)


### Features

* **bridge:** swap and bridge refactoring + progress UI ([#5755](https://github.com/cowprotocol/cowswap/issues/5755)) ([8a4cb5c](https://github.com/cowprotocol/cowswap/commit/8a4cb5c497cdd006df860a9240611e12cff3e60c))


### Bug Fixes

* reduce rerenders count and theme recalculation ([#5831](https://github.com/cowprotocol/cowswap/issues/5831)) ([96a7a35](https://github.com/cowprotocol/cowswap/commit/96a7a350f366615a1e5149097541b5e2ccf880f1))
* **service-worker:** disable verbose workbox logging in production ([#5815](https://github.com/cowprotocol/cowswap/issues/5815)) ([cb53ccb](https://github.com/cowprotocol/cowswap/commit/cb53ccb5a39a8857dfc030f0fb13869060211c8a))

## [1.23.2](https://github.com/cowprotocol/cowswap/compare/ui-v1.23.1...ui-v1.23.2) (2025-05-19)


### Bug Fixes

* **dev-deps-update:** bump the dev-deps group with 76 updates ([#5663](https://github.com/cowprotocol/cowswap/issues/5663)) ([552b349](https://github.com/cowprotocol/cowswap/commit/552b349f53762a01ccf008e9a2083248424cbafa))

## [1.23.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.23.0...ui-v1.23.1) (2025-05-07)


### Bug Fixes

* button's text color on Confirm price impact modal ([#5664](https://github.com/cowprotocol/cowswap/issues/5664)) ([8f50581](https://github.com/cowprotocol/cowswap/commit/8f50581df40cedeb9e75b549a842b5afc61ea310))

## [1.23.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.22.0...ui-v1.23.0) (2025-03-27)


### Features

* move inside a popup "copy address" and "view details" ([#5532](https://github.com/cowprotocol/cowswap/issues/5532)) ([c060193](https://github.com/cowprotocol/cowswap/commit/c060193028b716b7ba062d55dbc5cac67a170031))

## [1.22.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.21.0...ui-v1.22.0) (2025-03-20)


### Features

* **bridge:** display tokens in selector from bridge provider ([#5489](https://github.com/cowprotocol/cowswap/issues/5489)) ([b5b08ee](https://github.com/cowprotocol/cowswap/commit/b5b08ee8da9c1746bd3b2147444c2090afdf3950))


### Bug Fixes

* Add custom token - Update update link ([a896981](https://github.com/cowprotocol/cowswap/commit/a8969814dd4ce72605b2c03d9fff44fba1ad2f9a))

## [1.21.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.20.0...ui-v1.21.0) (2025-03-10)


### Features

* **swap:** unificate swap widget with other trade widgets ([#5443](https://github.com/cowprotocol/cowswap/issues/5443)) ([f8d47da](https://github.com/cowprotocol/cowswap/commit/f8d47da493e0e6203fac3d1c6cc5abe2af1de403))

## [1.20.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.19.0...ui-v1.20.0) (2025-02-25)


### Features

* **analytics:** migrate to GTM-based analytics ([#5360](https://github.com/cowprotocol/cowswap/issues/5360)) ([f404d02](https://github.com/cowprotocol/cowswap/commit/f404d0280d9d1d86cc249d70852a5c0ec9827475))

## [1.19.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.18.0...ui-v1.19.0) (2025-02-05)


### Features

* **limit-orders:** upgrade and redesign ([#5249](https://github.com/cowprotocol/cowswap/issues/5249)) ([5c868bb](https://github.com/cowprotocol/cowswap/commit/5c868bb794d648363afb88371178ddc35deaf7a7))


### Bug Fixes

* **ui:** get rid of flickering in HelpTooltip ([#5324](https://github.com/cowprotocol/cowswap/issues/5324)) ([bd7cb03](https://github.com/cowprotocol/cowswap/commit/bd7cb032cf623f527cc042cf1cccc2315f3d6169))

## [1.18.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.17.1...ui-v1.18.0) (2025-01-09)


### Features

* **swap:** partial approve ([#5256](https://github.com/cowprotocol/cowswap/issues/5256)) ([f080ffd](https://github.com/cowprotocol/cowswap/commit/f080ffdb098612e729f3a3f829410ce78697979f))

## [1.17.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.17.0...ui-v1.17.1) (2024-12-23)


### Bug Fixes

* **snackbars:** stick snackbars widget to header menu ([4582d67](https://github.com/cowprotocol/cowswap/commit/4582d67156364fe1866a40227f76c8101d11e1bd))

## [1.17.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.16.0...ui-v1.17.0) (2024-12-18)


### Features

* add winter theme 🎅 ([#5213](https://github.com/cowprotocol/cowswap/issues/5213)) ([7db4b72](https://github.com/cowprotocol/cowswap/commit/7db4b72d54759394087e4c816dce9eeb6f282588))

## [1.16.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.15.0...ui-v1.16.0) (2024-12-11)


### Features

* **cow-fi:** upgrade project structure to /app ([#5167](https://github.com/cowprotocol/cowswap/issues/5167)) ([ed152f7](https://github.com/cowprotocol/cowswap/commit/ed152f7ac0fa62ab2c0b9c93035a551c3b8cb4b6))

## [1.15.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.14.0...ui-v1.15.0) (2024-12-03)


### Features

* **volume-fee:** add volume fee for Safe ([#5139](https://github.com/cowprotocol/cowswap/issues/5139)) ([bb14c6a](https://github.com/cowprotocol/cowswap/commit/bb14c6a6ecfaba7d1a9a1da5366fac054efb97aa))

## [1.14.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.13.0...ui-v1.14.0) (2024-11-21)


### Features

* refactor badge component and experimental icon ([#5102](https://github.com/cowprotocol/cowswap/issues/5102)) ([f642ce5](https://github.com/cowprotocol/cowswap/commit/f642ce5d5a8f2f81dbc72cb1d8942eaa8905bb3b))
* refactor trade container styles ([#5103](https://github.com/cowprotocol/cowswap/issues/5103)) ([29ab5c4](https://github.com/cowprotocol/cowswap/commit/29ab5c45971767716df2d048b87198ac1acb2c90))

## [1.13.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.12.0...ui-v1.13.0) (2024-11-06)


### Features

* **yield:** display pools info in widget ([#5046](https://github.com/cowprotocol/cowswap/issues/5046)) ([562d020](https://github.com/cowprotocol/cowswap/commit/562d0207d1acf4e1735c4b3f629ff63dd65d3725))

## [1.12.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.11.0...ui-v1.12.0) (2024-10-29)


### Features

* add vampire attack banner ([#4981](https://github.com/cowprotocol/cowswap/issues/4981)) ([5246046](https://github.com/cowprotocol/cowswap/commit/52460461d6cc80635a25aefe5b119dbd7de1fb69))
* **halloween:** add Halloween mode ([#5036](https://github.com/cowprotocol/cowswap/issues/5036)) ([791796d](https://github.com/cowprotocol/cowswap/commit/791796d139828f3dd0657222cbf98a5ce93ff321))
* setup vampire attack widget ([#4950](https://github.com/cowprotocol/cowswap/issues/4950)) ([99c4c42](https://github.com/cowprotocol/cowswap/commit/99c4c42aec60a734a37926935be5dca6cd4cf11c))

## [1.11.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.10.1...ui-v1.11.0) (2024-10-18)


### Features

* display new label for cow amm ([#4994](https://github.com/cowprotocol/cowswap/issues/4994)) ([531e63f](https://github.com/cowprotocol/cowswap/commit/531e63f666ffcafdaf8e2b1c2850991facbe5cf1))

## [1.10.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.10.0...ui-v1.10.1) (2024-10-10)


### Bug Fixes

* **tokens-selector:** fix tokens displaying on mobile view ([#4929](https://github.com/cowprotocol/cowswap/issues/4929)) ([f055957](https://github.com/cowprotocol/cowswap/commit/f055957af450967b4bc4d58a15fc7a7b80f0aa77))

## [1.10.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.9.0...ui-v1.10.0) (2024-09-30)


### Features

* **cow-fi:** lazy load cms images /learn/ pages ([#4906](https://github.com/cowprotocol/cowswap/issues/4906)) ([897ce91](https://github.com/cowprotocol/cowswap/commit/897ce91ca60a6b2d3823e6a002c3bf64c5384afe))
* **hooks-store:** import custom hook-dapps ([#4910](https://github.com/cowprotocol/cowswap/issues/4910)) ([5847017](https://github.com/cowprotocol/cowswap/commit/584701715500525365475660732edb6bbf7ba396))
* **hooks-store:** style hook store ([#4905](https://github.com/cowprotocol/cowswap/issues/4905)) ([9fca0d9](https://github.com/cowprotocol/cowswap/commit/9fca0d9e9fac5715d3d05eb1c1fe234083af03fc))

## [1.9.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.8.1...ui-v1.9.0) (2024-09-17)


### Features

* **hooks-store:** new design & refactoring ([#4859](https://github.com/cowprotocol/cowswap/issues/4859)) ([1b989fa](https://github.com/cowprotocol/cowswap/commit/1b989fa037b276d507adfa0462129ab53fe2ac6d))
* menu logic ([#4892](https://github.com/cowprotocol/cowswap/issues/4892)) ([8fee64e](https://github.com/cowprotocol/cowswap/commit/8fee64eb8bdf41a9da456adf04adadf372f8efb6))

## [1.8.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.8.0...ui-v1.8.1) (2024-09-05)


### Bug Fixes

* **progress-bar:** fix styling issues ([#4841](https://github.com/cowprotocol/cowswap/issues/4841)) ([083d489](https://github.com/cowprotocol/cowswap/commit/083d489198033516d58e769075707d42e4fcaedc))

## [1.8.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.7.1...ui-v1.8.0) (2024-08-27)


### Features

* **progress-bar-v2:** replace progress bar with v2 ([#4033](https://github.com/cowprotocol/cowswap/issues/4033)) ([e199bff](https://github.com/cowprotocol/cowswap/commit/e199bff492ad3f91df23be34a829ebe1f246444a))

## [1.7.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.7.0...ui-v1.7.1) (2024-08-14)


### Bug Fixes

* cancel modal does not pop-up when press on Cancel button in mobile view ([#4757](https://github.com/cowprotocol/cowswap/issues/4757)) ([f84d6b5](https://github.com/cowprotocol/cowswap/commit/f84d6b5cfe0710e33c02a692bf7f8b1e2464eb06))
* total surplus tooltip cannot be open in iOS mobile device ([#4756](https://github.com/cowprotocol/cowswap/issues/4756)) ([22ca5e0](https://github.com/cowprotocol/cowswap/commit/22ca5e0a9aa156e124cf6c34858e90c65cb0175c))

## [1.7.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.6.0...ui-v1.7.0) (2024-07-18)


### Features

* refactor and untangle analytics ([#4718](https://github.com/cowprotocol/cowswap/issues/4718)) ([ee396eb](https://github.com/cowprotocol/cowswap/commit/ee396eb1c4ef9a786810ed20b20020b4cb986460))

## [1.6.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.5.0...ui-v1.6.0) (2024-07-12)


### Features

* explorer app cleanup ([#4625](https://github.com/cowprotocol/cowswap/issues/4625)) ([4148b0a](https://github.com/cowprotocol/cowswap/commit/4148b0a2f8e33d0b5d2c09a0f5eeacdb8d4eb66a))


### Bug Fixes

* **explorer:** fix almost filled orders on Explorer ([#4650](https://github.com/cowprotocol/cowswap/issues/4650)) ([fb4f593](https://github.com/cowprotocol/cowswap/commit/fb4f593d8a30f6fe3834d298178994aa9af3abf5))

## [1.5.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.4.1...ui-v1.5.0) (2024-06-25)


### Features

* update brand kit link ([#4610](https://github.com/cowprotocol/cowswap/issues/4610)) ([319ab7e](https://github.com/cowprotocol/cowswap/commit/319ab7ebc3cf581684584d3ddbf57f7b9d4f1aec))
* update cow-swap url footer ([#4609](https://github.com/cowprotocol/cowswap/issues/4609)) ([8e0ae31](https://github.com/cowprotocol/cowswap/commit/8e0ae31a5e6074e94f62487dcc0fffe7bf26ef60))

## [1.4.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.4.0...ui-v1.4.1) (2024-06-25)


### Bug Fixes

* improve UI responsiveness ([#4593](https://github.com/cowprotocol/cowswap/issues/4593)) ([2ba1492](https://github.com/cowprotocol/cowswap/commit/2ba14925c590b5939d26658543c16a512fff7bf1))

## [1.4.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.3.0...ui-v1.4.0) (2024-06-24)


### Features

* **explorer:** truncated orderId with CSS ([#4557](https://github.com/cowprotocol/cowswap/issues/4557)) ([88b5c06](https://github.com/cowprotocol/cowswap/commit/88b5c061beefdf7866a39a84a940ea01715e9c0b))
* **rebranding:** merge 📦 Big Package "Re-branding" 📦  ([#4543](https://github.com/cowprotocol/cowswap/issues/4543)) ([ce9ab43](https://github.com/cowprotocol/cowswap/commit/ce9ab4317f304c86e3e1ec37825379e427099518))
* theme unification and cleaning ([#4580](https://github.com/cowprotocol/cowswap/issues/4580)) ([c1538b1](https://github.com/cowprotocol/cowswap/commit/c1538b16d9c890c95d73ea92ffb93b2065233d90))


### Bug Fixes

* **rebranding:** polish UI ([#4581](https://github.com/cowprotocol/cowswap/issues/4581)) ([a038458](https://github.com/cowprotocol/cowswap/commit/a038458a23d91fb9b624679950ee6492a966ccba))

## [1.3.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.2.1...ui-v1.3.0) (2024-06-18)


### Features

* **limit-orders:** allow partner fee (variant B) ([#4467](https://github.com/cowprotocol/cowswap/issues/4467)) ([72d9af8](https://github.com/cowprotocol/cowswap/commit/72d9af8869618e8f12aa2170326cf18b35db786a))

## [1.2.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.2.0...ui-v1.2.1) (2024-05-29)


### Bug Fixes

* **explorer:** adjust almost fully filled orders displaying ([#4482](https://github.com/cowprotocol/cowswap/issues/4482)) ([3a5d654](https://github.com/cowprotocol/cowswap/commit/3a5d65484ab8818f5a5ba6aa18e6519243f686ee))
* fix safe read-only button tooltip ([#4475](https://github.com/cowprotocol/cowswap/issues/4475)) ([f33a1eb](https://github.com/cowprotocol/cowswap/commit/f33a1ebb5eb347e62deca26211a7779f41db63df))

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.1.0...ui-v1.2.0) (2024-05-02)


### Features

* **cms:** markup Category page and display all articles ([#4334](https://github.com/cowprotocol/cowswap/issues/4334)) ([57a9657](https://github.com/cowprotocol/cowswap/commit/57a965717ec5f5d7058b3ff23963256206744a22))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/ui-v1.0.2...ui-v1.1.0) (2024-05-01)


### Features

* allow to modify the label of the fee and its tooltip ([a5dd0ba](https://github.com/cowprotocol/cowswap/commit/a5dd0baf19e6831fc135dd6c089e66ea0edd14f4))
* delay closing and allow user to hover on it to click on a link or copy text ([1d984cf](https://github.com/cowprotocol/cowswap/commit/1d984cf1ab5e668784820fc3d63235febc008d56))
* hide tooltips on scroll ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* improve UX for tooltips on mobile ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))
* **tooltip:** make tooltips sticky ([#4330](https://github.com/cowprotocol/cowswap/issues/4330)) ([e2d815b](https://github.com/cowprotocol/cowswap/commit/e2d815b1a4864dbb8cf8589dce4e4032ef533209))
* unify all tooltips so the behavior is coherent ([8d68cb1](https://github.com/cowprotocol/cowswap/commit/8d68cb1a8e58a9d8fd1dffc57143828c55e3222e))

## [1.0.2](https://github.com/cowprotocol/cowswap/compare/ui-v1.0.1...ui-v1.0.2) (2024-04-18)

### Bug Fixes

* long token names ([#4235](https://github.com/cowprotocol/cowswap/issues/4235)) ([45e1a88](https://github.com/cowprotocol/cowswap/commit/45e1a88754ba55c6481c1eb4c230102067f0696a))
* style select dropdown background ([#4231](https://github.com/cowprotocol/cowswap/issues/4231)) ([a764f7a](https://github.com/cowprotocol/cowswap/commit/a764f7ae5e25d3c59884ef043e31e67e56f64216))
* **trade:** take time offset into account for quote and order validTo ([#4236](https://github.com/cowprotocol/cowswap/issues/4236)) ([7184ad4](https://github.com/cowprotocol/cowswap/commit/7184ad4655c3ae74fde084e306426fc49a11a360))

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/ui-v1.0.0...ui-v1.0.1) (2024-04-02)

### Bug Fixes

* **april-fools:** revert april fools ([#4116](https://github.com/cowprotocol/cowswap/issues/4116)) ([c8fb7d1](https://github.com/cowprotocol/cowswap/commit/c8fb7d1cb124f154e1b317c3e6fd503a65a12336))

## 1.0.0 (2024-03-29)

### Features

* **april-fools:** add `I'm Feeling Lucky` ([#4094](https://github.com/cowprotocol/cowswap/issues/4094)) ([895991b](https://github.com/cowprotocol/cowswap/commit/895991bbdaa6fb496483a8c369b1b0f445828db5))
* **limit:** allow limit orders without balance ([#3742](https://github.com/cowprotocol/cowswap/issues/3742)) ([9c69a01](https://github.com/cowprotocol/cowswap/commit/9c69a011d4575a370eda9ae5bb11538cc9f2ac93))
* progress ([#3915](https://github.com/cowprotocol/cowswap/issues/3915)) ([2eaafef](https://github.com/cowprotocol/cowswap/commit/2eaafef7e2cf93071d9a5f6f27af4e27615d29a6))
* style improvements ([#3884](https://github.com/cowprotocol/cowswap/issues/3884)) ([f4d5e17](https://github.com/cowprotocol/cowswap/commit/f4d5e175df0b8090ec68f83af607e3ae407c64e2))
* **trade:** update trade confirm modal design ([#3750](https://github.com/cowprotocol/cowswap/issues/3750)) ([43660e4](https://github.com/cowprotocol/cowswap/commit/43660e4eed07f855562d7250c9d0d359591add59))
* **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))

### Bug Fixes

* **order-receipt:** fix recreate order button style ([#4019](https://github.com/cowprotocol/cowswap/issues/4019)) ([e023d65](https://github.com/cowprotocol/cowswap/commit/e023d653c6f063232926aaeb83e12dc428acfd39))
* rebrand fee labels and improve tooltips ([#4005](https://github.com/cowprotocol/cowswap/issues/4005)) ([6488f52](https://github.com/cowprotocol/cowswap/commit/6488f52cf84604aae3a63320eee55d5768ef566c))
