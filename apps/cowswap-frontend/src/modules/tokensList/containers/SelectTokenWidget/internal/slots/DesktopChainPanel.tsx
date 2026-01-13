import { ReactNode } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'
import { Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { ChainsToSelectState } from '../../../../types'

export interface DesktopChainPanelProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
}

export function DesktopChainPanel({
  chains,
  title = t`Select network`,
  onSelectChain,
}: DesktopChainPanelProps): ReactNode {
  const isCompactLayout = useMediaQuery(Media.upToMedium(false))

  if (isCompactLayout || !chains) {
    return null
  }

  return <ChainPanel title={title} chainsState={chains} onSelectChain={onSelectChain} />
}
