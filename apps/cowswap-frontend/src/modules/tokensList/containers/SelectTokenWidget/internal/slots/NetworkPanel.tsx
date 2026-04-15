import { ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { ChainPanel } from '../../../../pure/ChainPanel'
import { ChainsToSelectState } from '../../../../types'

export interface NetworkPanelProps {
  chains?: ChainsToSelectState
  title?: string
  onSelectChain: (chain: ChainInfo) => void
  tradeType?: TradeType
  field?: Field
  counterChainId?: ChainInfo['id']
}

export function NetworkPanel({
  chains,
  title = t`Select network`,
  onSelectChain,
  tradeType,
  field,
  counterChainId,
}: NetworkPanelProps): ReactNode {
  if (!chains) {
    return null
  }

  return (
    <ChainPanel
      title={title}
      chainsState={chains}
      onSelectChain={onSelectChain}
      tradeType={tradeType}
      field={field}
      counterChainId={counterChainId}
    />
  )
}
