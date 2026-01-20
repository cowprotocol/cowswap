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

export function ChainsSelector({ isLoading, ...props }: ChainsSelectorProps): ReactNode {
  const { darkMode } = useTheme()

  if (isLoading) {
    return <ChainsLoadingList />
  }

  return <ChainsList {...props} isDarkMode={darkMode} />
}
