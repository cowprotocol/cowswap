import React from 'react'

import loadingCowWebp from '@cowprotocol/assets/cow-swap/cow-load.webp'
import { isInjectedWidget } from '@cowprotocol/common-utils'

import * as styledEl from './styled'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
  disabled?: boolean
  hasSeparatorLine?: boolean
  isCollapsed?: boolean
  onSwitchTokens(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps) {
  const { isLoading, onSwitchTokens, isCollapsed = true, hasSeparatorLine, disabled = false } = props
  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <styledEl.Box isCollapsed={isCollapsed} hasSeparatorLine={hasSeparatorLine} disabled={disabled}>
      <styledEl.LoadingWrapper isLoading={isLoading} onClick={disabled ? undefined : onSwitchTokens}>
        {!isInjectedWidgetMode && isLoading ? (
          <styledEl.CowImg src={loadingCowWebp} alt="loading" />
        ) : (
          <styledEl.ArrowDownIcon disabled={disabled} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
