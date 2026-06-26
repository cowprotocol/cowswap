import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsWindowVisible } from '@cowprotocol/common-hooks'
import { useWalletInfo, useWatchChainBlockNumber } from '@cowprotocol/wallet'

import { updateBlockNumberAtom } from '../state/blockNumberAtom'

/**
 * Watches the active chain's head (EVM block number / Solana slot) and stores it in the
 * block-number atom. Replaces the former BlockNumberProvider/context.
 */
export function BlockNumberUpdater(): null {
  const windowVisible = useIsWindowVisible()
  const { chainId } = useWalletInfo()
  const updateBlockNumber = useSetAtom(updateBlockNumberAtom)

  const onBlockNumber = useCallback(
    (blockNumber: bigint) => {
      console.log('BLOCK NUMBER', blockNumber)
      updateBlockNumber({ chainId, blockNumber: Number(blockNumber) })
    },
    [chainId, updateBlockNumber],
  )

  useWatchChainBlockNumber({
    enabled: windowVisible,
    onBlockNumber,
  })

  return null
}
