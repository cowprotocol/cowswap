[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/gnosis/gp-swap-ui)

<p align="center">
  <img width="400" src="docs/images/logo-cow-swap.png">
</p>

[![Lint](https://github.com/gnosis/dex-swap/workflows/Lint/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ALint)
[![Tests](https://github.com/gnosis/dex-swap/workflows/Tests/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ATests)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source fork of Uniswap to Swap in Gnosis Protocol v2 -- a protocol for decentralized exchange of Ethereum tokens.

- 🐮**Official Website**🐮: <https://cowswap.exchange/>
    * ENS Website (alternative): <https://cowswap.eth.link>, or <https://cowswap.eth/> if you have MetaMask or an ENS compatible browser.
    * The website can also be run locally, or from IPFS. Every release will have an IPFS hash associated, available in the [Releases](https://github.com/gnosis/gp-swap-ui/releases) section.

- Twitter: [@gnosisPM](https://twitter.com/gnosisPM)
- Reddit: [/r/gnosisPM](https://www.reddit.com/r/gnosisPM)
- Discord: [Gnosis Protocol Channel](https://discord.gg/egGzDDctuC)

Please see the:

- [Gnosis Protocol: Smart contracts](https://github.com/gnosis/gp-v2-contracts)
- [Gnosis Protocol: Services](https://github.com/gnosis/gp-v2-services)

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Unit testing

```bash
yarn test
```

### Integration test

Normally:

```bash
yarn build
yarn integration-test
```

If we want to use the Cypress UI:

```bash
yarn build
yarn serve
yarn cypress
```

If we want to use the Cypress UI, and live reloading on the web app:

```bash
yarn start:default
yarn cypress
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`. This will be your default network id
3. Define your own list of supported networks:

```ini
REACT_APP_SUPPORTED_CHAIN_IDS="1,4,100"
REACT_APP_NETWORK_URL_1=https://mainnet.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_4=https://rinkeby.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_100=https://rpc.xdaichain.com
```

4. Change `REACT_APP_ID` Ask for your id at [chat.gnosis.io](https://chat.gnosis.io)
5. Change `REACT_APP_API_STAGING_URL_{XDAI|RINKEBY|MAINNET}` to e.g. `"http://localhost:8080/api"` when running the services locally.

For production:

6. Get your own `App Id` in <https://discord.gg/egGzDDctuC>, and set it in `REACT_APP_ID`.
