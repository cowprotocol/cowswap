# Mock injected wallet for Playwright e2e — design

Date: 2026-07-26
Status: approved
App: `apps/cowswap-frontend-e2e-pw`

## Problem

The Playwright suite drives a real MetaMask extension through Synpress. That is
the right tool for scenarios that must exercise real extension UI, but it is
slow (extension startup per test, popup round-trips per signature) and requires
the one-time `.cache-synpress` profile build. Most scenarios only need *a
connected wallet that signs* — the extension itself is incidental.

We need a second, fast wallet path: a private key defines the wallet, the app
boots already connected, all signing is local and instant, and individual RPC
methods (e.g. `wallet_getCapabilities`) can be stubbed per test.

## Decisions (made with the user)

1. **Separate test entrypoint.** Mock-wallet specs import `test` from a new
   fixture module; Synpress specs keep the existing one. No Synpress machinery
   loads for mock-wallet specs.
2. **Auto-connected on page load.** The fixture pre-seeds reconnect state so
   the app comes up connected — zero clicks. A modal-clicking helper remains
   available for connect-flow specs.
3. **Node-side provider logic.** The in-page provider is a thin shim that
   forwards `request()` to the Node test process via an exposed binding.
   Signing and stubs run in Node as plain closures.
4. **Chain reads go through the existing RPC proxy** on the per-worker
   partition, so `setBalance` / `stubCall` and worker isolation keep working.

## Architecture

```
page (app)                         Node (test process)
┌──────────────────────────┐      ┌─────────────────────────────┐
│ injectedShim (init script)│      │ walletEngine                │
│  - EIP-1193 request()     │─────▶│  - viem account (priv key)  │
│  - EIP-6963 announce      │ bind │  - built-in method handlers │
│  - window.ethereum        │      │  - per-test stubs + call log│
│  - __e2eWalletEmit(ev)    │◀─────│  - forwards rest to proxy   │
└──────────────────────────┘ eval └──────────────┬──────────────┘
                                                  ▼
                                    rpcProxy /rpc/<chainId>/<workerId>
```

### Page-side shim — `src/mockWallet/injectedShim.ts`

Installed via `context.addInitScript` before any navigation. Self-contained
(no imports that survive to the page; serialized as a function/string):

- EIP-1193: `request({ method, params })`, `on` / `removeListener` /
  `removeAllListeners`, plus the legacy `send` overloads (callback and
  promise forms), mirroring the old Cypress `CustomizedBridge`
  (`apps/cowswap-frontend-e2e/src/support/ethereum.ts`).
- Every `request()` forwards to the exposed binding `__e2eWalletRequest`
  and re-throws structured errors as EIP-1193 `ProviderRpcError`-shaped
  objects (`{ code, message, data? }`).
- EIP-6963: dispatches `eip6963:announceProvider` on install and in response
  to `eip6963:requestProvider`. Provider info: rdns `fi.cow.e2e-wallet`,
  name `E2E Wallet`, stable uuid, inline data-URI icon.
- Sets `window.ethereum` to the same provider object.
- Exposes `window.__e2eWalletEmit(event, payload)` so Node can push
  `chainChanged` / `accountsChanged` events into the page.

### Node-side engine — `src/mockWallet/walletEngine.ts`

Constructed per test with `{ privateKey, chainId, workerId, proxyUrl }`.
Account from `privateKeyToAccount` (viem). Request routing, in order:

1. **Per-test stub** for the method, if registered → run it (may return a
   value or throw `{ code, message }`).
2. **Built-in handlers:**
   - `eth_accounts`, `eth_requestAccounts` → `[address]`
   - `eth_chainId` (hex), `net_version` (decimal)
   - `personal_sign`, `eth_signTypedData_v4` → local signing via viem,
     auto-approved
   - `eth_sendTransaction` → fill nonce/gas via proxy if missing, sign
     locally, submit as `eth_sendRawTransaction` through the proxy
   - `wallet_switchEthereumChain`, `wallet_addEthereumChain` → update engine
     chain state, emit `chainChanged`
   - `wallet_getCapabilities` → `{}` by default (tests stub richer answers)
   - `wallet_requestPermissions`, `wallet_revokePermissions` → benign static
     results
