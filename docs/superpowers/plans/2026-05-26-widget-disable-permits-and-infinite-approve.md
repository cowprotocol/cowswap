# Widget params `disableEIP2612Permits` and `disableInfiniteApprove` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two boolean widget params: `disableEIP2612Permits` (force on-chain approves only) and `disableInfiniteApprove` (force trade-size approvals and lock the UI toggle).

**Architecture:** Read each new param at the lowest-level hook that influences the behavior. `useIsPermitEnabled` is patched so anything downstream (token permit support, hooks-store permit tile) is gated. A new `useIsInfiniteApproveDisabled` hook is consumed at the two approve-amount branches and the partial-approve atoms updater, and the Settings dropdown receives a `partialApprovalLocked` flag that locks the existing `SettingsBox` toggle.

**Tech Stack:** TypeScript, React, jotai, Jest, @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-05-26-widget-disable-permits-and-infinite-approve-design.md`

## File Map

Create:
- `apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts`
- `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.test.ts`

Modify:
- `libs/widget-lib/src/types.ts`
- `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts`
- `apps/cowswap-frontend/src/modules/injectedWidget/index.ts`
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.tsx`
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.test.ts`
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx`
- `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.test.ts`
- `apps/cowswap-frontend/src/modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx`
- `apps/cowswap-frontend/src/modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx`
- `apps/cowswap-frontend/src/modules/erc20Approve/pure/Toggle/Toggle.tsx`
- `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx`
- `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx`

Task order is bottom-up: type → lowest-level gates → tests → UI wiring. Each task ends with its own commit.

---

### Task 1: Add the two params to `CowSwapWidgetParams`

**Files:**
- Modify: `libs/widget-lib/src/types.ts`

- [ ] **Step 1: Add the type fields**

Open `libs/widget-lib/src/types.ts` and find the existing `disablePostedOrderConfirmationModal?: boolean` declaration (around line 382). Add the two new fields immediately above it so they sit with the other `disable*` flags:

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

- [ ] **Step 2: Verify the widget-lib still type-checks**

Run from repo root:

```bash
npx nx run widget-lib:typecheck
```

Expected: pass with no errors.

If `nx run widget-lib:typecheck` is not a valid target on this branch, fall back to:

```bash
yarn nx run-many --target=typecheck --projects=widget-lib
```

- [ ] **Step 3: Commit**

```bash
git add libs/widget-lib/src/types.ts
git commit -m "feat(widget-lib): add disableEIP2612Permits and disableInfiniteApprove params"
```

---

### Task 2: Gate `useIsPermitEnabled` on `disableEIP2612Permits`

**Files:**
- Modify: `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts`
- Create: `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.test.ts`
- Test: `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.test.ts`

- [ ] **Step 1: Write the failing test file**

Create `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.test.ts`:

```ts
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { useIsPermitEnabled } from './useIsPermitEnabled'

jest.mock('@cowprotocol/wallet', () => ({
  useIsSmartContractWallet: jest.fn(),
}))

jest.mock('modules/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

const mockUseIsSmartContractWallet = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>

describe('useIsPermitEnabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseInjectedWidgetParams.mockReturnValue({})
  })

  it('returns true for EOA wallets when the widget param is unset', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(true)
  })

  it('returns false for smart-contract wallets even when the widget param is unset', () => {
    mockUseIsSmartContractWallet.mockReturnValue(true)

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns false when disableEIP2612Permits is true, even for EOA wallets', () => {
    mockUseIsSmartContractWallet.mockReturnValue(false)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: true })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })

  it('returns false when disableEIP2612Permits is true and wallet is a smart contract', () => {
    mockUseIsSmartContractWallet.mockReturnValue(true)
    mockUseInjectedWidgetParams.mockReturnValue({ disableEIP2612Permits: true })

    const { result } = renderHook(() => useIsPermitEnabled())

    expect(result.current).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```bash
