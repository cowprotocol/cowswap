import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { tokensListWorker } from '@cow/modules/tokensList/index'

export function TokensListUpdater() {
  const { chainId } = useWeb3React()

  useEffect(() => {
    if (!tokensListWorker) return

    tokensListWorker.postMessage({ event: 'INIT', data: chainId })
  }, [chainId])

  return null
}
