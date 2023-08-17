import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'

import { useWalletInfo } from 'modules/wallet'
import { networkConnection } from 'modules/wallet/web3-react/connection/network'

const MISSING_PROVIDER = Symbol()
const BlockNumberContext = createContext<
  | {
      value?: number
      fastForward(_block: number): void
    }
  | typeof MISSING_PROVIDER
>(MISSING_PROVIDER)

function useBlockNumberContext() {
  const blockNumber = useContext(BlockNumberContext)
  if (blockNumber === MISSING_PROVIDER) {
    throw new Error('BlockNumber hooks must be wrapped in a <BlockNumberProvider>')
  }
  return blockNumber
}

/** Requires that BlockUpdater be installed in the DOM tree. */
export default function useBlockNumber(): number | undefined {
  return useBlockNumberContext().value
}

type BlockInfo = { chainId?: number; block?: number }

export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const { chainId: activeChainId } = useWalletInfo()
  const provider = networkConnection.hooks.useProvider(activeChainId)
  const [{ chainId, block }, setChainBlock] = useState<BlockInfo>({ chainId: activeChainId })
  const onBlock = useCallback(
    (block: number) => {
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId === activeChainId) {
          if (!chainBlock.block || chainBlock.block < block) {
            return { chainId: activeChainId, block }
          }
        }
        return chainBlock
      })
    },
    [activeChainId, setChainBlock]
  )

  const windowVisible = useIsWindowVisible()

  useEffect(() => {
    let stale = false

    if (provider && activeChainId && windowVisible) {
      // If chainId hasn't changed, don't clear the block. This prevents re-fetching still valid data.
      setChainBlock((chainBlock) => (chainBlock.chainId === activeChainId ? chainBlock : { chainId: activeChainId }))

      provider
        .getBlockNumber()
        .then((block) => {
          if (!stale) onBlock(block)
        })
        .catch((error) => {
          console.error(`Failed to get block number for chainId ${activeChainId}`, error)
        })

      provider.on('block', onBlock)

      return () => {
        stale = true
        provider.removeListener('block', onBlock)
      }
    }

    return void 0
  }, [activeChainId, provider, onBlock, windowVisible, setChainBlock])

  const value = useMemo(
    () => ({
      value: chainId === activeChainId ? block : undefined,
      fastForward: (block: number) => setChainBlock({ chainId: activeChainId, block }),
    }),
    [activeChainId, block, chainId]
  )
  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
