import { useAtomValue, useSetAtom } from 'jotai'

import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'

import { getEstimatedExecutionPrice } from 'legacy/state/orders/utils'

import { useAppData } from 'modules/appData'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

import { useSafeEffect, useSafeMemo } from 'common/hooks/useSafeMemo'

import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function ExecutionPriceUpdater() {
  const { marketRate, feeAmount } = useAtomValue(limitRateAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()
  const { partialFillsEnabled } = useAtomValue(limitOrdersSettingsAtom)
  const setExecutionPrice = useSetAtom(executionPriceAtom)
  const { fullAppData } = useAppData() || {}

  const inputToken = inputCurrencyAmount?.currency && getWrappedToken(inputCurrencyAmount.currency)
  const outputToken = outputCurrencyAmount?.currency && getWrappedToken(outputCurrencyAmount.currency)

  const marketPrice = useSafeMemo(() => {
    try {
      if (marketRate && !marketRate.equalTo('0') && inputToken && outputToken) {
        return FractionUtils.toPrice(marketRate, inputToken, outputToken)
      }
    } catch (e) {
      console.error(
        `[ExecutionPriceUpdater] Failed to parse the market price for ${inputToken?.address} and ${outputToken?.address}`,
        marketRate?.numerator.toString(),
        marketRate?.denominator.toString(),
        e,
      )
    }
    return null
  }, [marketRate, inputToken, outputToken])

  const fee = feeAmount?.quotient.toString()

  const price =
    marketPrice &&
    fee &&
    inputCurrencyAmount &&
    outputCurrencyAmount &&
    getEstimatedExecutionPrice(
      undefined,
      marketPrice,
      fee,
      inputCurrencyAmount,
      outputCurrencyAmount,
      orderKind,
      fullAppData,
      partialFillsEnabled,
    )

  useSafeEffect(() => {
    // Reset execution price when input or output token changes
    setExecutionPrice(null)
  }, [inputToken, outputToken, setExecutionPrice])

  useSafeEffect(() => {
    // Set execution price when price is calculated and it's valid
    price && price.greaterThan(0) && setExecutionPrice(price)
  }, [price, setExecutionPrice])

  return null
}
