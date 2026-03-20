import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useWatchBlockNumber } from 'wagmi'

import { BlockNumberContext } from './context'

export function BlockNumberProvider({ children }: { children: ReactNode }): ReactNode {
  const windowVisible = useIsWindowVisible()
  const activeChainId = useWalletChainId()

  const [{ chainId, block }, setChainBlock] = useState<{ chainId?: number; block?: number }>({ chainId: activeChainId })

  const onBlockNumber = useCallback(
    (blockNumber: bigint) => {
      const num = Number(blockNumber)
      setChainBlock((chainBlock) => {
        if (chainBlock.chainId === activeChainId) {
          if (!chainBlock.block || chainBlock.block < num) {
            return { chainId: activeChainId, block: num }
          }
        }
        return chainBlock
      })
    },
    [activeChainId],
  )

  useWatchBlockNumber({
    chainId: activeChainId,
    enabled: Boolean(activeChainId) && windowVisible,
    onBlockNumber,
  })

  useEffect(() => {
    setChainBlock((chainBlock) => (chainBlock.chainId === activeChainId ? chainBlock : { chainId: activeChainId }))
  }, [activeChainId])

  const value = useMemo(
    () => ({
      value: chainId === activeChainId ? block : undefined,
    }),
    [activeChainId, block, chainId],
  )
  return <BlockNumberContext.Provider value={value}>{children}</BlockNumberContext.Provider>
}
