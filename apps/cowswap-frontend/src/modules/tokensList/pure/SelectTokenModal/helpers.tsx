import { ReactNode, useMemo, useState } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'
import { TokensContent } from '../TokensContent'

import type { SelectTokenModalProps } from './types'

export function useSelectTokenContext(props: SelectTokenModalProps): SelectTokenContext {
  const {
    selectedToken,
    balancesState,
    unsupportedTokens,
    permitCompatibleTokens,
    onSelectToken,
    onTokenListItemClick,
    account,
    tokenListTags,
  } = props

  return useMemo(
    () => ({
      balancesState,
      selectedToken,
      onSelectToken,
      onTokenListItemClick,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
      isWalletConnected: !!account,
    }),
    [
      balancesState,
      selectedToken,
      onSelectToken,
      onTokenListItemClick,
      unsupportedTokens,
      permitCompatibleTokens,
      tokenListTags,
      account,
    ],
  )
}

export function useTokenSearchInput(defaultInputValue = ''): [string, (value: string) => void, string] {
  const [inputValue, setInputValue] = useState<string>(defaultInputValue)

  return [inputValue, setInputValue, inputValue.trim()]
}

interface TokensContentSectionProps
  extends Pick<
    SelectTokenModalProps,
    | 'displayLpTokenLists'
    | 'favoriteTokens'
    | 'recentTokens'
    | 'areTokensLoading'
    | 'allTokens'
    | 'areTokensFromBridge'
    | 'hideFavoriteTokensTooltip'
    | 'selectedTargetChainId'
    | 'onClearRecentTokens'
  > {
  searchInput: string
  selectTokenContext: SelectTokenContext
}

export function TokensContentSection({
  displayLpTokenLists,
  favoriteTokens,
  recentTokens,
  areTokensLoading,
  allTokens,
  searchInput,
  areTokensFromBridge,
  hideFavoriteTokensTooltip,
  selectedTargetChainId,
  selectTokenContext,
  onClearRecentTokens,
}: TokensContentSectionProps): ReactNode {
  return (
    <TokensContent
      displayLpTokenLists={displayLpTokenLists}
      selectTokenContext={selectTokenContext}
      favoriteTokens={favoriteTokens}
      recentTokens={recentTokens}
      areTokensLoading={areTokensLoading}
      allTokens={allTokens}
      searchInput={searchInput}
      areTokensFromBridge={areTokensFromBridge}
      hideFavoriteTokensTooltip={hideFavoriteTokensTooltip}
      selectedTargetChainId={selectedTargetChainId}
      onClearRecentTokens={onClearRecentTokens}
    />
  )
}

interface TitleBarActionsProps {
  showManageButton: boolean
  onDismiss(): void
  onOpenManageWidget(): void
  title: string
}

export function TitleBarActions({
  showManageButton,
  onDismiss,
  onOpenManageWidget,
  title,
}: TitleBarActionsProps): ReactNode {
  return (
    <styledEl.TitleBar>
      <styledEl.TitleGroup>
        <BackButton onClick={onDismiss} />
        <styledEl.ModalTitle>{title}</styledEl.ModalTitle>
      </styledEl.TitleGroup>
      {showManageButton && (
        <styledEl.TitleActions>
          <styledEl.TitleActionButton
            id="list-token-manage-button"
            onClick={onOpenManageWidget}
            aria-label={t`Manage token lists`}
            title={t`Manage token lists`}
          >
            <SettingsIcon />
          </styledEl.TitleActionButton>
        </styledEl.TitleActions>
      )}
    </styledEl.TitleBar>
  )
}
