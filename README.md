[![Tests](https://github.com/cowprotocol/cowswap/workflows/CI/badge.svg)](https://github.com/cowprotocol/cowswap/actions/workflows/ci.yml?query=workflow%3ACI)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

CoW Swap is the first trading interface built on top of CoW Protocol.

It allows you to buy and sell tokens using gas-less orders that are settled peer-to-peer among its users or into any on-chain liquidity source while providing MEV protection.

- 🐮**Official Website**🐮: <https://swap.cow.fi/>

  - The website can also be run locally, or from IPFS. Every release will have an IPFS hash associated, available in the [Releases](https://github.com/cowprotocol/cowswap/releases) section.

- Protocol: <https://cow.fi>
- Docs: <https://docs.cow.fi>
- Stats: <https://dune.com/cowprotocol/Gnosis-Protocol-V2>
- Twitter: [@CoWSwap](https://twitter.com/CoWSwap)
- Discord: <https://discord.com/invite/cowprotocol>

Please see the:

- [CoW Protocol: Smart contracts](https://github.com/cowprotocol/contracts)
- [CoW Protocol: Services](https://github.com/cowprotocol/services)

You can block an entire list of tokens by passing in a tokenlist like [here](./src/constants/lists.ts) or you can block specific tokens by adding them to [unsupported.tokenlist.json](./src/constants/tokenLists/unsupported.tokenlist.json).

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

### Run cosmos

This will start a server on the `http://localhost:5000/`

```bash
yarn run cosmos
```

## Configuring the environment (optional)

The app has some default configuration, but it's highly encouraged to define your own.

### Local configuration

Make a copy of `.env` named `.env.local`, this will allow you to set your own configuration only in your local environment.

### Production configuration

Modify the environment variables in `.env.production`, or override them in build time.

### Price feeds

CoW Swap tries to find the best price available on-chain using some price feeds.

All price feeds are enabled by default, but they can be individually disabled by using an environment variable:

| Name             | Environment variable                     | Type                         | Description                                                                                                        |
| ---------------- | ---------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **CoW Protocol** | `REACT_APP_PRICE_FEED_GP_ENABLED`        | `boolean` (default = `true`) | [CoW Protocol](https://docs.cow.fi/) price estimation. Used for all price estimation.                              |
| **Paraswap**     | `REACT_APP_PRICE_FEED_PARASWAP_ENABLED`  | `boolean` (default = `true`) | [Paraswap](https://paraswap.io/) price estimation. Used for all price estimations.                                 |
| **0x**           | `REACT_APP_PRICE_FEED_0X_ENABLED`        | `boolean` (default = `true`) | [0x](https://0x.org/) price estimation. Used for all price estimation.                                             |
| **Coingecko**    | `REACT_APP_PRICE_FEED_COINGECKO_ENABLED` | `boolean` (default = `true`) | [Coingecko](coingecko.com) price estimation. Used only for USD estimations to calculate the slippage on the trade. |

### Metadata attached to orders (AppData)

The app will attach some metadata to all orders.

This metadata will be sent to the smart contract as a hexadecimal value in an order field called `AppData`. This value comes from hashing the content of a metadata JSON containing some information about the trade.

Any web app or client using CoW Protocol can upload to IPFS a metadata JSON and use the digest hex to attach that
information to the order.

For example, CoW Swap uploaded the file https://cloudflare-ipfs.com/ipfs/QmTDarZ47oek1miuRd8uuNCy5AFfjzQbWJ7348izx9N8wQ
which has the hexadecimal digest `0x487B02C558D729ABAF3ECF17881A4181E5BC2446429A0995142297E897B6EB37` (See
[CID Explorer](https://cid.ipfs.io/#QmTDarZ47oek1miuRd8uuNCy5AFfjzQbWJ7348izx9N8wQ) for more details).

The format of the JSON follows this typescript format: <src/custom/utils/metadata.ts>

To set your own `AppData`, change `REACT_APP_DOMAIN_REGEX_<environment>` environment variable. Ask for yours at [CoW Swap's Discord channel](https://discord.com/invite/cowprotocol/). For more details, check out the environment file (<.env>)

### Supported networks

You can change the supported networks and their RPC endpoint.

To have the interface default to a different network when a wallet is not connected:

1. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`. This will be your default network id
2. Define your own list of supported networks:

```ini
REACT_APP_SUPPORTED_CHAIN_IDS="1,100,5"
REACT_APP_NETWORK_URL_1=https://mainnet.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_5=https://goerli.infura.io/v3/{YOUR_INFURA_KEY}
REACT_APP_NETWORK_URL_100=https://rpc.gnosischain.com
```

### API endpoints

Fee quote requests and posting orders are sent to an API. This API has the responsibility of collecting orders and
handing them to the solvers.

The reference implementation of the API is [gp-v2-services](https://github.com/cowprotocol/services).

The API endpoint is configured using the environment variable ` {XDAI|GOERLI|MAINNET}` to e.g. `"http://localhost:8080/api"` when running the services locally.

### Wallet Connect bridge

Wallet Connect allows to connect the app to any [Wallet Connect supported wallet](https://walletconnect.org/wallets).

In order to do so, it uses a Websocket, that can be configured using: the env var `WALLET_CONNECT_BRIDGE`.

## Sitemap

The sitemap can be found in <./public/sitemap.xml>

To update its content:

1. Edit the list of pages in <./src/custom/sitemap.js>
2. Run `yarn sitemap`
3. Commit the changes to git

## Service worker

In case of problems with the service worker cache you force a reset using [emergency.js](public/emergency.js)
The plan:

1. `const resetCacheInCaseOfEmergency = false` - change `false` to `true`
2. Deploy a new version to production

`emergency.js` is not cached by browser and loaded before all.
