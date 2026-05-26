# Disable Custom Recipient — Design Spec

**Date:** 2026-05-26
**Branch:** feat/widget-features

## Summary

Add a new optional widget param `disableCustomRecipient` to `CowSwapWidgetAppParams`. When an embedder sets it to `true`, the Custom Recipient feature is suppressed across all trading widgets (swap, limit, TWAP), and cross-chain swaps are forced off because they depend on the custom recipient feature.

## Behavior contract

When `disableCustomRecipient === true`:

1. The Custom Recipient toggle is rendered **disabled (greyed out)** and visually unchecked in every settings dropdown (swap, yield, limit, TWAP).
2. The recipient input row never renders anywhere — regardless of:
   - the persisted `showRecipient` setting,
   - a recipient passed in via URL query params,
   - non-EVM bridging (which won't engage anyway, see #3).
3. `disableCrossChainSwap` is treated as `true` at the single consumer site, so bridging never enables.
4. Any previously persisted `recipient` / `recipientAddress` in swap, limit, and advanced-orders state is cleared on mount and whenever the flag flips on, so leftover values cannot reach the order receiver.

The persisted user preference `showRecipient` is **not** cleared — if the embedder later flips the flag off, the user's preference returns.

## Public API change

`libs/widget-lib/src/types.ts` — add to `CowSwapWidgetAppParams`, sibling of `disableCrossChainSwap`:

```ts
/**
 * Disables the Custom Recipient feature in all trading widgets (swap, limit, TWAP).
 *
 * When set to true:
 * - The Custom Recipient toggle is shown disabled (greyed out) in all settings dropdowns
 * - The recipient input is never shown
 * - Any previously stored recipient is cleared
 * - Cross-chain swaps are also disabled, because they require the custom recipient feature
 *
 * Defaults to false.
 */
disableCustomRecipient?: boolean
```

No other public API changes.

## Internal changes

### 1. Force-off cross-chain at the consumer site

`apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts` — the sole consumer of `disableCrossChainSwap`. Add `disableCustomRecipient` to the destructure and OR it into the bridging gate:

```ts
const { disableCrossChainSwap = false, disableCustomRecipient = false } = useInjectedWidgetParams()

const bridgingEnabled =
  isSwapOrHooksPage &&
  !disableCrossChainSwap &&
  !disableCustomRecipient &&
  shouldEnableInWidgetSafe &&
  hasBridgeProviders
```

We do not mutate `useInjectedWidgetParams()` itself — consumers continue to see exactly what the embedder passed.

### 2. Single recipient-visibility chokepoint

`apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts` — early-return when the flag is on. All three widgets (swap, limit, TWAP) render the recipient row through this hook.

```ts
export function useIsWithRecipient(showRecipient: boolean): boolean {
  const { disableCustomRecipient } = useInjectedWidgetParams()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isNonEvmBridging = useIsNonEvmBridging()
  const tradeStateFromUrl = useTradeStateFromUrl()

  if (disableCustomRecipient) return false

  const hasRecipientInUrl = !!tradeStateFromUrl?.recipient
  return !isWrapOrUnwrap && (isNonEvmBridging || hasRecipientInUrl || showRecipient)
}
```

### 3. Disable the toggle in each settings dropdown

The toggle is rendered in three separate UIs; each must independently respect the flag.

**`SettingsDropdown.container.tsx`** (swap + yield)

The existing `isRecipientToggleDisabled` prop currently does two things — it disables interaction *and* forces the toggle visually on (because the only existing caller, non-EVM bridging, needs the toggle locked on). We split those concerns:

- `isRecipientToggleDisabled` — disables interaction (existing prop, narrowed semantics).
- `isRecipientToggleForcedOn` — new prop, forces `checked={true}`. Used only by the non-EVM bridging callsite.

Rendering:

```tsx
<SettingsBox
  ...
  checked={isRecipientToggleForcedOn || (recipientToggleVisible && !isRecipientToggleDisabled)}
  disabled={isRecipientToggleDisabled}
/>
```

`SwapWidget/index.tsx` callsite:

```ts
const { disableCustomRecipient } = useInjectedWidgetParams()
// ...
<SettingsTab
  isRecipientToggleDisabled={isRecipientRequired || !!disableCustomRecipient}
  isRecipientToggleForcedOn={isRecipientRequired}
  ...
/>
```

`YieldWidget/index.tsx` — currently doesn't pass either prop; add `isRecipientToggleDisabled={!!disableCustomRecipient}`.

**`LimitOrdersSettings.pure.tsx` + `SettingsWidget/index.tsx`** (limit)

Add a `disabled?: boolean` prop to `LimitOrdersSettingsDropdown`. Container reads `useInjectedWidgetParams().disableCustomRecipient` and passes it through. In the pure component:

```tsx
<SettingsBox
  title={t`Custom Recipient`}
  ...
  checked={showRecipient && !disabled}
  disabled={disabled}
  toggle={handleRecipientToggle}
/>
```

**`AdvancedOrdersSettings.tsx`** (TWAP)

Same pattern — add a `disabled?: boolean` prop, pass `disableCustomRecipient` from `AdvancedOrdersSettings/index.tsx` container.

### 4. Clear persisted recipient state

New file: `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx`. Exported from `modules/injectedWidget/index.ts` and mounted in `apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx` next to `WidgetStandaloneModeUpdater` (currently line 105).

```tsx
export function DisableCustomRecipientUpdater(): null {
  const { disableCustomRecipient } = useInjectedWidgetParams()
  const updateSwapRawState = useUpdateSwapRawState()
  const updateLimitOrdersRawState = useUpdateLimitOrdersRawState()
  const updateAdvancedOrdersRawState = useUpdateAdvancedOrdersRawState()

  useEffect(() => {
    if (!disableCustomRecipient) return
    updateSwapRawState({ recipient: undefined, recipientAddress: undefined })
    updateLimitOrdersRawState({ recipient: undefined, recipientAddress: undefined })
    updateAdvancedOrdersRawState({ recipient: undefined, recipientAddress: undefined })
  }, [disableCustomRecipient, updateSwapRawState, updateLimitOrdersRawState, updateAdvancedOrdersRawState])

  return null
}
```

The updater is the safety net that ensures `useQuoteParamsRecipient` (and any other code reading the raw recipient fields) never sees a stale value when the flag is on. Cleared on the *raw* state only — the `showRecipient` settings preference is preserved.

## Files touched

| File | Change |
|---|---|
| `libs/widget-lib/src/types.ts` | Add `disableCustomRecipient?: boolean` |
| `apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts` | OR `disableCustomRecipient` into bridging gate |
| `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts` | Early-return on flag |
| `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts` | New cases |
| `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx` | Split prop semantics |
| `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx` | Pass new props |
| `apps/cowswap-frontend/src/modules/yield/containers/YieldWidget/index.tsx` | Pass disabled |
| `apps/cowswap-frontend/src/modules/limitOrders/pure/Settings/LimitOrdersSettings.pure.tsx` | Add `disabled` prop |
| `apps/cowswap-frontend/src/modules/limitOrders/containers/SettingsWidget/index.tsx` | Read flag, pass through |
| `apps/cowswap-frontend/src/modules/advancedOrders/pure/Settings/AdvancedOrdersSettings.tsx` | Add `disabled` prop |
| `apps/cowswap-frontend/src/modules/advancedOrders/containers/AdvancedOrdersSettings/index.tsx` | Read flag, pass through |
| `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx` | **New** |
| `apps/cowswap-frontend/src/modules/injectedWidget/index.ts` | Export new updater |
| `apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx` | Mount new updater next to `WidgetStandaloneModeUpdater` (line 105) |

## Testing

**Unit:**
- Extend `useWithRecipient.test.ts` — flag-on returns `false` even when `showRecipient=true`, `isNonEvmBridging=true`, or URL recipient is present.
- Test the new updater — when flag is on, all three raw setters get called with `{recipient: undefined, recipientAddress: undefined}`; when off, none called.

**Manual** (via widget configurator):
- Toggle the new param and walk through swap / limit / TWAP:
  - Custom Recipient toggle appears greyed out in each settings dropdown.
  - Recipient input never renders.
  - Cross-chain swap options are gone.
  - Pre-existing stored recipient: set a recipient with flag off, flip the flag on, confirm input disappears and order receiver falls back to `account`.

**Type-level:** `pnpm typecheck` for cowswap-frontend and widget-lib.

## Out of scope

- Surfacing the new param in the widget configurator UI (separate, optional follow-up).
- Migrating any docs/tutorials that mention custom recipient (separate doc PR if needed).
- Cleaning up `showRecipient` from settings state — preserved by design.
