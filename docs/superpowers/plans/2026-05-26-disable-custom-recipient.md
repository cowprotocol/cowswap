# Disable Custom Recipient Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `disableCustomRecipient` widget param that, when true, suppresses the Custom Recipient feature across swap/limit/TWAP and forces cross-chain swap off.

**Architecture:** Wire the new flag through `useInjectedWidgetParams()` at three chokepoints (settings UI per widget, recipient-visibility hook, bridging gate) plus a new updater that clears persisted recipient state. We split the existing `isRecipientToggleDisabled` prop semantics into "disabled" + "forced-on" so the new flag can hide-and-uncheck the toggle, while the existing non-EVM bridging case (lock-on) keeps working.

**Tech Stack:** TypeScript, React, Jotai, Jest, Lingui (`t``) for strings.

**Reference spec:** `docs/superpowers/specs/2026-05-26-disable-custom-recipient-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `libs/widget-lib/src/types.ts` | Modify | Add `disableCustomRecipient?: boolean` to `CowSwapWidgetAppParams` |
| `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts` | Modify | Early-return `false` when flag is on |
| `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts` | Modify | Cover new flag branch |
| `apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts` | Modify | OR flag into bridging gate |
| `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx` | Modify | Split prop semantics: `isRecipientToggleDisabled` (interaction) vs `isRecipientToggleForcedOn` (visual locked-on) |
| `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx` | Modify | Pass new props using flag |
| `apps/cowswap-frontend/src/modules/yield/containers/YieldWidget/index.tsx` | Modify | Pass `isRecipientToggleDisabled` using flag |
| `apps/cowswap-frontend/src/modules/limitOrders/pure/Settings/LimitOrdersSettings.pure.tsx` | Modify | Add `disabled?: boolean` prop, apply to toggle |
| `apps/cowswap-frontend/src/modules/limitOrders/containers/SettingsWidget/index.tsx` | Modify | Read flag, pass through |
| `apps/cowswap-frontend/src/modules/advancedOrders/pure/Settings/AdvancedOrdersSettings.tsx` | Modify | Add `disabled?: boolean` prop, apply to toggle |
| `apps/cowswap-frontend/src/modules/advancedOrders/containers/AdvancedOrdersSettings/index.tsx` | Modify | Read flag, pass through |
| `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx` | Create | Clear persisted recipient/recipientAddress reactively when flag is on |
| `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx` | Create | Unit tests for the updater |
| `apps/cowswap-frontend/src/modules/injectedWidget/index.ts` | Modify | Re-export new updater |
| `apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx` | Modify | Mount the new updater |

---

## Task 1: Public type — add `disableCustomRecipient` to widget-lib

**Files:**
- Modify: `libs/widget-lib/src/types.ts`

- [ ] **Step 1: Add the field next to `disableCrossChainSwap`**

Open `libs/widget-lib/src/types.ts`. Locate the block at line 367-371:

```ts
  /**
   * Disables cross-chain swaps (bridging)
   * Defaults to false.
   */
  disableCrossChainSwap?: boolean
```

Insert this block directly after it (before `disableTokenImport`):

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

- [ ] **Step 2: Typecheck**

Run: `pnpm -w nx run widget-lib:typecheck` (or `pnpm typecheck` at repo root if that's the convention you see in `package.json` scripts).
Expected: PASS, no errors.

- [ ] **Step 3: Commit**

```bash
git add libs/widget-lib/src/types.ts
git commit -m "feat(widget-lib): add disableCustomRecipient param"
```

---

## Task 2: Recipient-visibility hook — early-return on flag

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts`
- Test: `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts`

- [ ] **Step 1: Add failing tests for the flag**

Open `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts`. At the top, add to the existing mocks block:

```ts
jest.mock('modules/injectedWidget', () => ({ useInjectedWidgetParams: jest.fn() }))
```

Also add the import (top of file, alongside other imports):

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'
```

Add this typed accessor below the existing `mock...` const declarations:

```ts
const mockInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
```

In `setup()`, add a new optional arg and default the mock:

```ts
function setup({
  isWrapOrUnwrap = false,
  isNonEvmBridging = false,
  recipientInUrl = null as string | null,
  disableCustomRecipient = false,
} = {}): void {
  mockIsWrapOrUnwrap.mockReturnValue(isWrapOrUnwrap)
  mockIsNonEvmBridging.mockReturnValue(isNonEvmBridging)
  mockTradeStateFromUrl.mockReturnValue(
    recipientInUrl ? ({ recipient: recipientInUrl } as ReturnType<typeof useTradeStateFromUrl>) : null,
  )
  mockInjectedWidgetParams.mockReturnValue({ disableCustomRecipient })
}
```

Add this new `describe` block at the end of the outer `describe('useIsWithRecipient', ...)`:

```ts
  describe('disableCustomRecipient flag — overrides everything', () => {
    it('hides when toggle is on', () => {
      setup({ disableCustomRecipient: true })
      expect(render(true)).toBe(false)
    })

    it('hides for non-EVM bridging', () => {
      setup({ disableCustomRecipient: true, isNonEvmBridging: true })
      expect(render(false)).toBe(false)
    })

    it('hides even when URL has recipient', () => {
      setup({ disableCustomRecipient: true, recipientInUrl: '0xrecipient' })
      expect(render(true)).toBe(false)
    })
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm -w jest apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts -t "disableCustomRecipient"`
Expected: 3 tests FAIL (either due to missing mock or `disableCustomRecipient` not affecting return value).

- [ ] **Step 3: Implement the early-return**

Open `apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts`. Replace the entire file with:

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

/**
 * Returns whether the recipient input should be shown.
 *
 * Rules:
 * - Always hidden when the embedder sets `disableCustomRecipient`
 * - Always shown for non-EVM bridging (SOL, BTC, etc.) — toggle is locked
 * - Always shown when a recipient is set in the URL
 * - Shown when the user explicitly enabled the toggle — regardless of wallet state
 * - Never shown during wrap/unwrap flows
 * - Does NOT depend on EOA vs SC wallet
 */
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

- [ ] **Step 4: Run all tests in the file to verify pass**

Run: `pnpm -w jest apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts`
Expected: All tests PASS (existing + the 3 new ones).

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.ts \
        apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts
git commit -m "feat(trade): hide recipient input when disableCustomRecipient is set"
```

---

## Task 3: Bridging gate — force-off when flag is on

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts`

- [ ] **Step 1: Add the flag to destructure and bridging gate**

Open `apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts`. Replace line 19:

```ts
  const { disableCrossChainSwap = false } = useInjectedWidgetParams()
```

with:

```ts
  const { disableCrossChainSwap = false, disableCustomRecipient = false } = useInjectedWidgetParams()
```

Replace lines 27-28:

```ts
  const shouldEnableBridging =
    isSwapOrHooksPage && !disableCrossChainSwap && shouldEnableInWidgetSafe && hasBridgeProviders
```

with:

```ts
  const shouldEnableBridging =
    isSwapOrHooksPage &&
    !disableCrossChainSwap &&
    !disableCustomRecipient &&
    shouldEnableInWidgetSafe &&
    hasBridgeProviders
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/bridge/updaters/BridgingEnabledUpdater.ts
git commit -m "feat(bridge): disable bridging when disableCustomRecipient is set"
```

---

## Task 4: SettingsDropdown — split prop semantics

The current `isRecipientToggleDisabled` both disables interaction and forces the toggle visually checked (for the non-EVM bridging case). We split that into two separate props: `isRecipientToggleDisabled` keeps controlling interaction, and a new `isRecipientToggleForcedOn` controls the visual locked-on.

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx`

- [ ] **Step 1: Update the props interface and render**

Open `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx`.

Replace the interface (around lines 24-31):

```ts
interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
  enablePartialApprovalState?: StatefulValue<boolean> | [null, null]
  isRecipientToggleDisabled?: boolean
}
```

with:

```ts
interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
  enablePartialApprovalState?: StatefulValue<boolean> | [null, null]
  /** Disables interaction with the Custom Recipient toggle. */
  isRecipientToggleDisabled?: boolean
  /** Visually forces the toggle to checked. Used by non-EVM bridging to lock the toggle on. */
  isRecipientToggleForcedOn?: boolean
}
```

Replace the destructure (around lines 34-41):

```ts
export function SettingsDropdown({
  className,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
  isRecipientToggleDisabled = false,
}: SettingsTabProps): ReactNode {
```

with:

```ts
export function SettingsDropdown({
  className,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
  isRecipientToggleDisabled = false,
  isRecipientToggleForcedOn = false,
}: SettingsTabProps): ReactNode {
```

Replace the `<SettingsBox id="toggle-recipient-mode-button" ...>` block (around lines 94-106) so the `checked` expression uses the new prop:

```tsx
                <SettingsBox
                  id="toggle-recipient-mode-button"
                  title={t`Custom Recipient`}
                  tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
                  checked={isRecipientToggleForcedOn || (recipientToggleVisible && !isRecipientToggleDisabled)}
                  toggle={toggleRecipientVisibility}
                  disabled={isRecipientToggleDisabled}
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.RECIPIENT_ADDRESS,
                    action: 'Toggle Recipient Address',
                    label: recipientToggleVisible ? 'Enabled' : 'Disabled',
                  })}
                />
