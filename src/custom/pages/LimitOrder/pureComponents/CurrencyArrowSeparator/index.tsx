import React from 'react'
import loadingCowWebp from 'assets/cow-swap/cow-load.webp'
import * as styledEl from './styled'

export interface CurrencyArrowSeparatorProps {
  isLoading: boolean
}

export function CurrencyArrowSeparator(props: CurrencyArrowSeparatorProps) {
  const { isLoading } = props

  return (
    <styledEl.Box>
      <styledEl.LoadingWrapper isLoading={isLoading}>
        {isLoading ? <styledEl.CowImg src={loadingCowWebp} alt="loading" /> : <styledEl.ArrowDownIcon />}
      </styledEl.LoadingWrapper>
    </styledEl.Box>
  )
}
