import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useWatchBlocks } from 'wagmi'

import { BlockNumberContext } from './context'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BlockNumberProvider({ children }: { children: ReactNode }) {
  const windowVisible = useIsWindowVisible()
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

  useWatchBlocks({
    chainId: activeChainId,
    enabled: Boolean(activeChainId) && windowVisible,
    onBlock: (block) => onBlock(Number(block.number)),
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
