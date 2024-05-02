# Changelog

## [0.11.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.10.1...widget-lib-v0.11.0) (2024-05-01)


### Features

* allow to modify the label of the fee and its tooltip ([a5dd0ba](https://github.com/cowprotocol/cowswap/commit/a5dd0baf19e6831fc135dd6c089e66ea0edd14f4))

## [0.10.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.10.0...widget-lib-v0.10.1) (2024-04-23)


### Bug Fixes

* **widget:** ignore self-fired events in Safe sdk bridge ([#4271](https://github.com/cowprotocol/cowswap/issues/4271)) ([b11eab7](https://github.com/cowprotocol/cowswap/commit/b11eab7ad5dff65bee8ffa2be8aef2fa913af5f2))

## [0.10.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.9.0...widget-lib-v0.10.0) (2024-04-15)


### Features

* add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
* Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))
* up events lib version ([#4083](https://github.com/cowprotocol/cowswap/issues/4083)) ([02dbb0b](https://github.com/cowprotocol/cowswap/commit/02dbb0ba6f9f68a333a2fa2b78a961df4f301e36))
* update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
* **widget:** add parametrization for sounds, images, and disabling/hiding features ([#3815](https://github.com/cowprotocol/cowswap/issues/3815)) ([4a6c461](https://github.com/cowprotocol/cowswap/commit/4a6c46133c98bdcffa5ebcfc66cde3bd85b23d9f))
* **widget:** create an iframe event emitter ([#3821](https://github.com/cowprotocol/cowswap/issues/3821)) ([d9d1f23](https://github.com/cowprotocol/cowswap/commit/d9d1f23c1bf90a277a0d559c019b9794e43d8162))
* **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))
* **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
* **widget:** emit post order events ([#3819](https://github.com/cowprotocol/cowswap/issues/3819)) ([0df62ec](https://github.com/cowprotocol/cowswap/commit/0df62ec3679da1841e07f85292a5de5faab74cab))
* **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))
* **widget:** follow ups on issues raised ([#3840](https://github.com/cowprotocol/cowswap/issues/3840)) ([b1d621f](https://github.com/cowprotocol/cowswap/commit/b1d621f98fb1ec807b1ce5360e1f4d3d9cc50f4e))
* **widget:** implement all listeners and fix types ([#3817](https://github.com/cowprotocol/cowswap/issues/3817)) ([11a7226](https://github.com/cowprotocol/cowswap/commit/11a7226a5d3811139e784fe668ee2eebf2167a38))
* **widget:** improve JSON-RPC bridging between iFrame and provider ([#3824](https://github.com/cowprotocol/cowswap/issues/3824)) ([e9652e5](https://github.com/cowprotocol/cowswap/commit/e9652e5835d2c3ca0203349d4eae5b5874891cfc))
* **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))
* **widget:** misc to address issues and comments ([#3827](https://github.com/cowprotocol/cowswap/issues/3827)) ([ef83a5a](https://github.com/cowprotocol/cowswap/commit/ef83a5ad520d072ebf4f2cccde5fcfd0c1d88cd2))
* **widget:** optimise widget updates ([#3822](https://github.com/cowprotocol/cowswap/issues/3822)) ([d1a1e7d](https://github.com/cowprotocol/cowswap/commit/d1a1e7d05a1fed94dece9afbbc65f43af1a4f748))
* **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
* **widget:** subscribe to cow events (from iframe) ([#3816](https://github.com/cowprotocol/cowswap/issues/3816)) ([c3b8104](https://github.com/cowprotocol/cowswap/commit/c3b810435a6e64b12d28aac12cf785eef52f6531))
* **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
* **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))


### Bug Fixes

* update widget-lib readme ([#4090](https://github.com/cowprotocol/cowswap/issues/4090)) ([014e321](https://github.com/cowprotocol/cowswap/commit/014e3210e4195c75a02f8a5e330b98d41a74149c))
* **widget:** call disconnect when destroying the widget ([#4181](https://github.com/cowprotocol/cowswap/issues/4181)) ([93a460a](https://github.com/cowprotocol/cowswap/commit/93a460a0082bc7039dea3cc5c376cc2038917966))
* **widget:** don't reset palette state while navigating ([#4239](https://github.com/cowprotocol/cowswap/issues/4239)) ([b963bc3](https://github.com/cowprotocol/cowswap/commit/b963bc32739084e729320c49c50f51e8aed86616))
* **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))

## [0.9.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.7.1...widget-lib-v0.9.0) (2024-04-11)

### Features

- **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
- **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
- **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
- **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))

### Bug Fixes

- **widget:** call disconnect when destroying the widget ([#4181](https://github.com/cowprotocol/cowswap/issues/4181)) ([93a460a](https://github.com/cowprotocol/cowswap/commit/93a460a0082bc7039dea3cc5c376cc2038917966))

## [0.7.1](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.7.0...widget-lib-v0.7.1) (2024-03-22)

### Bug Fixes

- update widget-lib readme ([#4090](https://github.com/cowprotocol/cowswap/issues/4090)) ([014e321](https://github.com/cowprotocol/cowswap/commit/014e3210e4195c75a02f8a5e330b98d41a74149c))

## [0.7.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.6.0...widget-lib-v0.7.0) (2024-03-22)

### Features

- up events lib version ([#4083](https://github.com/cowprotocol/cowswap/issues/4083)) ([02dbb0b](https://github.com/cowprotocol/cowswap/commit/02dbb0ba6f9f68a333a2fa2b78a961df4f301e36))

## [0.6.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.5.0...widget-lib-v0.6.0) (2024-03-12)

### Features

- add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
- Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))

## [0.5.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.4.0...widget-lib-v0.5.0) (2024-02-22)

### Features

- **widget:** add parametrization for sounds, images, and disabling/hiding features ([#3815](https://github.com/cowprotocol/cowswap/issues/3815)) ([4a6c461](https://github.com/cowprotocol/cowswap/commit/4a6c46133c98bdcffa5ebcfc66cde3bd85b23d9f))
- **widget:** create an iframe event emitter ([#3821](https://github.com/cowprotocol/cowswap/issues/3821)) ([d9d1f23](https://github.com/cowprotocol/cowswap/commit/d9d1f23c1bf90a277a0d559c019b9794e43d8162))
- **widget:** emit post order events ([#3819](https://github.com/cowprotocol/cowswap/issues/3819)) ([0df62ec](https://github.com/cowprotocol/cowswap/commit/0df62ec3679da1841e07f85292a5de5faab74cab))
- **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))
- **widget:** follow ups on issues raised ([#3840](https://github.com/cowprotocol/cowswap/issues/3840)) ([b1d621f](https://github.com/cowprotocol/cowswap/commit/b1d621f98fb1ec807b1ce5360e1f4d3d9cc50f4e))
- **widget:** implement all listeners and fix types ([#3817](https://github.com/cowprotocol/cowswap/issues/3817)) ([11a7226](https://github.com/cowprotocol/cowswap/commit/11a7226a5d3811139e784fe668ee2eebf2167a38))
- **widget:** improve JSON-RPC bridging between iFrame and provider ([#3824](https://github.com/cowprotocol/cowswap/issues/3824)) ([e9652e5](https://github.com/cowprotocol/cowswap/commit/e9652e5835d2c3ca0203349d4eae5b5874891cfc))
- **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))
- **widget:** misc to address issues and comments ([#3827](https://github.com/cowprotocol/cowswap/issues/3827)) ([ef83a5a](https://github.com/cowprotocol/cowswap/commit/ef83a5ad520d072ebf4f2cccde5fcfd0c1d88cd2))
- **widget:** optimise widget updates ([#3822](https://github.com/cowprotocol/cowswap/issues/3822)) ([d1a1e7d](https://github.com/cowprotocol/cowswap/commit/d1a1e7d05a1fed94dece9afbbc65f43af1a4f748))
- **widget:** subscribe to cow events (from iframe) ([#3816](https://github.com/cowprotocol/cowswap/issues/3816)) ([c3b8104](https://github.com/cowprotocol/cowswap/commit/c3b810435a6e64b12d28aac12cf785eef52f6531))

## [0.4.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.3.0...widget-lib-v0.4.0) (2024-02-01)

### Features

- remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))

## [0.3.0](https://github.com/cowprotocol/cowswap/compare/widget-lib-v0.2.1...widget-lib-v0.3.0) (2024-01-17)

### Features

- update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
- **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))

### Bug Fixes

- **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))
