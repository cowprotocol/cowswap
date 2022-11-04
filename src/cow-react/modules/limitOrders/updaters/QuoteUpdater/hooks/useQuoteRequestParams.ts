import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { useWeb3React } from '@web3-react/core'
import { LegacyFeeQuoteParams as FeeQuoteParams } from '@cow/api/gnosisProtocol/legacy/types'
import { OrderKind } from '@cowprotocol/contracts'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { useTypedValue } from '@cow/modules/limitOrders/hooks/useTypedValue'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { calculateValidTo } from '@cow/utils/time'
import { useUserTransactionTTL } from '@src/state/user/hooks'

export function useQuoteRequestParams(): FeeQuoteParams | null {
  const { inputCurrency, outputCurrency, recipient, orderKind } = useLimitOrdersTradeState()
  const { chainId, account } = useWeb3React()
  const { exactTypedValue } = useTypedValue()
  const [deadline] = useUserTransactionTTL()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency || !exactTypedValue || !chainId || !deadline) {
      return null
    }

    const fromDecimals = inputCurrency?.decimals
    const toDecimals = outputCurrency?.decimals

    const amount =
      orderKind === OrderKind.SELL
        ? parseUnits(exactTypedValue, fromDecimals).toString()
        : parseUnits(exactTypedValue, toDecimals).toString()

    const sellToken = getAddress(inputCurrency)
    const buyToken = getAddress(outputCurrency)
    const validTo = calculateValidTo(deadline)

    if (!amount || !sellToken || !buyToken) {
      return null
    }

    return {
      chainId,
      validTo,
      receiver: recipient || account,
      kind: orderKind,
      sellToken,
      buyToken,
      amount,
      fromDecimals,
      toDecimals,
    }
  }, [account, chainId, deadline, exactTypedValue, inputCurrency, orderKind, outputCurrency, recipient])
}