yarn nx test cowswap-frontend --testPathPattern=useIsPermitEnabled
```

Expected: tests fail because `useIsPermitEnabled` does not yet read `useInjectedWidgetParams`.

- [ ] **Step 3: Update the hook implementation**

Replace the contents of `apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts` with:

```ts
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

export function useIsPermitEnabled(): boolean {
  const { disableEIP2612Permits } = useInjectedWidgetParams()
  const isEoa = useIsSmartContractWallet() === false

  if (disableEIP2612Permits) return false
  // Permit is only available for EOAs
  return isEoa
}
```

Both hooks are read unconditionally before the branch, so hook order stays stable.

- [ ] **Step 4: Run the test and confirm it passes**

```bash
yarn nx test cowswap-frontend --testPathPattern=useIsPermitEnabled
```

Expected: all four tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.ts \
        apps/cowswap-frontend/src/common/hooks/featureFlags/useIsPermitEnabled.test.ts
git commit -m "feat(permit): honor widget disableEIP2612Permits in useIsPermitEnabled"
```

---

### Task 3: Add the `useIsInfiniteApproveDisabled` hook

**Files:**
- Create: `apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts`
- Modify: `apps/cowswap-frontend/src/modules/injectedWidget/index.ts`

- [ ] **Step 1: Create the hook**

Create `apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts`:

```ts
import { useInjectedWidgetParams } from './useInjectedWidgetParams'

export function useIsInfiniteApproveDisabled(): boolean {
  return Boolean(useInjectedWidgetParams().disableInfiniteApprove)
}
```

- [ ] **Step 2: Re-export from the module index**

Open `apps/cowswap-frontend/src/modules/injectedWidget/index.ts` and add the export next to the other hook exports (after the `useInjectedWidgetParams` line):

```ts
export { useIsInfiniteApproveDisabled } from './hooks/useIsInfiniteApproveDisabled'
```

- [ ] **Step 3: Typecheck**

```bash
yarn nx run cowswap-frontend:typecheck
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/injectedWidget/hooks/useIsInfiniteApproveDisabled.ts \
        apps/cowswap-frontend/src/modules/injectedWidget/index.ts
git commit -m "feat(injectedWidget): add useIsInfiniteApproveDisabled hook"
```

---

### Task 4: Wire `disableInfiniteApprove` into `useApproveAndSwap`

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.tsx`
- Test: `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.test.ts`

- [ ] **Step 1: Add the failing tests**

Open `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.test.ts`.

Add two imports near the existing imports (keep groupings consistent with the file's import style):

```ts
import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
```

Add a jest mock alongside the existing ones (near `jest.mock('../state')`):

```ts
jest.mock('modules/injectedWidget', () => ({
  useIsInfiniteApproveDisabled: jest.fn(),
}))
```

Add the typed mock alongside the other typed mocks:

```ts
const mockUseIsInfiniteApproveDisabled = useIsInfiniteApproveDisabled as jest.MockedFunction<
  typeof useIsInfiniteApproveDisabled
>
```

Inside the existing `beforeEach`, add a default after the existing default-mocks:

```ts
    mockUseIsInfiniteApproveDisabled.mockReturnValue(false)
```

Add a new `describe` block at the bottom of the `describe('useApproveAndSwap', () => {` body, before its closing brace:

```ts
  describe('disableInfiniteApprove widget param', () => {
    it('approves the exact trade-size amount when disableInfiniteApprove is true and user toggle is off', async () => {
      mockUseIsInfiniteApproveDisabled.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
      const mockTxReceipt = createMockTransactionReceipt()
      const mockResult: TradeApproveResult<ApprovalTxReceipt> = {
        txResponse: mockTxReceipt,
        approvedAmount: mockAmount,
      }
      mockHandleApprove.mockResolvedValue(mockResult)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockHandleApprove).toHaveBeenCalledWith(mockAmount)
      })
    })

    it('still uses the permit flow when disableInfiniteApprove is true but permits are supported', async () => {
      mockUseIsInfiniteApproveDisabled.mockReturnValue(true)
      mockUseTokenSupportsPermit.mockReturnValue(true)
      mockGeneratePermitToTrade.mockResolvedValue(true)

      const { result } = renderHook(
        () =>
          useApproveAndSwap({
            amountToApprove: mockAmountToApprove,
            onApproveConfirm: mockOnApproveConfirm,
            ignorePermit: false,
            useModals: true,
          }),
        { wrapper: LinguiWrapper },
      )

      await result.current()

      await waitFor(() => {
        expect(mockGeneratePermitToTrade).toHaveBeenCalled()
        expect(mockHandleApprove).not.toHaveBeenCalled()
      })
    })
  })
