import { useMemo, useState, useCallback, ReactNode, ReactElement } from 'react'

import { CurrencyAmount, Currency, Token } from '@uniswap/sdk-core'

import {
  getTotalCosts,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
  useReceiveAmountInfo,
  useShouldPayGas,
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
  feeWrapper?: (feeElement: ReactNode) => React.ReactNode
}

interface NetworkFeeData {
  networkFeeAmount: CurrencyAmount<Currency> | null
  networkFeeAmountUsd: CurrencyAmount<Token> | null
}

function useNetworkFeeData(): NetworkFeeData {
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const inputCurrency = derivedTradeState?.inputCurrency

  const costsExceedFeeRaw = tradeQuote.error instanceof QuoteApiError ? tradeQuote?.error?.data?.fee_amount : undefined

  const networkFeeAmount = useMemo(() => {
    if (!costsExceedFeeRaw || !inputCurrency) return null
    return CurrencyAmount.fromRawAmount(inputCurrency, costsExceedFeeRaw)
  }, [costsExceedFeeRaw, inputCurrency])

  const networkFeeAmountUsd = useUsdAmount(networkFeeAmount).value

  return { networkFeeAmount, networkFeeAmountUsd }
}

function NetworkCostsOnlyView({
  networkFeeAmount,
  networkFeeAmountUsd,
  shouldPayGas,
}: {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Token> | null
  shouldPayGas: boolean
}): ReactElement {
  return (
    <div style={{ padding: '0 10px' }}>
      <NetworkCostsRow
        networkFeeAmount={networkFeeAmount}
        networkFeeAmountUsd={networkFeeAmountUsd}
        withTimelineDot={false}
        amountSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
        tooltipSuffix={<NetworkCostsTooltipSuffix />}
      />
    </div>
  )
}

function createDefaultExpandedContent(
  receiveAmountInfo: ReturnType<typeof useReceiveAmountInfo>,
  shouldPayGas: boolean,
  slippage: ReturnType<typeof useTradeSlippage>,
  isTradePriceUpdating: boolean,
  isSlippageModified: boolean,
  deadline: number,
): ReactElement {
  return (
    <>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        withTimelineDot={false}
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
}

export function TradeRateDetails({
  rateInfoParams,
  deadline,
  isTradePriceUpdating,
  accordionContent,
  feeWrapper,
}: TradeRateDetailsProps): ReactElement | null {
  const [isFeeDetailsOpen, setFeeDetailsOpen] = useState(false)

  const slippage = useTradeSlippage()
  const isSlippageModified = useIsSlippageModified()
  const receiveAmountInfo = useReceiveAmountInfo()
  const tradeQuote = useTradeQuote()
  const shouldPayGas = useShouldPayGas()
  const { networkFeeAmount, networkFeeAmountUsd } = useNetworkFeeData()

  const toggleAccordion = useCallback(() => {
    setFeeDetailsOpen((prev) => !prev)
  }, [])

  // Hide fee accordion whenever there's a quote error
  if (tradeQuote.error) return null

  if (!receiveAmountInfo) {
    if (!networkFeeAmount) return null
    return (
      <NetworkCostsOnlyView
        networkFeeAmount={networkFeeAmount}
        networkFeeAmountUsd={networkFeeAmountUsd}
        shouldPayGas={shouldPayGas}
      />
    )
  }

  const totalCosts = getTotalCosts(receiveAmountInfo)

  // Default expanded content if accordionContent prop is not supplied
  const defaultExpandedContent = createDefaultExpandedContent(
    receiveAmountInfo,
    shouldPayGas,
    slippage,
    isTradePriceUpdating,
    isSlippageModified,
    deadline,
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
