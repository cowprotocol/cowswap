# Changelog

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
