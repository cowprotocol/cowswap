import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { SwapActions } from 'legacy/state/swap/hooks'
import { BalanceAndSubsidy } from 'legacy/hooks/useCowBalanceAndSubsidy'
import { CurrencyInfo } from 'common/pure/CurrencyInputPanel/types'

export interface SwapFormProps {
  chainId: number | undefined
  recipient: string | null
  inputCurrencyInfo: CurrencyInfo
  outputCurrencyInfo: CurrencyInfo
  allowedSlippage: Percent
  isTradePriceUpdating: boolean
  allowsOffchainSigning: boolean
  showRecipientControls: boolean
  subsidyAndBalance: BalanceAndSubsidy
  priceImpactParams: PriceImpact
  swapActions: SwapActions
}

export interface TradeStateFromUrl {
  inputCurrency: string | null
  outputCurrency: string | null
  amount: string | null
  independentField: string | null
  recipient: string | null
}

export interface CurrenciesBalances {
  INPUT: CurrencyAmount<Currency> | null
  OUTPUT: CurrencyAmount<Currency> | null
}
