# Solana support in BlockNumberProvider

**Date:** 2026-06-23
**Status:** Approved (design)

## Problem

`BlockNumberProvider` (`apps/cowswap-frontend/src/common/hooks/useBlockNumber/BlockNumberProvider.tsx`)
tracks the chain head used across the app for freshness checks and deadline/expiry
estimates. It currently supports EVM chains only, via wagmi's `useWatchBlockNumber`,
and explicitly disables itself on Solana:

```tsx
useWatchBlockNumber({
  chainId: activeChainId,
  // TODO solana add support
  enabled: Boolean(activeChainId) && windowVisible && !isSolana,
  onBlockNumber,
})
```

On Solana the provider therefore never produces a value. We want it to track the
Solana **slot** (Solana's analog of a block number) so downstream consumers behave the
same regardless of chain.

## Background

- The reown Solana adapter (`@reown/appkit-adapter-solana`) exposes a
  `@solana/web3.js` `Connection` via the `useAppKitConnection()` hook
  (`@reown/appkit-adapter-solana/react`). The adapter creates that connection from the
  network RPC URL on construct, so it is available **read-only before any wallet
  connects** — exactly what a block watcher needs.
- A Solana `Connection` provides both `getSlot()` (one-shot poll) and
  `onSlotChange(cb)` (websocket push, returns a subscription id removed via
  `removeSlotChangeListener(id)`).
- `useWalletInfo()` (from `@cowprotocol/wallet`) exposes the active `chainId`;
  `isSolanaChain(chainId)` (from `@cowprotocol/cow-sdk`) classifies it.
- `reownAppKit.getWalletProvider()` was considered as the unifying primitive, but the
  wallet provider is a *signing* interface that only exists after a wallet connects.
  The RPC `Connection` is the correct primitive for watching chain progress, so the
  Solana side is built on `useAppKitConnection()` instead.

## Design

Three layers, lowest to highest.

### Layer 1 — `useWatchSolanaSlot` (internal building block)

`libs/wallet/src/api/hooks/useWatchSolanaSlot.ts`. Mirrors the shape of wagmi's
`useWatchBlockNumber` so the higher layer can treat the two symmetrically. Kept
internal — **not** exported from `libs/wallet/src/index.ts`.

```ts
interface UseWatchSolanaSlotParams {
  enabled?: boolean
  onSlot: (slot: bigint) => void // same signature as wagmi's onBlockNumber
}

export function useWatchSolanaSlot({ enabled, onSlot }: UseWatchSolanaSlotParams): void
```

Internals:

- Reads `connection` from `useAppKitConnection()`.
- Keeps the latest `onSlot` callback in a ref so a changing callback identity does not
  tear down and re-create the subscription (matches wagmi's behaviour).
- A `useEffect` gated on `enabled && connection`:
  - Seeds the current value once via `connection.getSlot()` and forwards it as
    `BigInt(slot)` — `onSlotChange` only fires on *new* slots, so without this the value
    would be stale until the next slot.
  - Subscribes: `const id = connection.onSlotChange(({ slot }) => onSlotRef.current(BigInt(slot)))`.
  - Cleanup: `connection.removeSlotChangeListener(id)`.
- Effect deps include `connection` and `enabled`, so switching network (new
  `Connection`) re-subscribes; the `getSlot` seed guards against resolving after unmount.

### Layer 2 — `useWatchChainBlockNumber` (new public hook)

`libs/wallet/src/api/hooks/useWatchChainBlockNumber.ts`. The chain-agnostic
abstraction. Detects the active network internally and delegates to exactly one
watcher; the other stays disabled. Exported from `libs/wallet/src/index.ts`.

```ts
interface UseWatchChainBlockNumberParams {
  enabled?: boolean
  onBlockNumber: (blockNumber: bigint) => void
}

export function useWatchChainBlockNumber({ enabled, onBlockNumber }: UseWatchChainBlockNumberParams): void {
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)

  useWatchBlockNumber({ // wagmi
    chainId,
    enabled: Boolean(chainId) && enabled && !isSolana,
    onBlockNumber,
  })

  useWatchSolanaSlot({ // ours
    enabled: Boolean(chainId) && enabled && isSolana,
    onSlot: onBlockNumber,
  })
}
```

Both hooks always run (Rules of Hooks); the `enabled` flags ensure only one is active.

### Layer 3 — `BlockNumberProvider` (consumer, simplified)

Drops the `isSolana` computation, the `useWatchBlockNumber` call, and the direct
`wagmi` / `isSolanaChain` imports. It keeps `activeChainId` from `useWalletInfo()` for
its own monotonic block-tracking state (the `setChainBlock` guard and the
chain-change reset effect are unchanged). The `// TODO solana add support` comment is
removed.

```tsx
const { chainId: activeChainId } = useWalletInfo()
// ...onBlockNumber unchanged (bigint + monotonic guard)...
useWatchChainBlockNumber({
  enabled: windowVisible,
  onBlockNumber,
})
```

`useBlockNumber()` and all its consumers are untouched — the context value shape
(`{ value?: number }`) does not change.

## Data flow

```
Solana RPC ──onSlotChange──▶ useWatchSolanaSlot ─┐
                                                  ├─▶ useWatchChainBlockNumber ─▶ onBlockNumber ─▶ BlockNumberProvider state ─▶ useBlockNumber()
EVM node   ──block events──▶ useWatchBlockNumber ─┘
```

## Error handling / edge cases

- `connection` is `undefined` until the Solana adapter initializes → effect no-ops
  until it appears, then re-runs.
- `getSlot()` rejection is swallowed (logged at most); the websocket subscription is the
  primary source and continues independently.
- `enabled: false` (window hidden) or non-Solana chain → no subscription created.
- Network switch EVM↔Solana flips which watcher is enabled; the disabled one cleans up.

## Testing (TDD, in `libs/wallet`)

`@reown/appkit-adapter-solana/react` and `wagmi` mocked via `jest.mock`.

`useWatchSolanaSlot.test.ts`:
- Subscribes via `onSlotChange` and seeds via `getSlot` when `enabled` and a
  connection are present.
- Does **not** subscribe when `enabled: false`.
- Does **not** subscribe when `connection` is `undefined`.
- Forwards the slot to `onSlot` as a `bigint`.
- Calls `removeSlotChangeListener` on unmount.
- Re-subscribes when the `connection` instance changes.

`useWatchChainBlockNumber.test.ts`:
- Routes to wagmi's `useWatchBlockNumber` (enabled) and leaves `useWatchSolanaSlot`
  disabled on an EVM chainId.
- Routes to `useWatchSolanaSlot` (enabled) and leaves wagmi's hook disabled on the
  Solana chainId.
- Both watchers disabled when `enabled: false`.

## Test mock update

`apps/cowswap-frontend/src/mocks/reownSolanaAdapterMock.ts` is mapped to
`@reown/appkit-adapter-solana/react` in `apps/cowswap-frontend/jest.config.mjs`. It
currently exports only `SolanaAdapter`. Add:

```ts
export function useAppKitConnection() {
  return { connection: undefined }
}
```

so existing frontend tests that render `BlockNumberProvider` keep passing.

## Out of scope

- Polling fallback for `getSlot` (websocket push is sufficient; revisit only if a
  provider lacks websocket support).
- Exposing the raw Solana `Connection` as a public wallet-lib hook.
- Any change to `useBlockNumber()`'s public API or the context value shape.
