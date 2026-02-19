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

export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps): ReactNode {
  const {
    isLoading,
    onSwitchTokens,
    isCollapsed = true,
    hasSeparatorLine,
    disabled = false,
    isDarkMode = false,
  } = props
  const isInjectedWidgetMode = isInjectedWidget()

  return (
    <styledEl.Box
      id="currency-arrow-separator"
      data-isLoading={isLoading ? true : undefined}
      isCollapsed={isCollapsed}
      hasSeparatorLine={hasSeparatorLine}
      disabled={disabled}
    >
      <styledEl.LoadingWrapper isLoading={isLoading} onClick={disabled ? undefined : onSwitchTokens}>
        {!isInjectedWidgetMode && isLoading ? (
          <CowLoadingIcon size={26} isDarkMode={isDarkMode} />
        ) : (
          <styledEl.ArrowDownIcon disabled={disabled} />
        )}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
