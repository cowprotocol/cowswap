import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

export interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: (recipient: string | null) => void

  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient: string | null
  isEoaEthFlow?: boolean
  compactView: boolean
  showRecipient: boolean
  isTradePriceUpdating: boolean
  priceImpact: PriceImpact
  disableQuotePolling?: boolean
  disableNativeSelling?: boolean
  disablePriceImpact: boolean
}

export interface TradeWidgetSlots {
  settingsWidget: ReactNode
  lockScreen?: ReactNode
  middleContent?: ReactNode
  bottomContent?: ReactNode
  outerContent?: ReactNode
  updaters?: ReactNode
}

export interface TradeWidgetProps {
  id?: string
  slots: TradeWidgetSlots
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  actions: TradeWidgetActions
  params: TradeWidgetParams
  disableOutput?: boolean
  confirmModal?: ReactNode
  genericModal?: ReactNode
}
