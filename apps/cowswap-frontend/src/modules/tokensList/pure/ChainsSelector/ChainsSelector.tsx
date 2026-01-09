import { ReactNode } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ChainInfo } from '@cowprotocol/cow-sdk'

import { ChainsList } from './ChainsList'
import { ChainsLoadingList } from './ChainsLoadingList'

export interface ChainsSelectorProps {
  chains: ChainInfo[]
  onSelectChain: (chainId: ChainInfo) => void
  defaultChainId?: ChainInfo['id']
  isLoading: boolean
  disabledChainIds?: Set<number>
  loadingChainIds?: Set<number>
}

export function ChainsSelector({
  chains,
  onSelectChain,
  defaultChainId,
  isLoading,
  disabledChainIds,
  loadingChainIds,
}: ChainsSelectorProps): ReactNode {
  const { darkMode } = useTheme()

  if (isLoading) {
    return <ChainsLoadingList />
  }

  return (
    <ChainsList
      chains={chains}
      defaultChainId={defaultChainId}
      onSelectChain={onSelectChain}
      isDarkMode={darkMode}
      disabledChainIds={disabledChainIds}
      loadingChainIds={loadingChainIds}
    />
  )
}
