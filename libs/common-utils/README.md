# Snackbars

![](./demo.png)

## Usage

```tsx
// Add the widget in the root component

import { SnackbarsWidget } from '@cowprotocol/common-utils'

export function App() {
  return (
    <SomProvider>
      <MyComponent />
      <SnackbarsWidget />
    </SomProvider>
  )
}
```

```tsx
// Use the hook to add a snackbar

import { useAddSnackbar } from '@cowprotocol/common-utils'

export function MyComponent() {
  const addSnackbar = useAddSnackbar()

  addSnackbar({
    content: <Trans>{walletName} account changed</Trans>,
    id: 'account-changed',
    icon: 'success'
  })
}
```

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test common-utils` to execute the unit tests via [Vitest](https://vitest.dev/).
