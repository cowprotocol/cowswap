import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { solanaAlphaAcknowledgedAtom } from '../state/solanaAlphaAcknowledgementAtom'

export interface SolanaAlphaAcknowledgement {
  isAcknowledgementRequired: boolean
  acknowledge: Command
}

export function useSolanaAlphaAcknowledgement(): SolanaAlphaAcknowledgement {
  const { chainId } = useWalletInfo()
  const [isAcknowledged, setIsAcknowledged] = useAtom(solanaAlphaAcknowledgedAtom)

  const acknowledge = useCallback(() => setIsAcknowledged(true), [setIsAcknowledged])

  return {
    isAcknowledgementRequired: isSolanaChain(chainId) && !isAcknowledged,
    acknowledge,
  }
}
