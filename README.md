[![Tests](https://github.com/cowprotocol/cowswap/workflows/CI/badge.svg)](https://github.com/cowprotocol/cowswap/actions/workflows/ci.yml?query=workflow%3ACI)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

CoW Swap is the first trading interface built on top of CoW Protocol.

It allows you to buy and sell tokens using gasless orders that are settled peer-to-peer among its users or into any on-chain liquidity source while providing MEV protection.

- 🐮**Official Website**🐮: <https://swap.cow.fi/>

  - The website can also be run locally, or from IPFS. Every release will have an IPFS hash associated, available in the [Releases](https://github.com/cowprotocol/cowswap/releases) section.

- Protocol: <https://cow.fi>
- Docs: <https://docs.cow.fi>
- Stats: <https://dune.com/cowprotocol/cowswap>
- Twitter: [@CoWSwap](https://twitter.com/CoWSwap)
- Discord: <https://discord.com/invite/cowprotocol>

Please see the:

- [CoW Protocol: Smart contracts](https://github.com/cowprotocol/contracts)
- [CoW Protocol: Services](https://github.com/cowprotocol/services)

# 🐮 Run CoW Swap

First install Dependencies:

```bash
yarn
```

## Run

```bash
# You will be able to open CoW Swap in http://localhost:3000
yarn start
```

## Build

```bash
yarn build
```

## Unit testing

```bash
yarn test
```

# 🖼️ Widget

This will start the widget configurator:

```bash
yarn start:widget
```

# 🌌 Cosmos UI Library

This will start a server on the `http://localhost:5000/`

```bash
yarn run cosmos
```

# 🤓 Development

## Integration test

> Make sure you add the required environment varianbles to your `.env.local` file with:
>
> - `INTEGRATION_TEST_PRIVATE_KEY=<your-private-key>`: Private key
> - `INTEGRATION_TESTS_INFURA_KEY=<your-infura-key>`: Infura key

To launch it with our development server (so you have live-reloading):

```bash
yarn start
yarn cypress
```

Alternatively, you can build the project and launch the integration test.

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

## Build/test UI Library

CoW Swap has a library of reusable components.

```bash
yarn ui:build
yarn ui:test
```

## Build

```bash
yarn build
```

Analyze CoW Swap bundle:

```bash
# Use one of the following templates: "sunburst" | "treemap" | "network" | "raw-data" | "list";
ANALYZE_BUNDLE=true ANALYZE_BUNDLE_TEMPLATE=sunburst yarn build
```

# ⚙️ Configuration

## RPC Endpoints

You should set your own RPC endpoints.

One simple way to do this, is by defining your own `REACT_APP_INFURA_KEY` environment var.

Alternatively you can define the RPC URLs directly with the following environment variables:

- `REACT_APP_NETWORK_URL_1`
- `REACT_APP_NETWORK_URL_5`
- `REACT_APP_NETWORK_URL_100`

Additionally, if you plan to run the E22 / Integration tests locally you must have define:

- `INTEGRATION_TESTS_INFURA_KEY`=YOUR_INFURA_KEY
- `INTEGRATION_TESTS_PRIVATE_KEY`=YOUR_TEST_WALLET_PRIVATE_KEY

### API endpoints

Fee quote requests and posting orders are sent to an API. This API has the responsibility of collecting orders and
handing them to the solvers.

The reference implementation of the API is [gp-v2-services](https://github.com/cowprotocol/services).

The API endpoint is configured using the environment variable ` {XDAI|GOERLI|MAINNET}` to e.g. `"http://localhost:8080/api"` when running the services locally.

## Price feeds

CoW Swap tries to find the best price available on-chain using some price feeds.

All price feeds are enabled by default, but they can be individually disabled by using an environment variable:

| Name             | Environment variable                 | Type                         | Description                                                                           |
| ---------------- | ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------- |
| **CoW Protocol** | `REACT_APP_PRICE_FEED_GP_ENABLED`    | `boolean` (default = `true`) | [CoW Protocol](https://docs.cow.fi/) price estimation. Used for all price estimation. |
| **1inch**        | `REACT_APP_PRICE_FEED_1INCH_ENABLED` | `boolean` (default = `true`) | [Paraswap](https://1inch.exchange) price estimation. Used for all price estimations.  |
| **0x**           | `REACT_APP_PRICE_FEED_0X_ENABLED`    | `boolean` (default = `true`) | [0x](https://0x.org/) price estimation. Used for all price estimation.                |

## Metadata attached to orders (AppData)

The app will attach some metadata to all orders.

This metadata will be sent to the smart contract as a hexadecimal value in an order field called `AppData`. This value comes from hashing the content of a metadata JSON containing some information about the trade (using `keccak256` on the `UTF-8` bytes).

The format of the JSON follows this typescript format: <src/utils/metadata.ts>

To set your own `AppData`, change `REACT_APP_FULL_APP_DATA_<environment>` environment variable. For more details, check out the environment file (<.env>)

# 🔎 SEO

## Sitemap

The sitemap can be found in <./public/sitemap.xml>

To update its content:

1. Edit the list of pages in <./src/sitemap.js>
2. Run `yarn sitemap`
3. Commit the changes to git

# 🔫 Troubleshooting

## Service worker

In case of problems with the service worker cache you force a reset using [emergency.js](apps/cowswap-frontend/public/emergency.js)
The plan:

1. `const resetCacheInCaseOfEmergency = false` - change `false` to `true`
2. Deploy a new version to production

`emergency.js` is not cached by browser and loaded before all.

# 📚 Technical Documentation

1. [Oveall Architecture](docs/architecture-overview.md)
2. [Amounts formatting](apps/cowswap-frontend/src/utils/amountFormat/README.md)
3. [ABIs](libs/abis/README.md)
