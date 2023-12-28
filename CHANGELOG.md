# Changelog

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
