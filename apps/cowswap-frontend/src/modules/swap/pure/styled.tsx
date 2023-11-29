import { RowBetween } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Info } from 'react-feather'
import styled from 'styled-components/macro'

export const LowerSectionWrapper = styled(RowBetween).attrs((props) => ({
  ...props,
  align: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  minHeight: 24,
}))`
  gap: 0;

  > .price-container {
    display: flex;
    gap: 5px;
  }
`

export const BottomGrouping = styled.div`
  > div > button {
    align-self: stretch;
  }

  div > svg,
  div > svg > path {
    stroke: var(${UI.COLOR_SECONDARY_TEXT});
  }
`
export const LightGreyText = styled.span`
  font-weight: 400;
  color: ${`var(${UI.COLOR_TEXT_OPACITY_25})`};
`

export const StyledInfoIcon = styled(Info)`
  opacity: 0.5;
  stroke: var(${UI.COLOR_TEXT});
  line-height: 0;
  vertical-align: middle;
  transition: opacity 0.2s ease-in-out;

  :hover {
    opacity: 1;
  }
`

export const TransactionText = styled.span`
  display: flex;
  gap: 3px;
  cursor: pointer;

  > i {
    font-style: normal;
  }
`
