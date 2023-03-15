import { useCallback } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useWeb3React } from '@web3-react/core'
import { proposeTransaction } from '@cow/modules/twapOrders/utils/proposeTransaction'
import { getSafeUtils } from '@cow/modules/twapOrders/utils/getSafeUtils'

const handlerAddresses: Record<number, string> = {
  1: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
  5: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
  100: '0x87b52ed635df746ca29651581b4d87517aaa9a9f',
}

export function useBindFallbackHandler() {
  const { account, provider, chainId } = useWeb3React()

  return useCallback(async () => {
    const handlerAddress = chainId ? handlerAddresses[chainId] : null

    if (!provider || !account || !chainId || !handlerAddress) return

    try {
      const { client, safe, signer } = await getSafeUtils(chainId, account, provider)

      const safeTransaction = await safe.createEnableFallbackHandlerTx(handlerAddress)
      await proposeTransaction(safe, client as any, safeTransaction, signer)
    } catch (e) {
      alert(e.message)
      console.error(e)
    }
  }, [chainId, provider, account])
}
