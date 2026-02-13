import { ReactNode, useMemo } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { Field } from 'legacy/state/types'

import { TradeType } from 'modules/trade'

import { makeBuildClickEvent } from './analytics'
import { ChainsList } from './ChainsList'
import { ChainsLoadingList } from './ChainsLoadingList'

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  isLoading: boolean
  disabledChainIds?: Set<number>
  loadingChainIds?: Set<number>
  walletUnsupportedChainIds?: Set<number>
  tradeType?: TradeType
  field?: Field
  counterChainId?: ChainInfo['id']
}

export function ChainsSelector({
  isLoading,
  defaultChainId,
  tradeType,
  field,
  counterChainId,
  ...props
}: ChainsSelectorProps): ReactNode {
  const { darkMode } = useTheme()
  const contextLabel = field === Field.INPUT ? 'sell' : field === Field.OUTPUT ? 'buy' : undefined
  const buildClickEvent = useMemo(
    () =>
      tradeType && contextLabel
        ? makeBuildClickEvent(defaultChainId, contextLabel, tradeType, counterChainId)
        : undefined,
    [defaultChainId, contextLabel, tradeType, counterChainId],
  )
  const isSwapMode = tradeType === TradeType.SWAP

  if (isLoading) {
    return <ChainsLoadingList />
  }

  return (
    <ChainsList
      {...props}
      defaultChainId={defaultChainId}
      isDarkMode={darkMode}
      buildClickEvent={buildClickEvent}
      isSwapMode={isSwapMode}
    />
  )
}
