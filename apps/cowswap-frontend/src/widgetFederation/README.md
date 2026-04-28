# CoW Swap Federated Widget

This folder exposes a build-only React micro frontend for hosts that want the CoW Swap widget without an iframe.

The public host-side component is exported from `@cowprotocol/widget-react` as `CowSwapFederatedWidget`.

```tsx
import { CowSwapFederatedWidget } from '@cowprotocol/widget-react'

<CowSwapFederatedWidget params={{ appCode: 'my-app', baseUrl: 'https://swap.cow.fi' }} />
```

## Contract

- Remote entry: `${params.baseUrl}/remoteEntry.js`
- Exposed module: `./CowSwapWidgetRemote`
- Remote API:

```ts
mount(container: HTMLElement, props: CowSwapWidgetProps): {
  update(props: CowSwapWidgetProps): void
  unmount(): void
}
```

`CowSwapWidgetRemote.tsx` is the federation entry. It marks the app as widget mode, lazy-loads the full widget shell, mounts React into the host-provided container, and forwards prop updates.

`CowSwapWidgetFederatedApp.tsx` builds the widget app shell with the same providers used by the normal app, but backed by `MemoryRouter` and widget params instead of iframe URL/message state.

## Local Smoke Test

The federated widget is intentionally build-only. Do not use `start:cowswap` for the remote; Vite dev server does not serve the federated build artifacts.

Run the remote from build output:

```bash
pnpm run preview
```

This serves:

```text
http://localhost:3000/remoteEntry.js
```

Run the widget configurator:

```bash
pnpm run start:widget
```

Open:

```text
http://localhost:4200
```

## Current Limits

- Build-only POC. No Vite dev-server remote support.
- No Shadow DOM. Host page styles can affect the widget and widget styles are loaded into the host document.
- Widget hooks are disabled for the federated path.
- The `provider` prop is not bridged yet; the remote uses the normal wallet stack.
- This is React-app-only distribution. Non-React hosts should use the iframe widget.
