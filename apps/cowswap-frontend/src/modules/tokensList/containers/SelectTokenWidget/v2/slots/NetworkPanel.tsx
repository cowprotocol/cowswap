/**
 * NetworkPanel Slot - Chain/network selection
 */
import { ReactNode } from 'react'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { useChainState } from '../store'

export interface NetworkPanelProps {
  title?: string
}

export function NetworkPanel({ title }: NetworkPanelProps): ReactNode {
  const chain = useChainState()

  if (!chain.chainsToSelect) {
    return null
  }

  return (
    <ChainPanel title={title ?? chain.title} chainsState={chain.chainsToSelect} onSelectChain={chain.onSelectChain} />
  )
}
