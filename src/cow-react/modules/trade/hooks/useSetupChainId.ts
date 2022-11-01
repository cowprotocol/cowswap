import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { switchChain } from 'utils/switchChain'

export function useSetupChainId(
  shouldSkipUpdate: boolean,
  chainIdFromUrl: number | null,
  updateStateAndNavigate: () => void
) {
  const { chainId: currentChainId, connector } = useWeb3React()
  const [isChainIdSet, setIsChainIdSet] = useState(false)

  // Set chainId from URL into wallet provider once on page load
  useEffect(() => {
    if (isChainIdSet || !chainIdFromUrl || !currentChainId) return

    setIsChainIdSet(true)
    switchChain(connector, chainIdFromUrl).finally(updateStateAndNavigate)
  }, [isChainIdSet, setIsChainIdSet, chainIdFromUrl, connector, currentChainId, updateStateAndNavigate])

  // Update state when something was changed (chainId or URL params)
  useEffect(() => {
    if (!isChainIdSet || shouldSkipUpdate) return

    updateStateAndNavigate()
  }, [shouldSkipUpdate, isChainIdSet, updateStateAndNavigate])
}
