import { ReactNode } from 'react'

import { ChainInfo } from '@cowprotocol/cow-sdk'
import { TokenListCategory } from '@cowprotocol/tokens'

import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'
import { ChainsToSelectState, TokenSelectionHandler } from '../../types'
import { ChainsSelector } from '../ChainsSelector'

type TokenListCategoryState = [TokenListCategory[] | null, (category: TokenListCategory[] | null) => void]

export interface TokenColumnContentProps {
  displayLpTokenLists?: boolean
  account: string | undefined
  inputValue: string
  onSelectToken: TokenSelectionHandler
  openPoolPage(poolAddress: string): void
  disableErc20?: boolean
  tokenListCategoryState: TokenListCategoryState
  isRouteAvailable: boolean | undefined
  chainsToSelect?: ChainsToSelectState
  onSelectChain: (chain: ChainInfo) => void
  children: ReactNode
}

export function TokenColumnContent({
  displayLpTokenLists,
  account,
  inputValue,
  onSelectToken,
  openPoolPage,
  disableErc20,
  tokenListCategoryState,
  isRouteAvailable,
  chainsToSelect,
  onSelectChain,
  children,
}: TokenColumnContentProps): ReactNode {
  if (displayLpTokenLists) {
    return (
      <LpTokenListsWidget
        account={account}
        search={inputValue}
        onSelectToken={onSelectToken}
        openPoolPage={openPoolPage}
        disableErc20={disableErc20}
        tokenListCategoryState={tokenListCategoryState}
      >
        {children}
      </LpTokenListsWidget>
    )
  }

  return (
    <>
      {renderLegacyChainSelector(chainsToSelect, onSelectChain)}
      <SelectTokenModalContent isRouteAvailable={isRouteAvailable}>{children}</SelectTokenModalContent>
    </>
  )
}

function renderLegacyChainSelector(
  chainsToSelect: ChainsToSelectState | undefined,
  onSelectChain: (chain: ChainInfo) => void,
): ReactNode {
  if (!chainsToSelect?.chains?.length) {
    return null
  }

  return (
    <styledEl.LegacyChainsWrapper>
      <ChainsSelector
        isLoading={chainsToSelect.isLoading || false}
        chains={chainsToSelect.chains}
        defaultChainId={chainsToSelect.defaultChainId}
        onSelectChain={onSelectChain}
      />
    </styledEl.LegacyChainsWrapper>
  )
}
