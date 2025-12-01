import { useMemo, useState, useCallback, ReactNode } from 'react'

import { CurrencyAmount } from '@uniswap/sdk-core'

import { useBridgeQuoteAmounts } from 'modules/bridge'
import {
  getTotalCosts,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
  useShouldPayGas,
  useGetReceiveAmountInfo,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'

import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { RowDeadline } from '../RowDeadline'
import { RowSlippage } from '../RowSlippage'

interface TradeRateDetailsProps {
  deadline: number
  rateInfoParams: RateInfoParams
  isTradePriceUpdating: boolean
  accordionContent?: ReactNode
  feeWrapper?: (feeElement: ReactNode, isOpen: boolean) => ReactNode
}

export function TradeRateDetails({
  rateInfoParams,
  deadline,
  isTradePriceUpdating,
  accordionContent,
  feeWrapper,
}: TradeRateDetailsProps): ReactNode {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)

  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const shouldPayGas = useShouldPayGas()
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()

  const inputCurrency = derivedTradeState?.inputCurrency

  const costsExceedFeeRaw = tradeQuote.error instanceof QuoteApiError ? tradeQuote?.error?.data?.fee_amount : undefined

  const networkFeeAmount = useMemo(() => {
    if (!costsExceedFeeRaw || !inputCurrency) return null
    return CurrencyAmount.fromRawAmount(inputCurrency, costsExceedFeeRaw)
  }, [costsExceedFeeRaw, inputCurrency])

  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  const toggleAccordion = useCallback(() => {
    setFeeDetailsOpen((prev) => !prev)
  }, [])

  if (!receiveAmountInfo) {
    if (!networkFeeAmount) return null

    return (
      <div style={{ padding: '0 10px' }}>
        <NetworkCostsRow
          networkFeeAmount={networkFeeAmount}
          networkFeeAmountUsd={networkFeeAmountUsd}
          amountSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
          tooltipSuffix={<NetworkCostsTooltipSuffix />}
        />
      </div>
    )
  }

  const totalCosts = getTotalCosts(
    receiveAmountInfo,
    bridgeQuoteAmounts?.bridgeFeeAmounts?.amountInIntermediateCurrency,
  )

  // Default expanded content if accordionContent prop is not supplied
  const defaultExpandedContent = (
    <>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        networkCostsSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
        networkCostsTooltipSuffix={<NetworkCostsTooltipSuffix />}
      />
      {slippage && (
        <RowSlippage
          isTradePriceUpdating={isTradePriceUpdating}
          allowedSlippage={slippage}
          isSlippageModified={isSlippageModified}
        />
      )}
      <RowDeadline deadline={deadline} />
    </>
  )

  return (
    <TradeTotalCostsDetails
      totalCosts={totalCosts}
      rateInfoParams={rateInfoParams}
      isFeeDetailsOpen={isFeeDetailsOpen}
      toggleAccordion={toggleAccordion}
      feeWrapper={feeWrapper}
    >
      {accordionContent || defaultExpandedContent}
    </TradeTotalCostsDetails>
  )
}
