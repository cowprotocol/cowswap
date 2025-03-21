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
  recipient?: string | null
  compactView: boolean
  showRecipient: boolean
  isTradePriceUpdating: boolean
  isSellingEthSupported?: boolean
  priceImpact: PriceImpact
  disableQuotePolling?: boolean
  disableNativeSelling?: boolean
  disablePriceImpact?: boolean
  hideTradeWarnings?: boolean
  enableSmartSlippage?: boolean
  isMarketOrderWidget?: boolean
  displayTokenName?: boolean
  displayChainName?: boolean
  customSelectTokenButton?: ReactNode
}

export interface TradeWidgetSlots {
  settingsWidget: ReactNode
  lockScreen?: ReactNode
  topContent?: ReactNode
  middleContent?: ReactNode
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
