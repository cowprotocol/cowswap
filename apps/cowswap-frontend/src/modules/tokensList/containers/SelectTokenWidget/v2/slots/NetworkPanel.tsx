/**
 * NetworkPanel Slot - Chain/network selection
 */
import { ReactNode } from 'react'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { useChainStore } from '../store'

export interface NetworkPanelProps {
  title?: string
}

export function NetworkPanel({ title }: NetworkPanelProps): ReactNode {
  const chain = useChainStore()

  if (!chain.chainsToSelect) {
    return null
  }

  return (
    <ChainPanel title={title ?? chain.title} chainsState={chain.chainsToSelect} onSelectChain={chain.onSelectChain} />
  )
}