```

- [ ] **Step 2: Run the new tests and confirm they fail**

```bash
yarn nx test cowswap-frontend --testPathPattern=useApproveAndSwap
```

Expected: the new tests in `disableInfiniteApprove widget param` fail (first one fails because `handleApprove` is called with `MAX_APPROVE_AMOUNT`, not `mockAmount`).

- [ ] **Step 3: Update the hook to honor the flag**

Open `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.tsx`. Add an import (group with other module imports):

```ts
import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
```

Inside `useApproveAndSwap`, read the flag right after `isPartialApproveEnabledByUser`:

```ts
  const isPartialApproveEnabledByUser = useIsPartialApproveSelectedByUser()
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()
```

Thread it into the returned callback (it's a downstream `useCallback` so add a dep) and into `approveAndSwap`:

```ts
  return useCallback(async (): Promise<void> => {
    if (!account || !tradeSpenderAddress) return

    const isPermitFlow = await handlePermit()

    if (isPermitFlow) {
      return
    }

    await approveAndSwap({
      amountToApprove,
      onApproveConfirm,
      minAmountToSignForSwap,
      isPartialApproveEnabledByUser,
      isInfiniteApproveDisabled,
      handleApprove,
      updateTradeApproveState,
    })
  }, [
    handlePermit,
    amountToApprove,
    isPartialApproveEnabledByUser,
    isInfiniteApproveDisabled,
    handleApprove,
    onApproveConfirm,
    updateTradeApproveState,
    minAmountToSignForSwap,
    account,
    tradeSpenderAddress,
  ])
```

Extend the context interface and the helper:

```ts
interface ApproveAndSwapContext {
  amountToApprove: CurrencyAmount<Currency>
  minAmountToSignForSwap?: CurrencyAmount<Currency>
  onApproveConfirm?: (transactionHash: string | null) => void
  isPartialApproveEnabledByUser?: boolean
  isInfiniteApproveDisabled?: boolean
  handleApprove: ApproveCurrencyCallback
  updateTradeApproveState: UpdateApproveProgressModalState
}