```

The truth table:

| `isRecipientToggleForcedOn` | `isRecipientToggleDisabled` | `recipientToggleVisible` | `checked` |
|---|---|---|---|
| true (bridging) | true | any | true |
| false (flag on) | true | any | false |
| false (normal) | false | true | true |
| false (normal) | false | false | false |

- [ ] **Step 2: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: FAIL — `SwapWidget` (Task 5) still passes only the old prop name and that is fine, but check that nothing else mis-uses the prop. If only SwapWidget is flagged for missing `isRecipientToggleForcedOn`, that's expected — it's optional now and defaults to `false`. PASS overall.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx
git commit -m "refactor(tradeWidgetAddons): split recipient toggle disabled/forced-on semantics"
```

---

## Task 5: SwapWidget — pass new props with flag

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx`

- [ ] **Step 1: Read the flag and pass it through**

Open `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx`.

Inside `SwapWidget`, near where other hooks are called (around line 70 with `isRecipientRequired`), add:

```ts
  const { disableCustomRecipient } = useInjectedWidgetParams()
```

Make sure `useInjectedWidgetParams` is imported at the top of the file:

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'
```

(Check the imports first — if it's not already there, add it; if it is, no change needed.)

Replace the `<SettingsTab ...>` block (around lines 202-210):

```tsx
    settingsWidget: (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        hooksEnabledState={hooksEnabledState}
        deadlineState={deadlineState}
        enablePartialApprovalState={enablePartialApprovalState}
        isRecipientToggleDisabled={isRecipientRequired}
      />
    ),
```

with:

```tsx
    settingsWidget: (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        hooksEnabledState={hooksEnabledState}
        deadlineState={deadlineState}
        enablePartialApprovalState={enablePartialApprovalState}
        isRecipientToggleDisabled={isRecipientRequired || !!disableCustomRecipient}
        isRecipientToggleForcedOn={isRecipientRequired}
      />
    ),
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx
git commit -m "feat(swap): disable recipient toggle when disableCustomRecipient is set"
```

---

## Task 6: YieldWidget — pass disabled prop

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/yield/containers/YieldWidget/index.tsx`

- [ ] **Step 1: Read the flag and pass it through**

Open `apps/cowswap-frontend/src/modules/yield/containers/YieldWidget/index.tsx`.

In the function body (near where `recipientToggleState` is set up around line 74), add:

```ts
  const { disableCustomRecipient } = useInjectedWidgetParams()
```

Make sure `useInjectedWidgetParams` is imported at the top:

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'
```

Replace the `settingsWidget` line (around line 188):

```tsx
    settingsWidget: <SettingsTab recipientToggleState={recipientToggleState} deadlineState={deadlineState} />,
```

with:

```tsx
    settingsWidget: (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        deadlineState={deadlineState}
        isRecipientToggleDisabled={!!disableCustomRecipient}
      />
    ),
```

- [ ] **Step 2: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/cowswap-frontend/src/modules/yield/containers/YieldWidget/index.tsx
git commit -m "feat(yield): disable recipient toggle when disableCustomRecipient is set"
```

---

## Task 7: LimitOrders settings — add `disabled` prop and wire flag

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/limitOrders/pure/Settings/LimitOrdersSettings.pure.tsx`
- Modify: `apps/cowswap-frontend/src/modules/limitOrders/containers/SettingsWidget/index.tsx`

- [ ] **Step 1: Add `disabled` to the pure component**

Open `apps/cowswap-frontend/src/modules/limitOrders/pure/Settings/LimitOrdersSettings.pure.tsx`.

Replace the props interface (lines 21-24):

```ts
export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: LimitOrdersSettingsState) => void
}
```

with:

```ts
export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: LimitOrdersSettingsState) => void
  isRecipientToggleDisabled?: boolean
}
```

Replace the function signature (line 28):

```ts
export function LimitOrdersSettingsDropdown({ state, onStateChanged }: SettingsProps): ReactNode {
```

with:

```ts
export function LimitOrdersSettingsDropdown({
  state,
  onStateChanged,
  isRecipientToggleDisabled = false,
}: SettingsProps): ReactNode {
```

Replace the Custom Recipient `<SettingsBox ...>` (lines 97-102):

```tsx
            <SettingsBox
              title={t`Custom Recipient`}
              tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
              checked={showRecipient}
              toggle={handleRecipientToggle}
            />
```

with:

```tsx
            <SettingsBox
              title={t`Custom Recipient`}
              tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
              checked={showRecipient && !isRecipientToggleDisabled}
              toggle={handleRecipientToggle}
              disabled={isRecipientToggleDisabled}
            />
```

- [ ] **Step 2: Pass the flag from the container**

Open `apps/cowswap-frontend/src/modules/limitOrders/containers/SettingsWidget/index.tsx`.

Add the import at the top (alongside the other imports):

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'
```

Inside `SettingsWidget`, near the top of the function (around line 27 after `isSettingsDisabled`), add:

```ts
  const { disableCustomRecipient } = useInjectedWidgetParams()
```

Replace the `<LimitOrdersSettingsDropdown ...>` JSX (line 53):

```tsx
                <LimitOrdersSettingsDropdown state={settingsState} onStateChanged={onSettingsChange} />
```

with:

```tsx
                <LimitOrdersSettingsDropdown
                  state={settingsState}
                  onStateChanged={onSettingsChange}
                  isRecipientToggleDisabled={!!disableCustomRecipient}
                />
```

- [ ] **Step 3: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/limitOrders/pure/Settings/LimitOrdersSettings.pure.tsx \
        apps/cowswap-frontend/src/modules/limitOrders/containers/SettingsWidget/index.tsx
git commit -m "feat(limit): disable recipient toggle when disableCustomRecipient is set"
```

---

## Task 8: AdvancedOrders settings — add `disabled` prop and wire flag

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/advancedOrders/pure/Settings/AdvancedOrdersSettings.tsx`
- Modify: `apps/cowswap-frontend/src/modules/advancedOrders/containers/AdvancedOrdersSettings/index.tsx`

- [ ] **Step 1: Add `disabled` to the pure component**

Open `apps/cowswap-frontend/src/modules/advancedOrders/pure/Settings/AdvancedOrdersSettings.tsx`.

Replace the props interface (lines 18-21):

```ts
export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
}
```

with:

```ts
export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
  isRecipientToggleDisabled?: boolean
}
```

Replace the function signature (line 23):

```ts
export function AdvancedOrdersSettingsDropdown({ state, onStateChanged }: SettingsProps): ReactNode {
```

with:

```ts
export function AdvancedOrdersSettingsDropdown({
  state,
  onStateChanged,
  isRecipientToggleDisabled = false,
}: SettingsProps): ReactNode {
```

Replace the Custom Recipient `<SettingsBox ...>` (lines 34-39):

```tsx
        <SettingsBox
          title={t`Custom Recipient`}
          tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
          checked={showRecipient}
          toggle={() => onStateChanged({ showRecipient: !showRecipient })}
        />
```

with:

```tsx
        <SettingsBox
          title={t`Custom Recipient`}
          tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
          checked={showRecipient && !isRecipientToggleDisabled}
          toggle={() => onStateChanged({ showRecipient: !showRecipient })}
          disabled={isRecipientToggleDisabled}
        />
```

- [ ] **Step 2: Pass the flag from the container**

Open `apps/cowswap-frontend/src/modules/advancedOrders/containers/AdvancedOrdersSettings/index.tsx`.

Add the import at the top (alongside the other imports):

```ts
import { useInjectedWidgetParams } from 'modules/injectedWidget'
```

Inside `AdvancedOrdersSettings`, near the top (around line 37 after `isSettingsDisabled`), add:

```ts
  const { disableCustomRecipient } = useInjectedWidgetParams()
```

Replace the `<AdvancedOrdersSettingsDropdown ...>` JSX (line 58):

```tsx
              <AdvancedOrdersSettingsDropdown state={settingsState} onStateChanged={onStateChanged} />
```

with:

```tsx
              <AdvancedOrdersSettingsDropdown
                state={settingsState}
                onStateChanged={onStateChanged}
                isRecipientToggleDisabled={!!disableCustomRecipient}
              />
```

- [ ] **Step 3: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/advancedOrders/pure/Settings/AdvancedOrdersSettings.tsx \
        apps/cowswap-frontend/src/modules/advancedOrders/containers/AdvancedOrdersSettings/index.tsx
git commit -m "feat(twap): disable recipient toggle when disableCustomRecipient is set"
```

---

## Task 9: New updater — reactively clear persisted recipient state

The updater subscribes to each trade module's raw state and clears `recipient`/`recipientAddress` whenever the flag is on. Reactive (not one-shot) so that even if the URL setter later writes recipient into raw state, our updater clears it on the next render.

**Files:**
- Create: `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx`
- Create: `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx`

- [ ] **Step 1: Add a `useSwapRawState` hook for symmetry with limit/advanced**

Open `apps/cowswap-frontend/src/modules/swap/hooks/useUpdateSwapRawState.ts`. Replace the entire file with:

```ts
import { useAtomValue, useSetAtom } from 'jotai'

import { swapRawStateAtom, updateSwapRawStateAtom } from '../state/swapRawStateAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateSwapRawState() {
  return useSetAtom(updateSwapRawStateAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwapRawState() {
  return useAtomValue(swapRawStateAtom)
}
```

- [ ] **Step 2: Write the failing test**

Create `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx`:

```tsx
import { render } from '@testing-library/react'

import { useAdvancedOrdersRawState, useUpdateAdvancedOrdersRawState } from 'modules/advancedOrders/hooks/useAdvancedOrdersRawState'
import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSwapRawState, useUpdateSwapRawState } from 'modules/swap/hooks/useUpdateSwapRawState'

import { useInjectedWidgetParams } from '../hooks/useInjectedWidgetParams'
import { DisableCustomRecipientUpdater } from './DisableCustomRecipient.updater'

jest.mock('../hooks/useInjectedWidgetParams', () => ({ useInjectedWidgetParams: jest.fn() }))
jest.mock('modules/swap/hooks/useUpdateSwapRawState', () => ({
  useSwapRawState: jest.fn(),
  useUpdateSwapRawState: jest.fn(),
}))
jest.mock('modules/limitOrders/hooks/useLimitOrdersRawState', () => ({
  useLimitOrdersRawState: jest.fn(),
  useUpdateLimitOrdersRawState: jest.fn(),
}))
jest.mock('modules/advancedOrders/hooks/useAdvancedOrdersRawState', () => ({
  useAdvancedOrdersRawState: jest.fn(),
  useUpdateAdvancedOrdersRawState: jest.fn(),
}))

const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUseSwapRawState = useSwapRawState as jest.MockedFunction<typeof useSwapRawState>
const mockUpdateSwap = jest.fn()
const mockUseLimitRawState = useLimitOrdersRawState as jest.MockedFunction<typeof useLimitOrdersRawState>
const mockUpdateLimit = jest.fn()
const mockUseAdvancedRawState = useAdvancedOrdersRawState as jest.MockedFunction<typeof useAdvancedOrdersRawState>
const mockUpdateAdvanced = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useUpdateSwapRawState as jest.Mock).mockReturnValue(mockUpdateSwap)
  ;(useUpdateLimitOrdersRawState as jest.Mock).mockReturnValue(mockUpdateLimit)
  ;(useUpdateAdvancedOrdersRawState as jest.Mock).mockReturnValue(mockUpdateAdvanced)
  mockUseSwapRawState.mockReturnValue({ recipient: null, recipientAddress: null } as never)
  mockUseLimitRawState.mockReturnValue({ recipient: null, recipientAddress: null } as never)
  mockUseAdvancedRawState.mockReturnValue({ recipient: null, recipientAddress: null } as never)
})

describe('DisableCustomRecipientUpdater', () => {
  it('does nothing when flag is off', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: false })
    mockUseSwapRawState.mockReturnValue({ recipient: '0xrec', recipientAddress: '0xrec' } as never)

    render(<DisableCustomRecipientUpdater />)

    expect(mockUpdateSwap).not.toHaveBeenCalled()
    expect(mockUpdateLimit).not.toHaveBeenCalled()
    expect(mockUpdateAdvanced).not.toHaveBeenCalled()
  })

  it('does nothing when flag is on but no recipients are set', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: true })

    render(<DisableCustomRecipientUpdater />)

    expect(mockUpdateSwap).not.toHaveBeenCalled()
    expect(mockUpdateLimit).not.toHaveBeenCalled()
    expect(mockUpdateAdvanced).not.toHaveBeenCalled()
  })

  it('clears swap raw state when flag is on and swap has recipient', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: true })
    mockUseSwapRawState.mockReturnValue({ recipient: '0xrec', recipientAddress: null } as never)

    render(<DisableCustomRecipientUpdater />)

    expect(mockUpdateSwap).toHaveBeenCalledWith({ recipient: undefined, recipientAddress: undefined })
  })

  it('clears swap raw state when flag is on and swap has recipientAddress', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: true })
    mockUseSwapRawState.mockReturnValue({ recipient: null, recipientAddress: '0xaddr' } as never)

    render(<DisableCustomRecipientUpdater />)

    expect(mockUpdateSwap).toHaveBeenCalledWith({ recipient: undefined, recipientAddress: undefined })
  })

  it('clears limit and advanced state independently', () => {
    mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: true })
    mockUseLimitRawState.mockReturnValue({ recipient: '0xlim', recipientAddress: null } as never)
    mockUseAdvancedRawState.mockReturnValue({ recipient: null, recipientAddress: '0xadv' } as never)

    render(<DisableCustomRecipientUpdater />)

    expect(mockUpdateSwap).not.toHaveBeenCalled()
    expect(mockUpdateLimit).toHaveBeenCalledWith({ recipient: undefined, recipientAddress: undefined })
    expect(mockUpdateAdvanced).toHaveBeenCalledWith({ recipient: undefined, recipientAddress: undefined })
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm -w jest apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx`
Expected: FAIL — file `DisableCustomRecipient.updater` doesn't exist.

- [ ] **Step 4: Implement the updater**

Create `apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx`:

```tsx
import { useEffect } from 'react'

import { useAdvancedOrdersRawState, useUpdateAdvancedOrdersRawState } from 'modules/advancedOrders/hooks/useAdvancedOrdersRawState'
import { useLimitOrdersRawState, useUpdateLimitOrdersRawState } from 'modules/limitOrders/hooks/useLimitOrdersRawState'
import { useSwapRawState, useUpdateSwapRawState } from 'modules/swap/hooks/useUpdateSwapRawState'

import { useInjectedWidgetParams } from '../hooks/useInjectedWidgetParams'

const CLEAR_PATCH = { recipient: undefined, recipientAddress: undefined }

/**
 * When the embedder sets `disableCustomRecipient`, the Custom Recipient feature
 * must be fully suppressed. The UI is hidden by `useIsWithRecipient` and the
 * settings toggles are disabled at each call site — but the persisted
 * `recipient`/`recipientAddress` values in swap/limit/TWAP raw state can still
 * reach the order receiver through `useQuoteParamsRecipient`.
 *
 * This updater reactively clears those fields whenever the flag is on,
 * defending against:
 *   - stale values persisted from a session before the flag was set,
 *   - URL params writing a recipient into raw state after mount,
 *   - any other code path that sets recipient while the flag is on.
 *
 * The `showRecipient` settings preference is intentionally NOT cleared, so
 * flipping the flag off restores the user's prior preference.
 */
export function DisableCustomRecipientUpdater(): null {
  const { disableCustomRecipient } = useInjectedWidgetParams()
  const swap = useSwapRawState()
  const limit = useLimitOrdersRawState()
  const advanced = useAdvancedOrdersRawState()
  const updateSwap = useUpdateSwapRawState()
  const updateLimit = useUpdateLimitOrdersRawState()
  const updateAdvanced = useUpdateAdvancedOrdersRawState()

  useEffect(() => {
    if (!disableCustomRecipient) return
    if (swap.recipient || swap.recipientAddress) updateSwap(CLEAR_PATCH)
  }, [disableCustomRecipient, swap.recipient, swap.recipientAddress, updateSwap])

  useEffect(() => {
    if (!disableCustomRecipient) return
    if (limit.recipient || limit.recipientAddress) updateLimit(CLEAR_PATCH)
  }, [disableCustomRecipient, limit.recipient, limit.recipientAddress, updateLimit])

  useEffect(() => {
    if (!disableCustomRecipient) return
    if (advanced.recipient || advanced.recipientAddress) updateAdvanced(CLEAR_PATCH)
  }, [disableCustomRecipient, advanced.recipient, advanced.recipientAddress, updateAdvanced])

  return null
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm -w jest apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx`
Expected: All 5 tests PASS.

- [ ] **Step 6: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.tsx \
        apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx \
        apps/cowswap-frontend/src/modules/swap/hooks/useUpdateSwapRawState.ts
git commit -m "feat(injectedWidget): clear persisted recipient when disableCustomRecipient is set"
```

---

## Task 10: Mount and export the new updater

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/injectedWidget/index.ts`
- Modify: `apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx`

- [ ] **Step 1: Re-export the updater**

Open `apps/cowswap-frontend/src/modules/injectedWidget/index.ts`. After line 3:

```ts
export { WidgetStandaloneModeUpdater } from './updaters/WidgetStandaloneMode.updater'
```

add:

```ts
export { DisableCustomRecipientUpdater } from './updaters/DisableCustomRecipient.updater'
```

- [ ] **Step 2: Mount the updater**

Open `apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx`.

Update the import at line 25:

```ts
import { CowEventsUpdater, InjectedWidgetUpdater, WidgetStandaloneModeUpdater } from 'modules/injectedWidget'
```

to:

```ts
import {
  CowEventsUpdater,
  DisableCustomRecipientUpdater,
  InjectedWidgetUpdater,
  WidgetStandaloneModeUpdater,
} from 'modules/injectedWidget'
```

Add the updater below the `WidgetStandaloneModeUpdater` (after line 105):

```tsx
      <WidgetStandaloneModeUpdater />
      <DisableCustomRecipientUpdater />
```

- [ ] **Step 3: Typecheck**

Run: `pnpm -w nx run cowswap-frontend:typecheck`
Expected: PASS.

- [ ] **Step 4: Run all touched tests**

Run:
```bash
pnpm -w jest apps/cowswap-frontend/src/modules/trade/hooks/useWithRecipient.test.ts \
             apps/cowswap-frontend/src/modules/injectedWidget/updaters/DisableCustomRecipient.updater.test.tsx
```
Expected: All PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/injectedWidget/index.ts \
        apps/cowswap-frontend/src/modules/application/containers/App/Updaters.tsx
git commit -m "feat(app): mount DisableCustomRecipientUpdater"
```

---

## Task 11: Manual verification in widget configurator

Type-level work is done. Verify behavior end-to-end before declaring complete.

- [ ] **Step 1: Start the configurator**

Run: `pnpm -w nx run widget-configurator:serve` (or the equivalent command the repo uses; check `apps/widget-configurator/project.json` if unclear).
Open the served URL in a browser.

- [ ] **Step 2: Temporarily add the flag to the configurator's widget params**

Locate where the configurator constructs `CowSwapWidgetParams` (likely `apps/widget-configurator/src/app/configurator/hooks/useWidgetParamsAndSettings.ts`). Add `disableCustomRecipient: true` to the params object **as a temporary local change** — do NOT commit. We just need a way to inject the flag.

- [ ] **Step 3: Walk through swap**

- Open the Swap widget.
- Open Settings → Confirm "Custom Recipient" toggle is **disabled (greyed out)** and **unchecked**.
- Confirm no recipient input row appears in the swap form (even if you had `showRecipient=true` in localStorage from a prior session).
- Confirm cross-chain swap options (bridging) are NOT available.

- [ ] **Step 4: Walk through limit**

- Open the Limit Orders widget.
- Open Settings → Confirm "Custom Recipient" toggle is disabled and unchecked.
- Confirm no recipient input row appears.

- [ ] **Step 5: Walk through TWAP**

- Open the TWAP widget.
- Open Settings → Confirm "Custom Recipient" toggle is disabled and unchecked.
- Confirm no recipient input row appears.

- [ ] **Step 6: Stale-state cleanup verification**

- Reset the temporary configurator change so `disableCustomRecipient` is false.
- Reload, open swap, enable Custom Recipient in settings, enter a recipient address. Place no order.
- Re-enable `disableCustomRecipient: true` in the configurator, reload.
- Open the swap page → confirm the recipient input is gone and that an order built right now would use the connected `account` as receiver (you can inspect `useQuoteParamsRecipient` via a console log if needed; the simpler check is to look at the order preview / confirmation modal "Receiver" line and confirm it matches the connected wallet).

- [ ] **Step 7: Revert local-only configurator change**

`git checkout` the configurator file you temporarily edited. The plan does not include surfacing this flag in the configurator UI — that is intentionally out of scope (per the spec).

- [ ] **Step 8: Final clean-build check**

Run:
```bash
pnpm -w nx run cowswap-frontend:typecheck
pnpm -w nx run widget-lib:typecheck
```
Expected: Both PASS.

- [ ] **Step 9: Tag for review**

No commit (no changes left). Mark this task complete and proceed to opening a PR / requesting review.

---

## Notes for the implementer

- This codebase uses Nx + pnpm. If `pnpm -w nx run <project>:typecheck` isn't what your repo uses, check `package.json` / `nx.json` for the actual script name (`pnpm typecheck`, `pnpm -w typecheck`, etc.).
- Lingui translations: `t\`Custom Recipient\`` is already in the catalogs because the strings exist in the codebase today. No catalog updates needed.
- The non-EVM bridging case (`isRecipientRequired`) won't engage in practice when `disableCustomRecipient` is on (Task 3 forces bridging off), but the UI prop-split is correct independent of that runtime invariant.
- `showRecipient` settings state is intentionally preserved (not cleared by the updater) — that way an embedder turning the flag off restores the user's prior preference.
