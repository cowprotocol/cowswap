import { ReactNode } from 'react'

import { isInjectedWidget } from '@cowprotocol/common-utils'

import { CowLoadingIcon } from 'common/pure/CowLoadingIcon'

import * as styledEl from './styled'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
  disabled?: boolean
  hasSeparatorLine?: boolean
  isCollapsed?: boolean
  isDarkMode?: boolean
  onSwitchTokens(): void
}

export function CurrencyArrowSeparator({
  isLoading,
  onSwitchTokens,
  isCollapsed = true,
  hasSeparatorLine,
  disabled = false,
  isDarkMode = false,
}: CurrencyArrowSeparatorProps): ReactNode {
  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <styledEl.Box isCollapsed={isCollapsed} hasSeparatorLine={hasSeparatorLine}>
      <styledEl.LoadingWrapper $isLoading={isLoading} disabled={disabled} onClick={onSwitchTokens}>
        {!isInjectedWidgetMode && isLoading ? (
          <CowLoadingIcon size={26} isDarkMode={isDarkMode} />
        ) : (
          <styledEl.ArrowDownIcon disabled={disabled} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
