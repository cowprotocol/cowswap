# CowSwap Widget

Integrate the power of `CowSwap` into your product!
With the widget, you can create an incredible trading interface. Specify the required pair of currencies, customize the look and much more!

![](https://github.com/cowprotocol/cowswap/raw/npm-widget-1-docs/src/libs/widget-lib/docs/widget-demo.mp4)
<video src="./widget-demo.mp4" controls="controls" style="max-width: 730px;">
</video>


## Install

```bash
yarn add @cowprotocol/widget-lib
```
```bash
npm install @cowprotocol/widget-lib
```

## Quick start

```typescript
import { cowSwapWidget } from '@cowprotocol/widget-lib'

// Initialise the widget
const widgetContainer = document.getElementById('cowswap-widget')

cowSwapWidget({
  container: widgetContainer,
  width: 600,
  height: 640,
  urlParams: {
    sell: { asset: 'DAI' },
    buy: { asset: 'USDC', amount: '0.1' }
  }
})
```

## Wallet provider
