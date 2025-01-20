import { useAtomValue, useSetAtom } from 'jotai'

import { FractionUtils, getWrappedToken } from '@cowprotocol/common-utils'

import { getEstimatedExecutionPrice } from 'legacy/state/orders/utils'

import { useAppData } from 'modules/appData'
import { useLimitOrdersDerivedState } from 'modules/limitOrders/hooks/useLimitOrdersDerivedState'
import { executionPriceAtom } from 'modules/limitOrders/state/executionPriceAtom'
import { limitRateAtom } from 'modules/limitOrders/state/limitRateAtom'

import { useSafeEffect } from 'common/hooks/useSafeMemo'

import { limitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function ExecutionPriceUpdater() {
  const { marketRate, feeAmount } = useAtomValue(limitRateAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, orderKind } = useLimitOrdersDerivedState()
  const { partialFillsEnabled } = useAtomValue(limitOrdersSettingsAtom)
  const setExecutionPrice = useSetAtom(executionPriceAtom)
  const { fullAppData } = useAppData() || {}

  const inputToken = inputCurrencyAmount?.currency && getWrappedToken(inputCurrencyAmount.currency)
  const outputToken = outputCurrencyAmount?.currency && getWrappedToken(outputCurrencyAmount.currency)

  const marketPrice =
    marketRate && inputToken && outputToken && FractionUtils.toPrice(marketRate, inputToken, outputToken)

  const fee = feeAmount?.quotient.toString()

  const price =
    marketPrice &&
    fee &&
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
    price && price.greaterThan(0) && setExecutionPrice(price)
  }, [price, setExecutionPrice])

  return null
}
