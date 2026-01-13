/**
 * NetworkPanel Slot - Chain/network selection
 *
 * Props-based for flexibility.
 */
import { ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { ChainsToSelectState } from '../../../../types'

export interface NetworkPanelProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
}

export function NetworkPanel({ chains, title = t`Select network`, onSelectChain }: NetworkPanelProps): ReactNode {
  if (!chains) {
    return null
  }

  return <ChainPanel title={title} chainsState={chains} onSelectChain={onSelectChain} />
}
