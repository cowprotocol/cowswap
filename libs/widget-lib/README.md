# CoW Swap Widget Library

Integrate the power of `CowSwap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the
look and much more!

## Live example

See the widget in action in the [widget configurator](../../apps/widget-configurator/src/main.tsx)

## Docs

You can find a detailed description of all widget parameters in the [documentation](../../libs/widget-lib/docs/README.md)

## Quick start

```
npm install @cowprotocol/widget-lib --save
```

```
yarn add @cowprotocol/widget-lib
```

Create a container somewhere in your website, the widget will be rendered inside it:

```html
<div id="cowswap-widget"></div>
```

Import the widget and initialise it:

```js
import { cowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')

const params: CowSwapWidgetParams = {
  appKey: '<YOUR_APP_KEY>', // Just an unique identifier for your app
  sell: { asset: 'DAI' },
  buy: { asset: 'USDC', amount: '0.1' },
  // instantiate your own web3 provider
  provider: window.ethereum
}

const updateWidget = cowSwapWidget(
  widgetContainer,
  // Optionally, you can provide some additional params to customise your widget
  params
)

// You also can change widget configuration on the fly
updateWidget({ ...params, tradeType: 'limit' })
```

## Developers

#### Test
```
nx test widget-lib
```

#### Build the library
```
nx build widget-lib
```

