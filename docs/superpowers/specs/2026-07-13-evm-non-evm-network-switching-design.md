# EVM ↔ non-EVM Network Switching Flow

**Date:** 2026-07-13
**Branch:** solana/web-1
**Status:** Approved

## Problem

CoW Swap is gaining non-EVM network support (Solana). EVM and non-EVM networks
use fundamentally different wallets, so a connected wallet cannot simply "switch"
across the family boundary the way it switches between two EVM chains. Today,
selecting a cross-family network in the network picker either silently fails or
leaves the app in an inconsistent state.

We need an explicit, user-confirmed flow: when the user picks a network that
belongs to a different chain family than the currently connected wallet, we
confirm the intent, disconnect the current wallet, and open the wallet
connection modal on the target network.

## Goal

When a user selects a network in the **network selector** that belongs to a
different chain family than the currently connected wallet (EVM ↔ non-EVM):

1. Show a confirmation popup.
2. On confirm: disconnect the current wallet and open the wallet connection
   modal, targeting the selected network.

Same-family switches (EVM → EVM) keep working exactly as today.

## Scope

- **In scope:** the manual network picker path only — `useOnSelectNetwork`
  (`apps/cowswap-frontend/src/common/hooks/useOnSelectNetwork.tsx`), which is
  what the `NetworkSelector` UI calls.
- **Out of scope / untouched:**
  - `useSwitchNetwork` (`libs/wallet/src/wagmi/hooks/useSwitchNetwork.ts`) — the
    shared low-level primitive stays as-is.
  - The automatic, URL-driven switching path in `useSetupTradeState`
    (`apps/cowswap-frontend/src/modules/trade/hooks/setupTradeState/useSetupTradeState.ts`)
    — keeps current behavior. Deep-link / programmatic family crossings are not
    guarded by this flow.

## Flow

```
user selects targetChain in NetworkSelector
        │
        ▼
is a wallet connected AND family(targetChain) ≠ family(currentChain)?
        │
   ┌────┴─────────────────────────────┐
  no                                  yes
   │                                   │
   ▼                                   ▼
existing behavior:              show ConfirmationModal
switchNetwork(targetChain)      "Switching network type… are you sure?"
                                        │
                                 ┌──────┴───────┐
                              Cancel          Confirm
                                 │               │
                                 ▼               ▼
                              no-op        1. set target chain in URL + walletInfoAtom
                                           2. disconnect current wallet
                                           3. open wallet connection modal
```

## Design

### Chain-family detection

Add a small helper that answers "do these two chains belong to the same wallet
family?" built on the existing `@cowprotocol/cow-sdk` predicates (`isEvmChain`,
`isSolanaChain`, and later `isBtcChain`). Both-EVM → same family; otherwise same
only if it is the same chain family. This keeps the crossing check a single
readable call and extends cleanly when BTC lands.

```ts
// conceptually:
function isSameChainFamily(a: SupportedChainId, b: SupportedChainId): boolean {
  if (isEvmChain(a) && isEvmChain(b)) return true
  // non-EVM families are distinct from EVM and (for now) from each other
  return a === b
}
```

Placement: colocate with the other chain helpers so it is reusable (e.g. in
`@cowprotocol/cow-sdk` alongside `isEvmChain`, or in a wallet/common-utils
helper). Final location decided during implementation to match existing
conventions.

### `useOnSelectNetwork` changes

The hook currently: clears connection error → `await switchNetwork(targetChain)`
→ `setChainIdToUrl(targetChain)` → error handling → close modal.

New behavior, evaluated at the top of the callback:

- Compute `isConnected` (a wallet is connected) and
  `crossingFamily = !isSameChainFamily(currentChainId, targetChain)`.
- **If `isConnected && crossingFamily`:**
  1. `const confirmed = await triggerConfirmation({ ...generic copy, skipInput: true })`.
  2. If not confirmed → return (no state change, existing wallet stays).
  3. If confirmed:
     - `setChainIdToUrl(targetChain)` and set `walletInfoAtom.chainId` to the
       target so the app reflects the target network while the user connects.
     - `await disconnectWallet()`.
     - `openWalletConnectionModal()`.
     - Close the network selector modal (respect existing `skipClose`).
- **Otherwise** (same family, or no wallet connected): unchanged — run the
  existing `switchNetwork` + `setChainIdToUrl` + error-handling path.

### Confirmation copy (generic, both-ways)

- **Title:** "Switching network type"
- **Body:** "You're switching between EVM and non-EVM networks. This requires
  connecting a different wallet. Your current wallet will be disconnected. Are
  you sure?"
- **Call to action:** "Yes" / cancel is "Cancel".
- `skipInput: true` — plain Yes/Cancel, no type-to-confirm word.

Wrapped in `<Trans>` / lingui macros consistent with the surrounding code.

### Building blocks (all already exist)

| Concern            | Hook / API                                                       |
| ------------------ | --------------------------------------------------------------- |
| Confirmation modal | `useConfirmationRequest({ onEnable })` → `Promise<boolean>`     |
| Disconnect         | `useDisconnectWallet()`                                          |
| Open connect modal | `useOpenWalletConnectionModal()` (reown `open`)                  |
| Current chain      | `useWalletInfo().chainId`                                        |
| Target persistence | existing `setChainIdToUrl` + `walletInfoAtom.chainId`           |

### Reconnection targeting

After disconnect we set the target chain in the URL and `walletInfoAtom` so the
app is already on the target network when the connection modal opens. If Reown
AppKit requires an explicit network hint for the connect view to default to the
target chain, add that call during implementation (e.g. an appkit
`switchNetwork(targetNetwork)` before `open`). The observable requirement:
after the user connects a compatible wallet, the app is on the selected network.

## Decisions

1. **Confirmation only when a wallet is connected.** With no wallet connected, a
   cross-family pick just sets the target chain (today's behavior) — nothing to
   disconnect, no reason to prompt.
2. **Canceling the connect modal after disconnect** leaves the app on the target
   network with no wallet connected (standard disconnected state). Not a special
   case.

## Testing

Unit-test the family-crossing decision in `useOnSelectNetwork`:

- Same-family switch → calls `switchNetwork`; no confirmation shown.
- Cross-family + wallet connected → confirmation shown; on confirm →
  `disconnectWallet` and `openWalletConnectionModal` called and target chain
  persisted; on cancel → nothing happens (no disconnect, no switch).
- Cross-family + no wallet connected → no confirmation; existing set-target
  behavior runs.

Unit-test `isSameChainFamily`: EVM/EVM → true; EVM/Solana → false;
Solana/Solana → true.
