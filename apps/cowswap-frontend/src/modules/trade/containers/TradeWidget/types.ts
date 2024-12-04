import { ReactNode } from 'react'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'

import { TradeQuoteState } from 'modules/tradeQuote'

import { CurrencyInputPanelProps } from 'common/pure/CurrencyInputPanel'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

export interface TradeWidgetActions {
  onCurrencySelection: CurrencyInputPanelProps['onCurrencySelection']
  onUserInput: CurrencyInputPanelProps['onUserInput']
  onChangeRecipient: (recipient: string | null) => void

  onSwitchTokens(): void
}

interface TradeWidgetParams {
  recipient?: string | null
  isEoaEthFlow?: boolean
  compactView: boolean
  showRecipient: boolean
  isTradePriceUpdating: boolean
  priceImpact: PriceImpact
  tradeQuoteStateOverride?: TradeQuoteState | null
  disableQuotePolling?: boolean
  disableNativeSelling?: boolean
  disablePriceImpact?: boolean
  hideTradeWarnings?: boolean
  enableSmartSlippage?: boolean
  isMarketOrderWidget?: boolean
  displayTokenName?: boolean
  customSelectTokenButton?: ReactNode
}

export interface TradeWidgetSlots {
  settingsWidget: ReactNode
  lockScreen?: ReactNode
  topContent?: ReactNode
  middleContent?: ReactNode
  limitPriceInput?: ReactNode
  bottomContent?(warnings: ReactNode | null): ReactNode
  outerContent?: ReactNode
  updaters?: ReactNode
  selectTokenWidget?: ReactNode
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
