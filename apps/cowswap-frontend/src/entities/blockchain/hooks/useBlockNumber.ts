import { useAtomValue } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import { blockNumberByChainIdAtom } from '../state/blockNumberAtom'

/** Latest observed block number (EVM block / Solana slot) for the active chain. */
export function useBlockNumber(): number | undefined {
  const { chainId } = useWalletInfo()

  return useAtomValue(blockNumberByChainIdAtom)[chainId]
}