async function approveAndSwap({
  amountToApprove,
  onApproveConfirm,
  minAmountToSignForSwap,
  isPartialApproveEnabledByUser,
  isInfiniteApproveDisabled,
  handleApprove,
  updateTradeApproveState,
}: ApproveAndSwapContext): Promise<void> {
  const amountToApproveBig = BigInt(amountToApprove.quotient.toString())
  const usePartial = isPartialApproveEnabledByUser || isInfiniteApproveDisabled
  const toApprove = usePartial ? amountToApproveBig : MAX_APPROVE_AMOUNT
  const tx = await handleApprove(toApprove)
  // ...rest of the function unchanged...
```

Leave the rest of `approveAndSwap` untouched.

- [ ] **Step 4: Run the test suite and confirm it passes**

```bash
yarn nx test cowswap-frontend --testPathPattern=useApproveAndSwap
```

Expected: all tests (existing + 2 new) pass.

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.tsx \
        apps/cowswap-frontend/src/modules/erc20Approve/hooks/useApproveAndSwap.test.ts
git commit -m "feat(erc20Approve): use trade-size approve when disableInfiniteApprove is set"
```

---

### Task 5: Wire `disableInfiniteApprove` into `useGetAmountToSignApprove`

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx`
- Test: `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.test.ts`

- [ ] **Step 1: Add the failing test**

Open `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.test.ts`.

Add the import near the existing imports:

```ts
import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
```

Add a mock and a typed handle:

```ts
jest.mock('modules/injectedWidget', () => ({
  useIsInfiniteApproveDisabled: jest.fn(),
}))

const mockUseIsInfiniteApproveDisabled = useIsInfiniteApproveDisabled as jest.MockedFunction<
  typeof useIsInfiniteApproveDisabled
>
```

In `beforeEach`, default the new mock to `false`:

```ts
    mockUseIsInfiniteApproveDisabled.mockReturnValue(false)
```

Add a new `describe` block at the end of `describe('useGetAmountToSignApprove', () => {` body, before its closing brace:

```ts
  describe('disableInfiniteApprove widget param', () => {
    it('returns the partial amount even when user has not opted in and settings are disabled', () => {
      mockUseNeedsApproval.mockReturnValue(true)
      mockUseIsPartialApproveSelectedByUser.mockReturnValue(false)
      mockUseAtomValue.mockReturnValue(false)
      mockUseIsInfiniteApproveDisabled.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockPartialAmount)
    })

    it('still returns zero when approval is not needed, even if disableInfiniteApprove is true', () => {
      mockUseNeedsApproval.mockReturnValue(false)
      mockUseIsInfiniteApproveDisabled.mockReturnValue(true)

      const { result } = renderHook(() => useGetAmountToSignApprove())

      expect(result.current).toEqual(mockZeroAmount)
    })
  })
```

- [ ] **Step 2: Run and confirm the new tests fail**

```bash
yarn nx test cowswap-frontend --testPathPattern=useGetAmountToSignApprove
```

Expected: the first new test fails — current behavior returns `mockMaxAmount` when user has not opted in.

- [ ] **Step 3: Update the hook implementation**

Open `apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx`.

Add an import:

```ts
import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
```

Update the hook body:

```ts
export function useGetAmountToSignApprove(): CurrencyAmount<Currency> | null {
  const partialAmountToSign = useGetPartialAmountToSignApprove()
  const isApprovalNeeded = useNeedsApproval(partialAmountToSign)
  const isPartialApprovalSelectedByUser = useIsPartialApproveSelectedByUser()
  const isPartialApprovalEnabledInSettings = useIsPartialApprovalModeSelected()
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()

  return useMemo(() => {
    if (!partialAmountToSign) return null

    if (!isApprovalNeeded) return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, '0')

    if (isInfiniteApproveDisabled) {
      return partialAmountToSign
    }

    if (isPartialApprovalSelectedByUser && isPartialApprovalEnabledInSettings) {
      return partialAmountToSign
    }

    return CurrencyAmount.fromRawAmount(partialAmountToSign.currency, MAX_APPROVE_AMOUNT.toString())
  }, [
    partialAmountToSign,
    isApprovalNeeded,
    isPartialApprovalSelectedByUser,
    isPartialApprovalEnabledInSettings,
    isInfiniteApproveDisabled,
  ])
}
```

- [ ] **Step 4: Run and confirm all tests pass**

```bash
yarn nx test cowswap-frontend --testPathPattern=useGetAmountToSignApprove
```

Expected: all tests pass (existing + 2 new).

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.tsx \
        apps/cowswap-frontend/src/modules/erc20Approve/hooks/useGetAmountToSignApprove.test.ts
git commit -m "feat(erc20Approve): force partial amount-to-sign when disableInfiniteApprove is set"
```

---

### Task 6: Force partial-approve atoms in `Erc20ApproveWidget`

This ensures the per-trade toggle starts at `true` and the settings toggle is forced "on" while the widget flag is set, so the rest of the UI (modal labels etc.) stays consistent with the new behavior.

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx`

- [ ] **Step 1: Update the updater**

Open `apps/cowswap-frontend/src/modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx`. Replace its contents with:

```tsx
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { isSellOrder } from '@cowprotocol/common-utils'

import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
import { useDerivedTradeState } from 'modules/trade'

import { useSetUserApproveAmountModalState } from '../../state'
import { isPartialApproveEnabledAtom } from '../../state/isPartialApproveEnabledAtom'
import { isPartialApproveSelectedByUserAtom } from '../../state/isPartialApproveSelectedByUserAtom'

interface Erc20ApproveProps {
  isPartialApprovalEnabled: boolean
}

export function Erc20ApproveWidget({ isPartialApprovalEnabled }: Erc20ApproveProps): null {
  const setIsPartialApproveEnabled = useSetAtom(isPartialApproveEnabledAtom)
  const setIsPartialApproveSelectedByUser = useSetAtom(isPartialApproveSelectedByUserAtom)
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useDerivedTradeState() || {}
  const setUserApproveAmountModalState = useSetUserApproveAmountModalState()

  const targetAmount =
    inputCurrencyAmount &&
    outputCurrencyAmount &&
    orderKind &&
    (isSellOrder(orderKind) ? inputCurrencyAmount : outputCurrencyAmount)
  const targetAmountRaw = targetAmount?.quotient.toString()

  // Reset custom amount every time sell/but amount changes
  useEffect(() => {
    setUserApproveAmountModalState({ amountSetByUser: undefined })
  }, [targetAmountRaw, setUserApproveAmountModalState])

  // Store isPartialApprovalEnabled to local state to avoid DIP breach (erc20Approve module should not depend on Swap).
  // When the widget integrator sets disableInfiniteApprove, partial approval is forced on regardless of settings.
  useEffect(() => {
    setIsPartialApproveEnabled(isPartialApprovalEnabled || isInfiniteApproveDisabled)
  }, [setIsPartialApproveEnabled, isPartialApprovalEnabled, isInfiniteApproveDisabled])

  // Same for the per-trade user selection: locked on while the widget integrator disables infinite approve.
  useEffect(() => {
    if (isInfiniteApproveDisabled) {
      setIsPartialApproveSelectedByUser(true)
    }
  }, [isInfiniteApproveDisabled, setIsPartialApproveSelectedByUser])

  return null
}
```

- [ ] **Step 2: Typecheck**

```bash
yarn nx run cowswap-frontend:typecheck
```

Expected: pass.

- [ ] **Step 3: Run the full erc20Approve test scope to confirm no regressions**

```bash
yarn nx test cowswap-frontend --testPathPattern=erc20Approve
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/erc20Approve/containers/Erc20ApproveWidget/index.tsx
git commit -m "feat(erc20Approve): force partial-approve atoms when disableInfiniteApprove is set"
```

---

### Task 7: Add a `disabled` prop to the `Toggle` pure component and lock it in `TradeApproveToggle`

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/erc20Approve/pure/Toggle/Toggle.tsx`
- Modify: `apps/cowswap-frontend/src/modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx`

- [ ] **Step 1: Update the pure `Toggle` component**

Open `apps/cowswap-frontend/src/modules/erc20Approve/pure/Toggle/Toggle.tsx`. Update the signature and body:

```tsx
export function Toggle({
  isPartialApproveSelected,
  selectPartialApprove,
  amountToApprove,
  changeApproveAmount,
  disabled = false,
}: {
  isPartialApproveSelected: boolean
  selectPartialApprove: (isPartialApproveEnabled: boolean) => void
  amountToApprove: CurrencyAmount<Currency>
  changeApproveAmount?: () => void
  disabled?: boolean
}): ReactNode {
  const { t } = useLingui()

  const handleSelect = (value: boolean): void => {
    if (disabled) return
    selectPartialApprove(value)
  }

  return (
    <styledEl.ToggleWrapper>
      <Option
        isActive={isPartialApproveSelected}
        onClick={() => handleSelect(true)}
        title={t`Partial approval`}
      >
        <styledEl.PartialAmountWrapper
          onClick={() => {
            if (isPartialApproveSelected && changeApproveAmount && !disabled) {
              changeApproveAmount()
            }
          }}
        >
          <TokenAmount amount={amountToApprove} /> <TokenSymbol token={amountToApprove.currency} />{' '}
          <styledEl.EditIcon>
            <SVG src={svgEditSrc} description="Edit" />
          </styledEl.EditIcon>
        </styledEl.PartialAmountWrapper>
      </Option>
      <Option isActive={!isPartialApproveSelected} onClick={() => handleSelect(false)} title={t`Full approval`}>
        <Trans>Unlimited one-time</Trans>
      </Option>
    </styledEl.ToggleWrapper>
  )
}
```

This keeps the visual layout intact (no styling change) but makes both options non-interactive when `disabled` is true. If a visual "locked" affordance is needed later, the `Option`/`PartialAmountWrapper` styled components can opt into a `disabled` style — out of scope here.

- [ ] **Step 2: Pass the lock from `TradeApproveToggle`**

Open `apps/cowswap-frontend/src/modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx`. Replace its contents with:

```tsx
import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'

import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'

import { Toggle } from '../../pure/Toggle'
import { useIsPartialApproveSelectedByUser, useSetIsPartialApproveSelectedByUser } from '../../state'

type TradeApproveToggleProps = {
  amountToApprove: CurrencyAmount<Currency>
  updateModalState: () => void
}

export function TradeApproveToggle({ amountToApprove, updateModalState }: TradeApproveToggleProps): ReactNode {
  const isPartialApproveSelectedByUser = useIsPartialApproveSelectedByUser()
  const setIsPartialApproveSelectedByUser = useSetIsPartialApproveSelectedByUser()
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()

  return (
    <Toggle
      isPartialApproveSelected={isPartialApproveSelectedByUser}
      selectPartialApprove={setIsPartialApproveSelectedByUser}
      amountToApprove={amountToApprove}
      changeApproveAmount={updateModalState}
      disabled={isInfiniteApproveDisabled}
    />
  )
}
```

(Task 6 already forces `isPartialApproveSelectedByUser` to `true` when the widget flag is set, so the "Partial approval" half of the toggle is highlighted automatically.)

- [ ] **Step 3: Typecheck**

```bash
yarn nx run cowswap-frontend:typecheck
```

Expected: pass.

- [ ] **Step 4: Run erc20Approve tests**

```bash
yarn nx test cowswap-frontend --testPathPattern=erc20Approve
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/erc20Approve/pure/Toggle/Toggle.tsx \
        apps/cowswap-frontend/src/modules/erc20Approve/containers/TradeApproveToggle/TradeApproveToggle.tsx
git commit -m "feat(erc20Approve): lock approve-modal partial-approve toggle when disableInfiniteApprove is set"
```

---

### Task 8: Lock the Settings dropdown "Enable Partial Approvals" toggle

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx`
- Modify: `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx`

- [ ] **Step 1: Accept `partialApprovalLocked` in the dropdown**

Open `apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx`.

Update the `SettingsTabProps` interface:

```ts
interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
  enablePartialApprovalState?: StatefulValue<boolean> | [null, null]
  partialApprovalLocked?: boolean
  isRecipientToggleDisabled?: boolean
}
```

Destructure it in the function signature:

```ts
export function SettingsDropdown({
  className,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
  partialApprovalLocked = false,
  isRecipientToggleDisabled = false,
}: SettingsTabProps): ReactNode {
```

In the `SettingsBox` for partial approvals (the existing block around line 108–116), pass `disabled` and force `checked` to `true` when locked:

```tsx
                {enablePartialApproval !== null ? (
                  <SettingsBox
                    id="enable-partial-approvals-button"
                    title={t`Enable Partial Approvals`}
                    tooltip={t`Allows you to set partial token approvals instead of full approvals.`}
                    checked={partialApprovalLocked ? true : enablePartialApproval}
                    toggle={toggleEnablePartialApproval}
                    disabled={partialApprovalLocked}
                  />
                ) : null}
```

(`SettingsBox` already accepts `disabled` — the recipient toggle just above uses it.)

- [ ] **Step 2: Wire `useIsInfiniteApproveDisabled` into the Swap container**

Open `apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx`.

Add an import alongside the other `modules/injectedWidget` imports if any, otherwise just below the existing module imports:

```ts
import { useIsInfiniteApproveDisabled } from 'modules/injectedWidget'
```

Just above the existing `const enablePartialApprovalState = useSwapPartialApprovalToggleState()` line (around line 184), add:

```ts
  const partialApprovalLocked = useIsInfiniteApproveDisabled()
```

Update the `<SettingsTab .../>` element (around line 203) to forward the new prop:

```tsx
    settingsWidget: (
      <SettingsTab
        recipientToggleState={recipientToggleState}
        hooksEnabledState={hooksEnabledState}
        deadlineState={deadlineState}
        enablePartialApprovalState={enablePartialApprovalState}
        partialApprovalLocked={partialApprovalLocked}
        isRecipientToggleDisabled={isRecipientRequired}
      />
    ),
```

- [ ] **Step 3: Typecheck**

```bash
yarn nx run cowswap-frontend:typecheck
```

Expected: pass.

- [ ] **Step 4: Run the full app test suite to confirm nothing else regressed**

```bash
yarn nx test cowswap-frontend
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/tradeWidgetAddons/containers/SettingsDropdown/SettingsDropdown.container.tsx \
        apps/cowswap-frontend/src/modules/swap/containers/SwapWidget/index.tsx
git commit -m "feat(swap): lock Settings 'Enable Partial Approvals' toggle when disableInfiniteApprove is set"
```

---

### Task 9: Manual verification in the running app

This task does not produce code or a commit; it confirms the integrator-facing behavior.

- [ ] **Step 1: Run the local widget host**

Use the existing widget integration host (find the active one — likely under `apps/cowswap-frontend` with `?injectedWidgetParams=...` query support, or a dedicated harness under `apps/`). Locate it with:

```bash
ls apps | grep -i widget
```

Open the host with the integrator able to set `disableEIP2612Permits: true` (via the parent-page `WidgetMethodsListen.UPDATE_PARAMS` channel, the same way other `disable*` flags are exercised).

- [ ] **Step 2: Verify `disableEIP2612Permits`**

With the flag set, start a swap on a permit-capable token (e.g. USDC on Mainnet on a test wallet). Confirm:

- The approve step sends an on-chain transaction (visible in wallet popup as an `approve` call), not an off-chain permit signature.

- [ ] **Step 3: Verify `disableInfiniteApprove`**

With `disableInfiniteApprove: true` and `disableEIP2612Permits` unset:

- Open the Settings dropdown — the "Enable Partial Approvals" toggle is visible, checked, and disabled (greyed out).
- Open the approve modal during a swap — the in-modal Partial/Full toggle is locked on "Partial approval" and clicking "Unlimited one-time" does nothing.
- Confirm the approve transaction `approve(spender, amount)` uses the exact trade amount, not `MaxUint256`. Inspect the transaction data in the wallet or via the transaction details panel.

- [ ] **Step 4: Verify defaults are unchanged**

With both flags unset, sanity-check that an existing permit-capable swap still uses permit and that the partial-approval Settings toggle is interactive.

- [ ] **Step 5: Report and (optionally) attach screenshots**

Note the results in the PR description. If anything is off, file the regression and re-open the relevant task.

---

## End-of-plan summary

After Task 8, the implementation is complete in code. Task 9 covers the in-browser verification required by the spec. Once all tasks are checked off and verification passes, the work is ready for review (`/code-review`, `/ultrareview`, or a PR).
