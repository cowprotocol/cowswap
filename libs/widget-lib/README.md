# CoW Swap Widget Library

## Use it

Install dependency

```bash
# Install the dependency using NPM
npm install @cowprotocol/widget-lib --save

# ...or alternativelly use YARN
yarn add @cowprotocol/widget-lib
```

Create an empty div somewhere in your website:

```html
<div id="cowswap-widget"></div>
```

Import the widget and initialise it:

```js
import { cowSwapWidget } from '@cowswap/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')
cowSwapWidget({
  container: widgetContainer
})


// Additionally, you can pass some additional params to customise your widget
provider = /* instantiate your own web3 provider */
cowSwapWidget({
  container: widgetContainer,
  width: 600
  height: 640
  urlParams: {
    sell: { asset: 'DAI' },
    buy: { asset: 'USDC', amount: '0.1' }
  },
  provider
})
```

## Developers

```bash
# Run demo project locally
# Will open http://localhost:3012/src/demo/index.html
nx serve widget-lib

# Test
nx test widget-lib

# Build the library
nx build widget-lib

# Publish to NPM
nx publish widget-lib --ver 0.0.7 --tag latest
```
