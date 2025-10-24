import { useMemo, useState, useCallback, ReactNode } from 'react'

import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { useBridgeQuoteAmounts } from 'modules/bridge'
import {
  getTotalCosts,
  TradeFeesAndCosts,
  TradeTotalCostsDetails,
  useDerivedTradeState,
  NetworkCostsRow,
  useShouldPayGas,
  useReceiveAmountInfo,
} from 'modules/trade'
import { useIsCurrentTradeBridging } from 'modules/trade/hooks/useIsCurrentTradeBridging'
import { useIsHooksTradeType } from 'modules/trade/hooks/useIsHooksTradeType'
import { useTradeTypeInfo } from 'modules/trade/hooks/useTradeTypeInfo'
import { TradeType } from 'modules/trade/types/TradeType'
import { useTradeQuote } from 'modules/tradeQuote'
import { useIsSlippageModified, useTradeSlippage, useShouldShowSlippageOutsideAccordion } from 'modules/tradeSlippage'
import { useUsdAmount } from 'modules/usdAmount'

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'
import { NetworkCostsSuffix } from 'common/pure/NetworkCostsSuffix'
import { RateInfoParams } from 'common/pure/RateInfo'

import { NetworkCostsTooltipSuffix } from '../../pure/NetworkCostsTooltipSuffix'
import { RowDeadline } from '../RowDeadline'
import { RowSlippage } from '../RowSlippage'
import { TransactionSlippageInput } from '../TransactionSlippageInput'

const SlippageInputWrapper = styled.div`
  margin-bottom: 0;
  padding: 0 10px;

  /* Add spacing between label and buttons inside */
  > div:first-child {
    margin-bottom: 8px;
  }
`

function NetworkCostsFallback({
  networkFeeAmount,
  networkFeeAmountUsd,
  shouldPayGas,
}: {
  networkFeeAmount: CurrencyAmount<Currency>
  networkFeeAmountUsd: CurrencyAmount<Currency> | null
  shouldPayGas: boolean
}): ReactNode {
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

function DefaultAccordionContent({
  receiveAmountInfo,
  shouldPayGas,
  slippage,
  shouldShowSlippageOutside,
  isSwapOrBridge,
  isTradePriceUpdating,
  isSlippageModified,
  deadline,
}: {
  receiveAmountInfo: ReturnType<typeof useReceiveAmountInfo>
  shouldPayGas: boolean
  slippage: ReturnType<typeof useTradeSlippage>
  shouldShowSlippageOutside: boolean
  isSwapOrBridge: boolean
  isTradePriceUpdating: boolean
  isSlippageModified: boolean
  deadline: number
}): ReactNode {
  return (
    <>
      <TradeFeesAndCosts
        receiveAmountInfo={receiveAmountInfo}
        networkCostsSuffix={shouldPayGas ? <NetworkCostsSuffix /> : null}
        networkCostsTooltipSuffix={<NetworkCostsTooltipSuffix />}
      />
      {/* Only show RowSlippage inside accordion when NOT showing outside AND not swap/bridge */}
      {slippage && !shouldShowSlippageOutside && !isSwapOrBridge && (
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
  const shouldShowSlippageOutside = useShouldShowSlippageOutsideAccordion()
  // todo replace by useGetReceiveAmountInfo when we decide what to show as bridge total fee
  const receiveAmountInfo = useReceiveAmountInfo()
  const derivedTradeState = useDerivedTradeState()
  const tradeQuote = useTradeQuote()
  const shouldPayGas = useShouldPayGas()
  const bridgeQuoteAmounts = useBridgeQuoteAmounts()

  const tradeTypeInfo = useTradeTypeInfo()
  const isHooks = useIsHooksTradeType()
  const isBridging = useIsCurrentTradeBridging()

  // For SWAP (non-hooks) or BRIDGE orders, never show slippage inside accordion
  const isSwapOrBridge = (tradeTypeInfo?.tradeType === TradeType.SWAP && !isHooks) || isBridging

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
    return <NetworkCostsFallback networkFeeAmount={networkFeeAmount} networkFeeAmountUsd={networkFeeAmountUsd} shouldPayGas={shouldPayGas} />
  }

  const totalCosts = getTotalCosts(receiveAmountInfo, bridgeQuoteAmounts?.bridgeFee)

  return (
    <>
      {/* Show full slippage input outside accordion when conditions are met (issue #6317) */}
      {shouldShowSlippageOutside && (
        <SlippageInputWrapper>
          <TransactionSlippageInput />
        </SlippageInputWrapper>
      )}

      <TradeTotalCostsDetails
        totalCosts={totalCosts}
        rateInfoParams={rateInfoParams}
        isFeeDetailsOpen={isFeeDetailsOpen}
        toggleAccordion={toggleAccordion}
        feeWrapper={feeWrapper}
      >
        {accordionContent || (
          <DefaultAccordionContent
            receiveAmountInfo={receiveAmountInfo}
            shouldPayGas={shouldPayGas}
            slippage={slippage}
            shouldShowSlippageOutside={shouldShowSlippageOutside}
            isSwapOrBridge={isSwapOrBridge}
            isTradePriceUpdating={isTradePriceUpdating}
            isSlippageModified={isSlippageModified}
            deadline={deadline}
          />
        )}
      </TradeTotalCostsDetails>
    </>
  )
}
