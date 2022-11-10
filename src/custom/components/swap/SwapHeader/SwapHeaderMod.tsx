import { Percent } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'

import { RowBetween, RowFixed } from 'components/Row'
import SettingsTab from 'components/Settings'
import { TradeWidgetLinks } from '@cow/modules/application/containers/TradeWidgetLinks'

const StyledSwapHeader = styled.div`
  padding: 1rem 1.25rem 0.5rem 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader({ allowedSlippage, className }: { allowedSlippage: Percent; className?: string }) {
  return (
    <StyledSwapHeader className={className}>
      <RowBetween>
        <TradeWidgetLinks />
        <RowFixed>
          <SettingsTab placeholderSlippage={allowedSlippage} />
        </RowFixed>
      </RowBetween>
    </StyledSwapHeader>
  )
}
