import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SearchInput } from '@cowprotocol/ui'

import { TokensContentSection, TitleBarActions, useSelectTokenContext, useTokenSearchInput } from './helpers'
import { SelectTokenModalContent } from './SelectTokenModalContent'
import * as styledEl from './styled'

import { LpTokenListsWidget } from '../../containers/LpTokenListsWidget'

import type { SelectTokenModalProps } from './types'
export type { SelectTokenModalProps }

export function SelectTokenModal(props: SelectTokenModalProps): ReactNode {
  const {
    defaultInputValue = '',
    onSelectToken,
    onDismiss,
    onInputPressEnter,
    account,
    displayLpTokenLists,
    openPoolPage,
    tokenListCategoryState,
    disableErc20,
    isRouteAvailable,
    modalTitle,
    hasChainPanel,
    standalone,
    onOpenManageWidget,
    favoriteTokens,
    recentTokens,
    areTokensLoading,
    allTokens,
    areTokensFromBridge,
    hideFavoriteTokensTooltip,
    selectedTargetChainId,
  } = props

  const [inputValue, setInputValue, trimmedInputValue] = useTokenSearchInput(defaultInputValue)
  const selectTokenContext = useSelectTokenContext(props)
  const resolvedModalTitle = modalTitle ?? 'Select token'

  return (
    <styledEl.Wrapper $hasChainPanel={hasChainPanel}>
      <TitleBarActions
        showManageButton={!standalone}
        onDismiss={onDismiss}
        onOpenManageWidget={onOpenManageWidget}
        title={resolvedModalTitle}
      />
      <styledEl.SearchRow>
        <SearchInput
          id="token-search-input"
          value={inputValue}
          onKeyDown={(e) => e.key === 'Enter' && onInputPressEnter?.()}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search name or paste address..."
        />
      </styledEl.SearchRow>
      <styledEl.Body>
        <styledEl.TokenColumn>
          <TokenColumnContent
            displayLpTokenLists={displayLpTokenLists}
            account={account}
            inputValue={inputValue}
            onSelectToken={onSelectToken}
            openPoolPage={openPoolPage}
            disableErc20={disableErc20}
            tokenListCategoryState={tokenListCategoryState}
            isRouteAvailable={isRouteAvailable}
          >
            <TokensContentSection
              displayLpTokenLists={displayLpTokenLists}
              favoriteTokens={favoriteTokens}
              recentTokens={recentTokens}
              areTokensLoading={areTokensLoading}
              allTokens={allTokens}
              searchInput={trimmedInputValue}
              areTokensFromBridge={areTokensFromBridge}
              hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
              selectedTargetChainId={selectedTargetChainId}
              selectTokenContext={selectTokenContext}
            />
          </TokenColumnContent>
        </styledEl.TokenColumn>
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}

interface TokenColumnContentProps {
  displayLpTokenLists?: boolean
  account: string | undefined
  inputValue: string
  onSelectToken(token: TokenWithLogo): void
  openPoolPage(poolAddress: string): void
  disableErc20?: boolean
  tokenListCategoryState: SelectTokenModalProps['tokenListCategoryState']
  isRouteAvailable: boolean | undefined
  children: ReactNode
}

function TokenColumnContent(props: TokenColumnContentProps): ReactNode {
  const {
    displayLpTokenLists,
    account,
    inputValue,
    onSelectToken,
    openPoolPage,
    disableErc20,
    tokenListCategoryState,
    isRouteAvailable,
    children,
  } = props

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

  return <SelectTokenModalContent isRouteAvailable={isRouteAvailable}>{children}</SelectTokenModalContent>
}
