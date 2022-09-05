import React from 'react'
import loadingCowWebp from 'assets/cow-swap/cow-load.webp'
import * as styledEl from './styled'
import { useSwapActionHandlers } from 'state/swap/hooks'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
}

export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps) {
  const { isLoading } = props

  const { onSwitchTokens } = useSwapActionHandlers()

  return (
    <styledEl.Box onClick={onSwitchTokens}>
      <styledEl.LoadingWrapper isLoading={isLoading}>
        {isLoading ? <styledEl.CowImg src={loadingCowWebp} alt="loading" /> : <styledEl.ArrowDownIcon />}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
