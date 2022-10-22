import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useWeb3React } from '@web3-react/core'
import { LegacyFeeQuoteParams as FeeQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { OrderKind } from '@cowprotocol/contracts'
import { Token } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'
import { useSafeMemoObject } from '@cow/common/hooks/useSafeMemo'

export function useQuoteRequestParams(): FeeQuoteParams | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, recipient, deadline } = useLimitOrdersTradeState()
  const { chainId, account } = useWeb3React()

  const isFullInput = !!(deadline && chainId && inputCurrencyAmount && inputCurrency && outputCurrency)

  const feeQuoteParams: FeeQuoteParams | null = isFullInput
    ? {
        chainId,
        validTo: Math.round(Date.now() / 1000 + 60 * deadline),
        receiver: recipient || account,
        kind: OrderKind.SELL,
        sellToken: (inputCurrency as Token).address,
        buyToken: (outputCurrency as Token).address,
        amount: parseUnits(inputCurrencyAmount.toExact(), inputCurrency?.decimals).toString(),
        fromDecimals: inputCurrency.decimals,
        toDecimals: outputCurrency.decimals,
      }
    : null

  return useSafeMemoObject<FeeQuoteParams | null>(feeQuoteParams)
}
