import styled from 'styled-components/macro'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'

import CurrencyInputPanelMod, { CurrencyInputPanelProps, Wrapper } from './CurrencyInputPanelMod'
import CurrencySearchModalUni from '@src/components/SearchModal/CurrencySearchModal'

import { LONG_LOAD_THRESHOLD } from 'constants/index'

export const CurrencySearchModal = styled(CurrencySearchModalUni)`
  > [data-reach-dialog-content] {
    max-width: 520px;
    background-color: ${({ theme }) => theme.bg1};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
      border-radius: 0;
    `}
  }
`

export function CurrencyInputPanel(props: CurrencyInputPanelProps) {
  const { currency } = props
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  return (
    <Wrapper selected={!!currency} showLoader={showLoader}>
      <CurrencyInputPanelMod {...props} />
    </Wrapper>
  )
}

export default CurrencyInputPanel
