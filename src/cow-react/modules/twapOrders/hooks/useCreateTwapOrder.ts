import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { proposeTransaction } from '@cow/modules/twapOrders/utils/proposeTransaction'
import { getSafeUtils } from '@cow/modules/twapOrders/utils/getSafeUtils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { encodeTwap } from '@cow/modules/twapOrders/utils/encodeTwap'
import { MetaTransactionData, OperationType } from '@safe-global/safe-core-sdk-types'
import { RELAYER, SIGN_MESSAGE_LIB } from '@cow/modules/twapOrders/consts'
import { getAddress } from '@cow/utils/getAddress'
import { ConditionalOrder__factory, ERC20__factory, SignMessageLib__factory } from '@cow/modules/twapOrders/types'

export function useCreateTwapOrder() {
  const { account, provider, chainId } = useWeb3React()

  return useCallback(
    async (
      sellTokenAmount: CurrencyAmount<Currency>,
      buyTokenAmount: CurrencyAmount<Currency>,
      numParts: number,
      timeInterval: number
    ) => {
      if (!provider || !account || !chainId) return

      const { client, safe, signer } = await getSafeUtils(chainId, account, provider)

      const sellToken = sellTokenAmount.currency
      const buyToken = buyTokenAmount.currency

      const partSellAmount = sellTokenAmount.divide(numParts).toExact()
      const minPartLimit = buyTokenAmount.divide(numParts).toExact()

      const twap = {
        sellToken: getAddress(sellToken) || '',
        buyToken: getAddress(buyToken) || '',
        receiver: '0x0000000000000000000000000000000000000000',
        partSellAmount,
        minPartLimit,
        t0: Math.floor(Date.now() / 1000), // start time
        n: numParts,
        t: timeInterval,
        span: 0,
      }

      const { digest, payload } = await encodeTwap(twap, signer.provider!)

      const safeTransactionData: MetaTransactionData[] = [
        {
          to: SIGN_MESSAGE_LIB,
          data: SignMessageLib__factory.createInterface().encodeFunctionData('signMessage', [digest]),
          value: '0',
          operation: OperationType.DelegateCall,
        },
        {
          to: twap.sellToken,
          data: ERC20__factory.createInterface().encodeFunctionData('approve', [RELAYER, sellTokenAmount.toExact()]),
          value: '0',
        },
        {
          to: account,
          data: ConditionalOrder__factory.createInterface().encodeFunctionData('dispatch', [payload]),
          value: '0',
        },
      ]

      try {
        const safeTransaction = await safe.createTransaction({
          safeTransactionData,
          options: { nonce: await client.getNextNonce(account) },
        })

        console.log(`Proposing TWAP Order Transaction: ${JSON.stringify(safeTransaction.data)}`)
        await proposeTransaction(safe, client as any, safeTransaction, signer)
      } catch (e) {
        alert(e.message)
        console.error(e)
      }
    },
    [account, chainId, provider]
  )
}
