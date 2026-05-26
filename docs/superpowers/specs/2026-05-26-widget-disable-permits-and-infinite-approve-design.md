# Widget params: `disableEIP2612Permits` and `disableInfiniteApprove`

Date: 2026-05-26
Status: Design — pending review

## Goal

Add two boolean params to the injected widget API so integrators can:

1. **`disableEIP2612Permits`** — force the widget to never sign an off-chain EIP-2612 permit. Even when a token supports permit, the widget sends an on-chain `approve` transaction instead.
2. **`disableInfiniteApprove`** — force all `approve` transactions to use the exact trade-size amount. The "Partial approval" Settings toggle stays visible but is locked on, so the user can see why infinite approval isn't available.

The two flags are independent: enabling `disableInfiniteApprove` does not turn off permits, and enabling `disableEIP2612Permits` does not change approve amounts.

## Scope

Applies to **all trade types** (Swap, Limit, TWAP, Hooks). The gates are placed at shared leaf hooks so any trade type that consumes them is covered automatically.

Out of scope: changing the protocol settings UI beyond locking the existing toggle; changing how `enablePartialApprovalBySettings` works for non-widget (cowswap.fi) traffic.

## Approach

Read the new widget params at the lowest-level hooks (Approach A from brainstorming), matching the existing `disable*` pattern (e.g. `disableProgressBar` is read at the consumer site, not threaded through props).

### Public API — `libs/widget-lib/src/types.ts`

Add to `CowSwapWidgetParams`, alongside the other `disable*` flags:

```ts
/**
 * Disables the EIP-2612 permit signing flow. When `true`, the widget will
 * never sign an off-chain permit and will always send an on-chain approval
 * transaction — even for tokens that support permit.
 *
 * Defaults to false.
 */
disableEIP2612Permits?: boolean

/**
 * Disables infinite (MAX_UINT256) ERC-20 approvals. When `true`, every
 * approval transaction approves only the exact trade-size amount, and the
 * "Partial approval" toggle in Settings is shown but locked on.
 *
 * Defaults to false.
 */
disableInfiniteApprove?: boolean
```

The existing `validateWidgetParams` schema accepts unknown boolean fields, so no schema update is needed. Implementation will verify this before merging.

### Permit gate — `useIsPermitEnabled`

`apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts` is the lowest common gate; it already feeds `usePermitInfo`, `usePermitCompatibleTokens`, and the hooks-store `PermitHookApp` tile.

```ts
export function useIsPermitEnabled(): boolean {
  const { disableEIP2612Permits } = useInjectedWidgetParams()
  const isEoa = useIsSmartContractWallet() === false

  if (disableEIP2612Permits) return false
  return isEoa
}
```

Read both hooks unconditionally to keep hook order stable.

**Downstream effect:** when set, `useTokenSupportsPermit` returns `false` → `useApproveAndSwap` falls through to on-chain `handleApprove`. The hooks-store `PermitHookApp` tile is also hidden (intentional: integrator opted out of permits entirely).

### Infinite-approve gate — `useIsInfiniteApproveDisabled`

New hook `apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts`:

```ts
export function useIsInfiniteApproveDisabled(): boolean {
  return Boolean(useInjectedWidgetParams().disableInfiniteApprove)
}
```

Three consumers:

1. **`modules/erc20Approve/hooks/useApproveAndSwap.tsx`** (line 108)
   The on-chain approve amount branch becomes:
   ```ts
   const forcePartial = isPartialApproveEnabledByUser || isInfiniteApproveDisabled
   const toApprove = forcePartial ? amountToApproveBig : MAX_APPROVE_AMOUNT
   ```
   `isInfiniteApproveDisabled` is read at the hook level and threaded into the `approveAndSwap` helper.

2. **`modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx`** (line 31)
   When `isInfiniteApproveDisabled` is true, return `partialAmountToSign` regardless of user/setting toggles, so the modal label matches the actual on-chain amount.

3. **`modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx`**
   Force `isPartialApproveEnabledAtom` to `true` and the per-trade `isPartialApproveSelectedByUserAtom` to `true` while the flag is set, so any UI that reads those atoms (toggle state, labels) reflects the locked state.

### Settings dropdown lock

`modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx` already takes `enablePartialApprovalState`. Add a sibling prop `partialApprovalLocked?: boolean`. When `true`, render the toggle as `checked` and `disabled`. Implementation must confirm the underlying `Toggle` pure component supports a `disabled` prop; if not, add one (single new pass-through prop).

The Swap-side caller (`modules/swap/containers/SwapWidget/index.tsx`) reads `useIsInfiniteApproveDisabled()` and forwards it to the dropdown.

### `TradeApproveToggle` lock

`modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx` renders the per-trade toggle inside the approve modal. When `disableInfiniteApprove` is true, render the toggle as locked-on (same `disabled` prop on the underlying `Toggle`).

## Testing

### Unit tests

1. **New: `useIsPermitEnabled.test.ts`**
   - returns `false` when `disableEIP2612Permits` is `true`
   - returns `false` for SC wallets (existing behavior preserved)
   - returns `true` for EOA + flag unset

2. **Extend `useApproveAndSwap.test.ts`**
   - `disableInfiniteApprove=true`, `isPartialApproveEnabledByUser=false` → `handleApprove` called with trade-size amount, not `MAX_APPROVE_AMOUNT`
   - `disableInfiniteApprove=true` + token supports permit + `disableEIP2612Permits=false` → permit flow still used (flags are independent)

3. **Extend `useGetAmountToSignApprove.test.ts`**
   - `disableInfiniteApprove=true` → returns `partialAmountToSign` regardless of user/setting toggles

### Manual verification (via `/verify` after implementation)

Use the local widget host to exercise the flags end-to-end:

- `disableEIP2612Permits: true` + USDC swap → on-chain approve, no permit signature.
- `disableInfiniteApprove: true` + swap → approve tx uses trade-size amount; Settings "Partial approval" toggle is checked and disabled.
- Both flags set → both behaviors observed, no regressions.
- Both flags unset → existing behavior preserved.

## Risks and tradeoffs

- **Hooks-store `PermitHookApp` tile is gated by `useIsPermitEnabled`.** When `disableEIP2612Permits` is set, the tile disappears. Confirmed intentional during brainstorming.
- **Partial-approve atoms become "owned" by the widget param when set.** While `disableInfiniteApprove` is true, the user toggle is effectively read-only. Acceptable because the user already chose to use a widget that disables this.
- **Cross-module read of `useInjectedWidgetParams` from `common/hooks` and `erc20Approve`.** Both modules already import freely from each other and from `injectedWidget` (e.g. via `useDerivedTradeState` chains), so this does not introduce a new dependency direction.

## Files to change

- `libs/widget-lib/src/types.ts` — add the two type fields.
- `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts` — add permit gate.
- `apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts` — new hook.
- `apps/cowswap-frontend/src/modules/injectedWidget/hooks/index.ts` (or wherever hook exports live) — re-export.
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.tsx` — wire into approve amount branch.
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx` — wire into signed amount branch.
- `apps/cowswap-frontend/src/modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx` — force partial-approve atoms when flag set.
- `apps/cowswap-frontend/src/modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx` — lock the per-trade toggle.
- `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx` — accept and propagate `partialApprovalLocked`.
- `apps/cowswap-frontend/src/modules/tradeWidgetAddons/pure/Toggle/...` — add `disabled` prop if not already present (verify).
- `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx` — forward `partialApprovalLocked` to the dropdown.
- Test files listed in Testing.
