import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletChainId, useWalletProvider } from '@cowprotocol/wallet-provider'

import { BlockNumberContext } from './context'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const provider = useWalletProvider()
  const activeChainId = useWalletChainId()

  const [{ chainId, block }, setChainBlock] = useState<{ chainId?: number; block?: number }>({ chainId: activeChainId })

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
    [activeChainId, setChainBlock],
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
  }, [activeChainId, provider, onBlock, setChainBlock, windowVisible])

  const value = useMemo(
    () => ({
      value: chainId === activeChainId ? block : undefined,
    }),
    [activeChainId, block, chainId],
  )
  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