3. **Fallback:** JSON-RPC POST to
   `<proxyUrl>/rpc/<currentChainId>/<workerId>`.

Every request (method, params, outcome) is appended to a call log.

### Per-test overrides — the `wallet_getCapabilities` story

```ts
wallet.stubRpc('wallet_getCapabilities', ({ params }) => ({
  '0xaa36a7': { atomic: { status: 'supported' } },
}))
wallet.stubRpc('eth_signTypedData_v4', () => {
  throw { code: 4001, message: 'User rejected the request.' } // rejection flow
})
wallet.rpcCalls('wallet_getCapabilities') // recorded calls for assertions
wallet.restoreRpc('wallet_getCapabilities')
```

Stubs are Node closures: changeable mid-test, no serialization, can assert on
params, count calls, or flip behavior between steps.

### Auto-connect

An init script pre-seeds `localStorage` before the app loads so wagmi/AppKit
reconnect to the mock provider without any clicks:

- wagmi recent-connector / store keys pointing at the injected connector for
  rdns `fi.cow.e2e-wallet`
- `@appkit/connection_status = connected`
- `@appkit/active_caip_network_id = eip155:<chainId>` (the same key the
  Synpress `connectAsEOA` already pins)

**Known-fragile point:** these keys are wagmi/AppKit-version-specific. The
implementation discovers the exact key set empirically once and centralizes
it in a single `seedAutoConnect(chainId)` helper with a comment naming the
versions it was verified against. Fallback if seeding proves unreliable:
`connectViaModal()` (EIP-6963 discovery makes the mock wallet appear in the
AppKit modal) becomes the default connect path — still fast, no extension.

### Fixture entrypoint — `src/fixtures/mockWallet.ts`

Exports `test` / `expect` built on plain `@playwright/test` — Synpress is not
imported. Reuses unchanged: page objects (`SwapPage`, `LimitPage`, …), the
`mocks` fixture set, and the `rpcProxy` handle. New fixture:

```ts
interface MockWalletApi {
  readonly address: string
  openApp(opts: { chainId: SupportedChainId; path?: string }): Promise<void> // navigate, arrives connected
  switchChain(chainId: SupportedChainId): Promise<void>   // engine-side + chainChanged event
  connectViaModal(): Promise<void>                        // for connect-flow specs
  stubRpc(method: string, handler: RpcStub): void
  restoreRpc(method: string): void
  rpcCalls(method?: string): RecordedRpcCall[]
}
```

Private key: `INTEGRATION_TEST_PRIVATE_KEY` env (same as the old Cypress
suite), overridable per spec via `test.use({ mockWalletKey: '0x…' })`.
Default chain: Sepolia.

Existing Synpress fixtures and specs are untouched.

## Error handling

- Missing `INTEGRATION_TEST_PRIVATE_KEY` → fixture throws at setup with a
  message naming the env var.
- Stub throws `{ code, message }` → shim surfaces it as an EIP-1193 provider
  error (this is how rejection flows are driven).
- Proxy/network failure on fallback → JSON-RPC error propagated to the app,
  request still recorded in the call log.

## Testing

`src/tests/mock-wallet.spec.ts` (also serves as usage documentation):

1. App loads with the wallet connected; account modal shows the key's address.
2. Typed-data signing completes with no UI interaction (e.g. order placement
   against the mocked order API).
3. `wallet_getCapabilities` stub changes app behavior; `rpcCalls()` records
   the call with params.
4. A 4001 stub on `eth_signTypedData_v4` drives the app's rejection path
   (removed with `restoreRpc` afterwards).
5. `switchChain` propagates: app UI reflects the new network.

## Out of scope

- Migrating existing Synpress specs to the mock wallet (follow-up, per spec).
- Multi-account / account-switching support.
- Safe (smart-contract wallet) simulation — the `safeSdk` mock covers that.
