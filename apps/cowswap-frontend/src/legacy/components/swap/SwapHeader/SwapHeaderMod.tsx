import { RowBetween, RowFixed } from '@cowprotocol/ui'
import { Percent } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import SettingsTab from 'legacy/components/Settings'

import { TradeWidgetLinks } from 'modules/application/containers/TradeWidgetLinks'

import { UI } from '@cowprotocol/ui'

const StyledSwapHeader = styled.div`
  width: 100%;
  color: var(${UI.COLOR_SECONDARY_TEXT});
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
