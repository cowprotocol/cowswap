# CowSwap Widget

Integrate the power of `CowSwap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the
look and much more!

Create your own widget using the configurator https://swap.cow.fi/widget-configurator/

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
import {cowSwapWidget, CowSwapWidgetParams, CowSwapWidgetSettings} from '@cowprotocol/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  container: widgetContainer,
  metaData: {appKey: 'YOUR_APP_ID', url: 'https://YOUR_APP_URL'},
  width: 600,
  height: 640,
}

const settings: CowSwapWidgetSettings = {
  sell: {asset: 'DAI'},
  buy: {asset: 'USDC', amount: '0.1'}
}

cowSwapWidget(params, settings)
```

## App key
You must specify the `appKey` parameter when initializing the widget. This parameter is used to identify the source of orders.  
The key must be a UTF8 string of up to 50 chars.  
It will be a part of orders meta-data, see more in the [CoW Protocol Docs](https://docs.cow.fi/front-end/creating-app-ids/create-the-order-meta-data-file/appcode).

## Wallet provider

You can pass the wallet provider from your application to seamlessly use the widget as part of your application.
Also, you can not specify the provider, in this case the widget will work in standalone mode with the ability to connect
any wallet supported in CowSwap.

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

An example of connecting a widget to Metamask:

```typescript
import {cowSwapWidget, CowSwapWidgetParams} from '@cowprotocol/widget-lib'

const params: CowSwapWidgetParams = {
  container: document.getElementById('cowswap-widget'),
  metaData: {appKey: 'YOUR_APP_ID', url: 'https://YOUR_APP_URL'},
  width: 600,
  height: 640,
  provider: window.ethereum // <-------
}

cowSwapWidget(params, {})
```

## Configuration

### `CowSwapWidgetParams`

| Parameter   | Type                    | Description                                                                                                                                          |
|-------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| `width`     | `number`                | The width of the widget in pixels.                                                                                                                   |
| `height`    | `number`                | The height of the widget in pixels.                                                                                                                  |
| `container` | `HTMLElement`           | The container in which the widget will be displayed.                                                                                                 |
| `metaData`  | `CowSwapWidgetMetaData` | Information about the application in which the widget is embedded. This information will help identify the source of orders and requests from users. |
| `provider`  | `EthereumProvider`      | (Optional) The Ethereum provider to be used for interacting with a wallet.                                                                           |

### `CowSwapWidgetSettings`

| Parameter              | Type                   | Description                                                                                                                                                  |
|------------------------|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `chainId`              | `number`               | The blockchain ID on which the trade will take place.                                                                                                        |
| `tradeType`            | `string`               | The type of trade. Can be `swap` or `limit-orders`.                                                                                                          |
| `env`                  | `CowSwapWidgetEnv`     | The environment of the widget (`'local'` or `'prod'`).                                                                                                       |
| `tradeAssets`          | `TradeAssets`          | (Optional) An object containing information about the selling and buying assets.                                                                             |
| `theme`                | `CowSwapTheme`         | (Optional) The theme of the widget (`'dark'` for dark theme or `'light'` for light theme).                                                                   |
| `logoUrl`              | `boolean`              | (Optional) The width of the widget in pixels.                                                                                                                |
| `hideLogo`             | `boolean`              | (Optional) The height of the widget in pixels.                                                                                                               |
| `hideNetworkSelector`  | `boolean`              | (Optional) Disables an opportunity to change the network from the widget UI.                                                                                 |
| `dynamicHeightEnabled` | `boolean`              | (Optional) Dynamically changes the height of the iframe depending on the content.                                                                            |
| `enabledTradeTypes`    | `Array<TradeType>`     | (Optional) CowSwap provides three trading widgets: swap, limit and twap orders. Using this option you can narrow down the list of available trading widgets. |
| `palette`              | `CowSwapWidgetPalette` | (Optional) Using the palette you can customize the appearance of the widget. For example, you can change the main color of the background and text.          |

```typescript
export interface CowSwapWidgetMetaData {
  appKey: string
  url: string
}

interface TradeAsset {
  asset: string
  amount?: string
}

export interface TradeAssets {
  sell: TradeAsset
  buy: TradeAsset
}

export enum TradeType {
  SWAP = 'swap',
  LIMIT = 'limit',
  ADVANCED = 'advanced',
}

export interface CowSwapWidgetPalette {
  primaryColor: string
  screenBackground: string
  widgetBackground: string
  textColor: string
}
```

## Widget updating

You can change all possible widget options on the fly:

```typescript
import { cowSwapWidget, CowSwapWidgetParams, CowSwapWidgetSettings } from '@cowprotocol/widget-lib'

const params: CowSwapWidgetParams = {
  container: document.getElementById('cowswap-widget'),
  metaData: { appKey: 'YOUR_APP_ID', url: 'https://YOUR_APP_URL' },
  width: 600,
  height: 640,
}


const settings: CowSwapWidgetSettings = {
  logoUrl: 'YOUR_LOGO_URL'
}

const updateWidget = cowSwapWidget(params, settings)

// Update the widget
updateWidget({
  ...settings,
  theme: 'dark', // <- Change theme to dark
  hideNetworkSelector: true // <- Hide the network selector
})
```

## Widget URL

Most of the widget parameters are controlled via the URL, which means that you can create the URL yourself and embed the
iframe.
An example of URL:

```
https://swap.cow.fi/#/100/swap/WXDAI/GNO?sellAmount=200&theme=dark
```
