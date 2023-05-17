import React from 'react'
import loadingCowWebp from '@src/legacy/assets/cow-swap/cow-load.webp'
import * as styledEl from './styled'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
  withRecipient: boolean
  hasSeparatorLine?: boolean
  isCollapsed?: boolean
  onSwitchTokens(): void
  border?: boolean
}

export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps) {
  const { isLoading, onSwitchTokens, withRecipient, isCollapsed = true, hasSeparatorLine, border } = props

  return (
    <styledEl.Box withRecipient={withRecipient} isCollapsed={isCollapsed} hasSeparatorLine={hasSeparatorLine}>
      <styledEl.LoadingWrapper isLoading={isLoading} border={border}>
        {isLoading ? (
          <styledEl.CowImg src={loadingCowWebp} alt="loading" />
        ) : (
          <styledEl.ArrowDownIcon onClick={onSwitchTokens} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
