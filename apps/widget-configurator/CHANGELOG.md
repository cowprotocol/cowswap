# Changelog

## [1.2.0](https://github.com/cowprotocol/cowswap/compare/widget-configurator-v1.1.0...widget-configurator-v1.2.0) (2024-05-02)


### Features

* **widget-cfg:** update web3modal ([#4272](https://github.com/cowprotocol/cowswap/issues/4272)) ([badb43b](https://github.com/cowprotocol/cowswap/commit/badb43bda3e4d361c381c55ab3d373c7cced3f2c))


### Bug Fixes

* **widget:** fix modals displaying ([#4308](https://github.com/cowprotocol/cowswap/issues/4308)) ([2750b2f](https://github.com/cowprotocol/cowswap/commit/2750b2fd6c848ced889cef2d3ce16bf59f77afcb))

## [1.1.0](https://github.com/cowprotocol/cowswap/compare/widget-configurator-v1.0.2...widget-configurator-v1.1.0) (2024-04-11)


### Features

* make widget to use all space ([#4197](https://github.com/cowprotocol/cowswap/issues/4197)) ([3ab6cb9](https://github.com/cowprotocol/cowswap/commit/3ab6cb98f03e571670031248af9419f301bbdaf8))
* **widget:** customize images ([#4159](https://github.com/cowprotocol/cowswap/issues/4159)) ([0b14b2b](https://github.com/cowprotocol/cowswap/commit/0b14b2b19279a1688f75dc4f2954b8c267e57c40))
* **widget:** option to disable sounds ([#4172](https://github.com/cowprotocol/cowswap/issues/4172)) ([a1d330d](https://github.com/cowprotocol/cowswap/commit/a1d330d46620d3724bb97fb03a07e9080966c1e4))
* **widget:** option to hide safe banner ([#4175](https://github.com/cowprotocol/cowswap/issues/4175)) ([84108f4](https://github.com/cowprotocol/cowswap/commit/84108f4362333f8638d8da7c4ad4849d9f5a796c))
* **widget:** use custom sounds in widget ([#4162](https://github.com/cowprotocol/cowswap/issues/4162)) ([0dfd679](https://github.com/cowprotocol/cowswap/commit/0dfd67946a1ed383a5ffeeadee3044e45bd92eb0))
* **widget:** use custom tokens as virtual list ([#4164](https://github.com/cowprotocol/cowswap/issues/4164)) ([8424a33](https://github.com/cowprotocol/cowswap/commit/8424a337f2ea2fd21cc3cb664d2f91facace00fb))
* **widget:** use theme colors from URL ([#4188](https://github.com/cowprotocol/cowswap/issues/4188)) ([1623b37](https://github.com/cowprotocol/cowswap/commit/1623b37a1b50499473cf82a7aa0dd8f73f63a415))


### Bug Fixes

* do not accept negative numbers for fee ([#4218](https://github.com/cowprotocol/cowswap/issues/4218)) ([1c70d13](https://github.com/cowprotocol/cowswap/commit/1c70d1349d4b656127bbae571795dda629f7fdf9))
* **widget-cfg:** hardcode partner fee recipient address ([#4195](https://github.com/cowprotocol/cowswap/issues/4195)) ([d4ad993](https://github.com/cowprotocol/cowswap/commit/d4ad993c39c28e99ec36f326faac56fab6643ad6))
* **widget:** send trade params to widget integrator ([#4196](https://github.com/cowprotocol/cowswap/issues/4196)) ([0036a6b](https://github.com/cowprotocol/cowswap/commit/0036a6b3cd8ac8015a4271ea3477232d1a4e180d))

## [1.0.2](https://github.com/cowprotocol/cowswap/compare/widget-configurator-v1.0.1...widget-configurator-v1.0.2) (2024-04-03)


### Bug Fixes

* **widget:** update widget code snippets ([#4144](https://github.com/cowprotocol/cowswap/issues/4144)) ([4734af2](https://github.com/cowprotocol/cowswap/commit/4734af27d089112478439604fd66d1968db59021))

## [1.0.1](https://github.com/cowprotocol/cowswap/compare/widget-configurator-v1.0.0...widget-configurator-v1.0.1) (2024-04-02)


### Bug Fixes

* **widget:** update snippets corresponding to the code ([#4136](https://github.com/cowprotocol/cowswap/issues/4136)) ([a7e400e](https://github.com/cowprotocol/cowswap/commit/a7e400e5d9b4fa639854743785eb837b045bfecc))

## 1.0.0 (2024-03-29)


### Features

* add configuration option to disable Toasts ([3177f08](https://github.com/cowprotocol/cowswap/commit/3177f089e162ec5515c1bcebe6c4a4d9d7987cde))
* add dapp mode to widget ([#3912](https://github.com/cowprotocol/cowswap/issues/3912)) ([d963d23](https://github.com/cowprotocol/cowswap/commit/d963d23a9b5f3f10049dfa091f181fddb40707ea))
* add option to define the base URL for the widget ([#3991](https://github.com/cowprotocol/cowswap/issues/3991)) ([6b70572](https://github.com/cowprotocol/cowswap/commit/6b7057239c137b6b80f8277fdda7d8b06a5b2ed0))
* **events:** fire on-chain transactions events ([#4045](https://github.com/cowprotocol/cowswap/issues/4045)) ([362b937](https://github.com/cowprotocol/cowswap/commit/362b9371e8d0ad09ea5501e5a58608c28eb5cf43))
* Introduce partner fee ([#3913](https://github.com/cowprotocol/cowswap/issues/3913)) ([dbae7ed](https://github.com/cowprotocol/cowswap/commit/dbae7ed38b690b538d9fbd50e13d04bb199e3437))
* **partner-fee:** validate, display and sign order with partner fee ([#3941](https://github.com/cowprotocol/cowswap/issues/3941)) ([036f5d7](https://github.com/cowprotocol/cowswap/commit/036f5d7a06eb9d461101b28d917cc8eba3ec4fc2))
* remove goerli ([#3735](https://github.com/cowprotocol/cowswap/issues/3735)) ([2eaae50](https://github.com/cowprotocol/cowswap/commit/2eaae5063f1623d03328e4c2a0fb49c7799ff0a3))
* **token-lists:** limit token lists by 5000 tokens ([#3881](https://github.com/cowprotocol/cowswap/issues/3881)) ([d8a5816](https://github.com/cowprotocol/cowswap/commit/d8a581652fcca40fc8ec2f63e904855b616951c6))
* update docs/learn.cow.fi URLs ([#3611](https://github.com/cowprotocol/cowswap/issues/3611)) ([af0ff6b](https://github.com/cowprotocol/cowswap/commit/af0ff6b71de422e43aab987287f780d26a17ac73))
* **widget:** custom token lists in widget ([#3390](https://github.com/cowprotocol/cowswap/issues/3390)) ([7eabe06](https://github.com/cowprotocol/cowswap/commit/7eabe06d043703718d742809791eda555dff5058))
* **widget:** emit toast for posting orders ([#3837](https://github.com/cowprotocol/cowswap/issues/3837)) ([44749fc](https://github.com/cowprotocol/cowswap/commit/44749fc19a392bba0055c856b6990e354729f31a))
* **widget:** handle toast events in widget ([#4023](https://github.com/cowprotocol/cowswap/issues/4023)) ([4e6cd6e](https://github.com/cowprotocol/cowswap/commit/4e6cd6e76eb735f4e7ea78073cb88c5490c6198e))
* **widget:** implement all listeners and fix types ([#3817](https://github.com/cowprotocol/cowswap/issues/3817)) ([11a7226](https://github.com/cowprotocol/cowswap/commit/11a7226a5d3811139e784fe668ee2eebf2167a38))
* **widget:** let the host app be the one connecting ([#3846](https://github.com/cowprotocol/cowswap/issues/3846)) ([05a3321](https://github.com/cowprotocol/cowswap/commit/05a3321ede220e7c07dc41df2f2f706028fc4afb))
* **widget:** misc to address issues and comments ([#3827](https://github.com/cowprotocol/cowswap/issues/3827)) ([ef83a5a](https://github.com/cowprotocol/cowswap/commit/ef83a5ad520d072ebf4f2cccde5fcfd0c1d88cd2))
* **widget:** optimise widget updates ([#3822](https://github.com/cowprotocol/cowswap/issues/3822)) ([d1a1e7d](https://github.com/cowprotocol/cowswap/commit/d1a1e7d05a1fed94dece9afbbc65f43af1a4f748))


### Bug Fixes

* broken build ([#3844](https://github.com/cowprotocol/cowswap/issues/3844)) ([fe8fe9d](https://github.com/cowprotocol/cowswap/commit/fe8fe9d71e4e74f3388ed4ebec7be180f2961f94))
* don't load a big list by default ([77cf892](https://github.com/cowprotocol/cowswap/commit/77cf892f4a3b2e761f0371cdd498b56abbedf774))
* don't load a big list by default ([#3874](https://github.com/cowprotocol/cowswap/issues/3874)) ([301d476](https://github.com/cowprotocol/cowswap/commit/301d4763582a576c629169db825b73f377a74330))
* fix build ([828d661](https://github.com/cowprotocol/cowswap/commit/828d66166359d264788c48d1745a1a8124f50053))
* **widget:** simplify token lists config ([#3652](https://github.com/cowprotocol/cowswap/issues/3652)) ([08aacdb](https://github.com/cowprotocol/cowswap/commit/08aacdb09602f48408cfe132bb9e5440fd774063))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([025d223](https://github.com/cowprotocol/cowswap/commit/025d2238fd06e14d2bd471f73f02379e86ff94c1))
* **widget:** widget displaying and expanded colors panel ([#3854](https://github.com/cowprotocol/cowswap/issues/3854)) ([eed09c8](https://github.com/cowprotocol/cowswap/commit/eed09c81f941c5d5e11cc9daed92aaf0faa0922e))
