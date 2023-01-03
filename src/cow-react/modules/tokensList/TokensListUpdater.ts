import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { tokensListWorker } from '@cow/modules/tokensList/index'
import { TokensListsWorkerEvents } from '@cow/modules/tokensList/types'

export function TokensListUpdater() {
  const { chainId } = useWeb3React()

  useEffect(() => {
    if (!tokensListWorker) return

    tokensListWorker.postMessage({ event: TokensListsWorkerEvents.NETWORK_CHANGED, data: chainId })
  }, [chainId])

  return null
}
