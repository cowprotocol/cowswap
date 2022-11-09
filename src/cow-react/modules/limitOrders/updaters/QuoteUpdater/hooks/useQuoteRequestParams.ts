import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useWeb3React } from '@web3-react/core'
import { LegacyFeeQuoteParams as FeeQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { OrderKind } from '@cowprotocol/contracts'
import { Token } from '@uniswap/sdk-core'
import { parseUnits } from '@ethersproject/units'
import { useMemo } from 'react'
import useENSAddress from '@src/hooks/useENSAddress'

export function useQuoteRequestParams(): FeeQuoteParams | null {
  const { inputCurrency, outputCurrency, inputCurrencyAmount, recipient, deadlineTimestamp } =
    useLimitOrdersTradeState()
  const { chainId, account } = useWeb3React()
  const { address: recipientEnsAddress } = useENSAddress(recipient)

  const isFullInput = !!(deadlineTimestamp && chainId && inputCurrencyAmount && inputCurrency && outputCurrency)

  const feeQuoteParams: FeeQuoteParams | null = isFullInput
    ? {
        chainId,
        validTo: deadlineTimestamp,
        receiver: recipientEnsAddress || recipient || account,
        kind: OrderKind.SELL,
        sellToken: (inputCurrency as Token).address,
        buyToken: (outputCurrency as Token).address,
        amount: parseUnits(inputCurrencyAmount.toExact(), inputCurrency?.decimals).toString(),
        fromDecimals: inputCurrency.decimals,
        toDecimals: outputCurrency.decimals,
      }
    : null

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => feeQuoteParams, [JSON.stringify(feeQuoteParams)])
}
