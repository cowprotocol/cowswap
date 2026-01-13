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

export function NetworkPanel({ chains, title, onSelectChain }: NetworkPanelProps): ReactNode {
  const resolvedTitle = title ?? t`Select network`

  if (!chains) {
    return null
  }

  return <ChainPanel title={resolvedTitle} chainsState={chains} onSelectChain={onSelectChain} />
}
