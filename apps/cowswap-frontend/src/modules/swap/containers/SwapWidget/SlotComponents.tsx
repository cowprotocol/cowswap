import { Dispatch, ReactNode, SetStateAction } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import type { useHooksEnabledManager } from 'legacy/state/user/hooks'

import { TradeApproveWithAffectedOrderList } from 'modules/erc20Approve'
import { SettingsTab } from 'modules/tradeWidgetAddons'

import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

import {
  useSwapDeadlineState,
  useSwapPartialApprovalToggleState,
  useSwapRecipientToggleState,
} from '../../hooks/useSwapSettings'
import { CrossChainUnlockScreen } from '../../pure/CrossChainUnlockScreen'
import { SwapRateDetails } from '../SwapRateDetails'
import { TradeButtons } from '../TradeButtons'
import { Warnings } from '../Warnings'

import type { CurrencyData } from './hooks/useWidgetCurrencyData'

export interface LockScreenSlotProps {
  shouldShowLockScreen: boolean
  handleUnlock: () => void
}

export function LockScreenSlot({ shouldShowLockScreen, handleUnlock }: LockScreenSlotProps): ReactNode {
  if (!shouldShowLockScreen) {
    return null
  }

  return <CrossChainUnlockScreen handleUnlock={handleUnlock} />
}

export interface SettingsWidgetSlotProps {
  recipientToggleState: ReturnType<typeof useSwapRecipientToggleState>
  hooksEnabledState: ReturnType<typeof useHooksEnabledManager>
  deadlineState: ReturnType<typeof useSwapDeadlineState>
  enablePartialApprovalState: ReturnType<typeof useSwapPartialApprovalToggleState>
}

export function SettingsWidgetSlot({
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
}: SettingsWidgetSlotProps): ReactNode {
  return (
    <SettingsTab
      recipientToggleState={recipientToggleState}
      hooksEnabledState={hooksEnabledState}
      deadlineState={deadlineState}
      enablePartialApprovalState={enablePartialApprovalState}
    />
  )
}

export interface BottomContentSlotProps {
  bottomContent?: ReactNode
  tradeWarnings: ReactNode | null
  enablePartialApproval: boolean
  rateInfoParams: CurrencyData['rateInfoParams']
  deadline: ReturnType<typeof useSwapDeadlineState>[0]
  buyingFiatAmount: CurrencyInfo['fiatAmount']
  isTradeContextReady: boolean
  openNativeWrapModal: () => void
  hasEnoughWrappedBalanceForSwap: boolean
  tokenToBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
}

export function BottomContentSlot({
  bottomContent,
  tradeWarnings,
  enablePartialApproval,
  rateInfoParams,
  deadline,
  buyingFiatAmount,
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  tokenToBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: BottomContentSlotProps): ReactNode {
  return (
    <>
      {bottomContent}
      {enablePartialApproval ? <TradeApproveWithAffectedOrderList /> : null}
      <SwapRateDetails rateInfoParams={rateInfoParams} deadline={deadline} />
      <Warnings buyingFiatAmount={buyingFiatAmount} />
      {tradeWarnings}
      <TradeButtons
        isTradeContextReady={isTradeContextReady}
        openNativeWrapModal={openNativeWrapModal}
        hasEnoughWrappedBalanceForSwap={hasEnoughWrappedBalanceForSwap}
        tokenToBeImported={tokenToBeImported}
        intermediateBuyToken={intermediateBuyToken}
        setShowAddIntermediateTokenModal={setShowAddIntermediateTokenModal}
      />
    </>
  )
}
