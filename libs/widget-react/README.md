# CoW Swap React widget

React component that creates a CoW Swap widget. It is based on [https://npmjs.com/package/@cowprotocol/widget-lib](https://npmjs.com/package/@cowprotocol/widget-lib)

## Use it

Install dependency

```bash
# Install the dependency using NPM
npm install @cowprotocol/widget-react --save

# ...or alternativelly use YARN
yarn add @cowprotocol/widget-react
```

Import component and some convenient types

```ts
import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'
```

Prepare the config for the widget:

```ts
const cowSwapWidgetParams: CowSwapWidgetParams = {
  metaData: {
    appKey: '<YOUR_APP_KEY>',
    appUrl: '<YOUR_APP_URL>',
  },
  width: 600,
  height: 700,
  tradeType: 'swap',
}
```

Render the component:

```jsx
<CowSwapWidget params={cowSwapWidgetParams} />
```

## Developers

```bash
# Test
nx test widget-react

# Build the library
nx build widget-react

# Publish to NPM
nx publish widget-react --ver x.y.z --tag latest
```
