import React from 'react'

import loadingCowWebp from '@cowprotocol/assets/cow-swap/cow-load.webp'
import { isInjectedWidget } from '@cowprotocol/common-utils'

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
  const { isLoading, onSwitchTokens, withRecipient, isCollapsed = true, hasSeparatorLine } = props
  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <styledEl.Box withRecipient={withRecipient} isCollapsed={isCollapsed} hasSeparatorLine={hasSeparatorLine}>
      <styledEl.LoadingWrapper isLoading={isLoading}>
        {!isInjectedWidgetMode && isLoading ? (
          <styledEl.CowImg src={loadingCowWebp} alt="loading" />
        ) : (
          <styledEl.ArrowDownIcon onClick={onSwitchTokens} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
