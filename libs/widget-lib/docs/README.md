# CoW Swap Widget

Integrate the power of `CoW Swap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the
look and much more!

Create your own widget using the configurator https://widget.cow.fi

![Demo](./demo-preview.png)

## Install

```bash
yarn add @cowprotocol/widget-lib
```

```bash
npm install @cowprotocol/widget-lib
```

## Quick start

```typescript
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

// HTML element where the widget will be rendered
const widgetContainer = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  appCode: 'My Cool App', // Name of your app (max 50 characters)
  width: 600, // Width in pixels (or 100% to use all available space)
  height: 640,
  sell: { asset: 'DAI' }, // Sell token. Optionally add amount for sell orders
  buy: { asset: 'USDC', amount: '0.1' }, // Buy token. Optionally add amount for buy orders
}

cowSwapWidget(widgetContainer, params)
```

## App Code

You must specify the `appCode` parameter when initializing the widget. This parameter is used to identify the source of
orders.

The key must be a UTF8 string of up to `50 chars`.

It will be a part of orders meta-data, see more in
the [CoW Protocol Docs](https://docs.cow.fi/front-end/creating-app-ids/create-the-order-meta-data-file/appcode).

## Interface fee

> **Coming soon! Fill [this form](https://cowprotocol.typeform.com/to/rONXaxHV) if you are interested**

You can add a additional trading fee that will be displayed and applied to the quoted amounts:

```typescript
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

const widgetContainer = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  interfaceFeeBips: '50', // 0.5%
}

cowSwapWidget(widgetContainer, params)
```

## Wallet provider

You can pass the wallet provider from your application to seamlessly use the widget as part of your application.
Also, you can not specify the provider, in this case the widget will work in standalone mode with the ability to connect
any wallet supported in CoW Swap.

A provider must comply with [EIP-1193](https://eips.ethereum.org/EIPS/eip-11930) and implement the interface:

```typescript
interface EthereumProvider {
  on(event: string, args: unknown): void

  request<T>(params: JsonRpcRequest): Promise<T>

  enable(): Promise<void>
}

interface JsonRpcRequest {
  id: number
  method: string
  params: unknown[]
}
```

An example of connecting a widget to Rabby Wallet or Metamask:

```typescript
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

cowSwapWidget(document.getElementById('cowswap-widget'), {
  provider: window.ethereum, // <-------
})
```

## Configuration

### `CowSwapWidgetParams`

> All params except `appCode` are optional:

| Parameter             | Type                   | Default              | Description                                                                                                                                                                                    |
| --------------------- | ---------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appCode`             | `string`               | No default. Required | Name of your app (max 50 characters, e.g. "My Cool App"). Fill [this form](https://cowprotocol.typeform.com/to/rONXaxHV) after you pick yours                                                  |
| `width`               | `string`               | 450px                | Width in pixels (or 100% to use all available space).                                                                                                                                          |
| `height`              | `string`               | 640px                | Height of the widget in css values (px, vh, etc.).                                                                                                                                             |
| `provider`            | `EthereumProvider`     | ---                  | Ethereum EIP-1193 provider to connect to the wallet. For a quick test, you can pass `window.ethereum`. You also might like to use https://web3modal.com                                        |
| `chainId`             | `number`               | 1                    | The blockchain ID on which the trade will take place. Currently supported: 1 (Mainnet), 5 (Goerli), 100 (Gnosis chain)                                                                         |
| `tradeType`           | `TradeType`            | 'swap'               | The type of trade. Can be `swap` or `limit` or `advanced`.                                                                                                                                     |
| `env`                 | `CowSwapWidgetEnv`     | 'prod'               | The environment of the widget (`local` , `prod` , `dev` , `pr`). See [`COWSWAP_URLS`](https://github.com/cowprotocol/cowswap/blob/develop/libs/widget-lib/src/consts.ts) const value for urls. |
| `sell`                | `TradeAsset`           | undefined            | Sell token and optionally the sell order amount. Example: `{ asset: 'WBTC', amount: 12 }` or `{ asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }`                                         |
| `buy`                 | `TradeAsset`           | undefined            | Buy token and optionally the buy order amount. Example: `{ asset: 'WBTC', amount: 12 }` or `{ asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }`                                           |
| `theme`               | `CowSwapTheme`         | 'light'              | Theme of the widget (`'dark'` for dark theme or `'light'` for light theme).                                                                                                                    |
| `logoUrl`             | `string`               | ---                  | Sets a custom logo for the widget.                                                                                                                                                             |
| `hideLogo`            | `boolean`              | false                | Hides the logo in the widget.                                                                                                                                                                  |
| `hideNetworkSelector` | `boolean`              | false                | Disables an opportunity to change the network from the widget UI.                                                                                                                              |
| `enabledTradeTypes`   | `Array<TradeType>`     | All are enabled      | CoW Swap provides three trading widgets: `swap`, `limit` and `advanced` orders. Using this option you can narrow down the list of available trading widgets.                                   |
| `palette`             | `CowSwapWidgetPalette` | ---                  | Customizes the appearance of the widget. For example, you can change the main color of the background and text.                                                                                |
| `interfaceFeeBips`    | `string`               | ---                  | Coming soon! Fill [this form](https://cowprotocol.typeform.com/to/rONXaxHV) if you are interested                                                                                              |

## Widget updating

You can change all possible widget options on the fly:

```typescript
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

const container = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  appCode: 'My Cool App', // Name of your app (max 50 characters)
  logoUrl: 'YOUR_LOGO_URL',
}

const updateWidget = cowSwapWidget(container, params)

// Update the widget
updateWidget({
  ...params,
  theme: 'dark', // <- Change theme to dark
  hideNetworkSelector: true, // <- Hide the network selector
})
```

## Widget URL

Most of the widget parameters are controlled via the URL, which means that you can create the URL yourself and embed the
iframe.
An example of URL:

```
https://swap.cow.fi/#/100/swap/WXDAI/GNO?sellAmount=200&theme=dark
```
