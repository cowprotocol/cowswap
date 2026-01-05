/**
 * NetworkPanel Slot - Chain/network selection
 */
import { ReactNode } from 'react'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { useChains, useOnSelectChain } from '../store'

export interface NetworkPanelProps {
  title?: string
}

export function NetworkPanel({ title = 'Select network' }: NetworkPanelProps): ReactNode {
  const chains = useChains()
  const onSelectChain = useOnSelectChain()

  if (!chains || !onSelectChain) {
    return null
  }

  return <ChainPanel title={title} chainsState={chains} onSelectChain={onSelectChain} />
}
