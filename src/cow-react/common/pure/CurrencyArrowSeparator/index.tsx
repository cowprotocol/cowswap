import React from 'react'
import loadingCowWebp from 'assets/cow-swap/cow-load.webp'
import * as styledEl from './styled'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
  withRecipient: boolean
  hasSeparatorLine?: boolean
  isCollapsed?: boolean
  onSwitchTokens(): void
}

export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps) {
  const { isLoading, onSwitchTokens, withRecipient, isCollapsed = true, hasSeparatorLine } = props

  return (
    <styledEl.Box withRecipient={withRecipient} isCollapsed={isCollapsed} hasSeparatorLine={hasSeparatorLine}>
      <styledEl.LoadingWrapper isLoading={isLoading}>
        {isLoading ? (
          <styledEl.CowImg src={loadingCowWebp} alt="loading" />
        ) : (
          <styledEl.ArrowDownIcon onClick={onSwitchTokens} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
