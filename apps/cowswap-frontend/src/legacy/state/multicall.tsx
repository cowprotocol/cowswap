import { useEffect } from 'react'

import { useInterfaceMulticall, useBlockNumber } from '@cowprotocol/common-hooks'
import { networkConnection } from '@cowprotocol/wallet'
import { Web3Provider } from '@ethersproject/providers'
import { createMulticall } from '@uniswap/redux-multicall'
import { useWeb3React } from '@web3-react/core'

// TODO: enable only for MevBlocker
const shouldUseNetworkProvider = true

export const multicall = createMulticall()

export function MulticallUpdater() {
  const { chainId: currentChainId, connector } = useWeb3React()
  const latestBlockNumber = useBlockNumber()

  const customProvider = networkConnection.connector.customProvider as Web3Provider | undefined
  const contract = useInterfaceMulticall(shouldUseNetworkProvider ? customProvider : undefined)

  // Multicall uses the network connector because of Mevblocker issue
  // So, the networkConnection should be synced with the current provider
  useEffect(() => {
    if (!shouldUseNetworkProvider) return

    if (currentChainId && connector !== networkConnection.connector) {
      networkConnection.connector.activate(currentChainId)
    }
  }, [currentChainId, connector])

  return <multicall.Updater chainId={currentChainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
