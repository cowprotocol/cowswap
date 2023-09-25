import { RowBetween } from '@cowprotocol/ui'

import { transparentize } from 'polished'
import { Info } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

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
    stroke: var(${UI.COLOR_TEXT2});
  }
`
export const LightGreyText = styled.span`
  font-weight: 400;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`

export const StyledInfoIcon = styled(Info)`
  opacity: 0.5;
  stroke: var(${UI.COLOR_TEXT1});
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
