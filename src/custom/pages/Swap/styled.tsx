import styled from 'styled-components/macro'
import { RowBetween } from 'components/Row'

export const LowerSectionWrapper = styled(RowBetween).attrs((props) => ({
  ...props,
  align: 'center',
  flexDirection: 'row',
  flexWrap: 'wrap',
  minHeight: 24,
}))`
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
    stroke: ${({ theme }) => theme.text2};
  }
`
