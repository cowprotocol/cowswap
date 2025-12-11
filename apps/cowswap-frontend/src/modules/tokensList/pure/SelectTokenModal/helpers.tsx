import { ComponentProps, ReactNode, useMemo, useState } from 'react'

import { BackButton } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import { MobileChainSelector } from './MobileChainSelector'
import * as styledEl from './styled'

import { SelectTokenContext } from '../../types'

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

export function getMobileChainSelectorConfig({
  showChainPanel,
  mobileChainsState,
  mobileChainsLabel,
  onSelectChain,
  onOpenMobileChainPanel,
}: {
  showChainPanel: boolean
  mobileChainsState: SelectTokenModalProps['mobileChainsState']
  mobileChainsLabel: SelectTokenModalProps['mobileChainsLabel']
  onSelectChain?: SelectTokenModalProps['onSelectChain']
  onOpenMobileChainPanel?: SelectTokenModalProps['onOpenMobileChainPanel']
}): ComponentProps<typeof MobileChainSelector> | undefined {
  const canRender =
    !showChainPanel &&
    mobileChainsState &&
    onSelectChain &&
    onOpenMobileChainPanel &&
    (mobileChainsState.chains?.length ?? 0) > 0

  if (!canRender) {
    return undefined
  }

  return {
    chainsState: mobileChainsState,
    label: mobileChainsLabel,
    onSelectChain,
    onOpenPanel: onOpenMobileChainPanel,
  }
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
