# CoW Swap Widget Library

Integrate the power of `CowSwap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the
look and much more!

## Live example

See the widget in action in the [widget configurator](https://widget.cow.fi)

## Docs

You can find a detailed description of all widget parameters in the [documentation](https://docs.cow.fi/cow-protocol/tutorials/widget)

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
import { createCowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')

// instantiate your own web3 provider
const provider = window.ethereum

const params: CowSwapWidgetParams = {
  appCode: 'NAME-OF-YOU-APP', // Add here the name of your app. e.g. "Pig Swap"
  sell: { asset: 'DAI' },
  buy: { asset: 'USDC', amount: '0.1' },
}

const {updateParams} = createCowSwapWidget(
  widgetContainer,
  // Optionally, you can provide some additional params to customise your widget
  {params, provider}
)

// You also can change widget configuration on the fly
updateParams({ ...params, tradeType: 'limit' })
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
