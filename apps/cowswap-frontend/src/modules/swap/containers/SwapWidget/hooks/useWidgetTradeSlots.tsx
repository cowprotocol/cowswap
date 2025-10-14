import { Dispatch, ReactNode, SetStateAction, useCallback, useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'

import type { useHooksEnabledManager } from 'legacy/state/user/hooks'

import { TradeWidgetSlots } from 'modules/trade'

import {
  useSwapDeadlineState,
  useSwapPartialApprovalToggleState,
  useSwapRecipientToggleState,
} from '../../../hooks/useSwapSettings'
import { BottomContentSlot, LockScreenSlot, SettingsWidgetSlot } from '../SlotComponents'

import type { CurrencyData } from './useWidgetCurrencyData'

export interface TradeWidgetSlotArgs {
  topContent?: ReactNode
  bottomContent?: ReactNode
  shouldShowLockScreen: boolean
  handleUnlock: () => void
  recipientToggleState: ReturnType<typeof useSwapRecipientToggleState>
  hooksEnabledState: ReturnType<typeof useHooksEnabledManager>
  enablePartialApprovalState: ReturnType<typeof useSwapPartialApprovalToggleState>
  enablePartialApproval: boolean
  deadlineState: ReturnType<typeof useSwapDeadlineState>
  rateInfoParams: CurrencyData['rateInfoParams']
  buyingFiatAmount: CurrencyData['buyingFiatAmount']
  isTradeContextReady: boolean
  openNativeWrapModal: () => void
  hasEnoughWrappedBalanceForSwap: boolean
  toBeImported: boolean
  intermediateBuyToken: TokenWithLogo | null
  setShowAddIntermediateTokenModal: Dispatch<SetStateAction<boolean>>
}

export function useTradeWidgetSlotsMemo({
  topContent,
  bottomContent,
  shouldShowLockScreen,
  handleUnlock,
  recipientToggleState,
  hooksEnabledState,
  enablePartialApprovalState,
  enablePartialApproval,
  deadlineState,
  rateInfoParams,
  buyingFiatAmount,
  isTradeContextReady,
  openNativeWrapModal,
  hasEnoughWrappedBalanceForSwap,
  toBeImported,
  intermediateBuyToken,
  setShowAddIntermediateTokenModal,
}: TradeWidgetSlotArgs): TradeWidgetSlots {
  const lockScreen = useMemo(
    () => LockScreenSlot({ shouldShowLockScreen, handleUnlock }),
    [shouldShowLockScreen, handleUnlock],
  )

  const settingsWidget = useMemo(
    () =>
      SettingsWidgetSlot({
        recipientToggleState,
        hooksEnabledState,
        deadlineState,
        enablePartialApprovalState,
      }),
    [recipientToggleState, hooksEnabledState, deadlineState, enablePartialApprovalState],
  )

  const bottomContentRenderer = useCallback(
    (tradeWarnings: ReactNode | null) =>
      BottomContentSlot({
        bottomContent,
        tradeWarnings,
        enablePartialApproval,
        rateInfoParams,
        deadline: deadlineState[0],
        buyingFiatAmount,
        isTradeContextReady,
        openNativeWrapModal,
        hasEnoughWrappedBalanceForSwap,
        tokenToBeImported: toBeImported,
        intermediateBuyToken,
        setShowAddIntermediateTokenModal,
      }),
    [
      bottomContent,
      enablePartialApproval,
      rateInfoParams,
      deadlineState,
      buyingFiatAmount,
      isTradeContextReady,
      openNativeWrapModal,
      hasEnoughWrappedBalanceForSwap,
      toBeImported,
      intermediateBuyToken,
      setShowAddIntermediateTokenModal,
    ],
  )

  return useMemo(
    () => ({
      topContent,
      lockScreen,
      settingsWidget,
      bottomContent: bottomContentRenderer,
    }),
    [topContent, lockScreen, settingsWidget, bottomContentRenderer],
  )
}
