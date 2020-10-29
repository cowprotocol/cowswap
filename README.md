# OBA Swap

[![Lint](https://github.com/gnosis/dex-swap/workflows/Lint/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ALint)
[![Tests](https://github.com/gnosis/dex-swap/workflows/Tests/badge.svg)](https://github.com/gnosis/dex-swap/actions?query=workflow%3ATests)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source fork of Uniswap to Swap in Gnosis Protocol v2 -- a protocol for decentralized exchange of Ethereum tokens.

- Twitter: [@gnosisPM](https://twitter.com/gnosisPM)
- Reddit: [/r/gnosisPM](https://www.reddit.com/r/gnosisPM)
- Discord: [Gnosis](https://discord.com/invite/M39dTHQ)

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 
