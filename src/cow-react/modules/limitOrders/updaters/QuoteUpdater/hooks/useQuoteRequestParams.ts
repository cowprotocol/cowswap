import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useWeb3React } from '@web3-react/core'
import { LegacyFeeQuoteParams as FeeQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { OrderKind } from '@cowprotocol/contracts'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTypedValue } from '@cow/modules/limitOrders/hooks/useTypedValue'
import { getAddress } from '@cow/utils/getAddress'
import useENSAddress from 'hooks/useENSAddress'

export type LimitOrdersQuoteParams = Omit<FeeQuoteParams, 'validTo'> & { validTo?: number }

export function useQuoteRequestParams(): LimitOrdersQuoteParams | null {
  const { inputCurrency, outputCurrency, recipient, orderKind } = useLimitOrdersTradeState()
  const { chainId, account } = useWeb3React()
  const { exactTypedValue } = useTypedValue()
  const { address: recipientEnsAddress } = useENSAddress(recipient)

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !exactTypedValue || !chainId) {
      return null
    }

    const sellToken = getAddress(inputCurrency)
    const buyToken = getAddress(outputCurrency)
    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    const amount =
      orderKind === OrderKind.SELL
        ? parseUnits(exactTypedValue, fromDecimals).toString()
        : parseUnits(exactTypedValue, toDecimals).toString()

    if (!amount || !sellToken || !buyToken) {
      return null
    }

    return {
      chainId,
      receiver: recipientEnsAddress || recipient || account,
      kind: orderKind,
      sellToken,
      buyToken,
      amount,
      fromDecimals,
      toDecimals,
      isEthFlow: false, // EthFlow is not compatible with limit orders
    }
  }, [account, chainId, exactTypedValue, inputCurrency, orderKind, outputCurrency, recipient, recipientEnsAddress])
}
