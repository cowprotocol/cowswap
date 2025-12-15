import { ComponentProps, ReactNode } from 'react'

import { SearchInput } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TitleBarActions } from './helpers'
import { MobileChainSelector } from './MobileChainSelector'
import * as styledEl from './styled'

export interface SelectTokenModalShellProps {
  children: ReactNode
  hasChainPanel: boolean
  isFullScreenMobile?: boolean
  title: string
  showManageButton: boolean
  onDismiss(): void
  onOpenManageWidget: () => void
  searchValue: string
  onSearchChange(value: string): void
  onSearchEnter?: () => void
  mobileChainSelector?: ComponentProps<typeof MobileChainSelector>
  sideContent?: ReactNode
}

export function SelectTokenModalShell({
  children,
  hasChainPanel,
  isFullScreenMobile,
  title,
  showManageButton,
  onDismiss,
  onOpenManageWidget,
  searchValue,
  onSearchChange,
  onSearchEnter,
  mobileChainSelector,
  sideContent,
}: SelectTokenModalShellProps): ReactNode {
  return (
    <styledEl.Wrapper $hasChainPanel={hasChainPanel} $isFullScreen={isFullScreenMobile}>
      <TitleBarActions
        showManageButton={showManageButton}
        onDismiss={onDismiss}
        onOpenManageWidget={onOpenManageWidget}
        title={title}
      />
      <styledEl.SearchRow>
        <styledEl.SearchInputWrapper>
          <SearchInput
            id="token-search-input"
            value={searchValue}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearchEnter?.()
              }
            }}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t`Search name or paste address...`}
          />
        </styledEl.SearchInputWrapper>
      </styledEl.SearchRow>
      {mobileChainSelector ? <MobileChainSelector {...mobileChainSelector} /> : null}
      <styledEl.Body>
        <styledEl.TokenColumn>{children}</styledEl.TokenColumn>
        {sideContent}
      </styledEl.Body>
    </styledEl.Wrapper>
  )
}
