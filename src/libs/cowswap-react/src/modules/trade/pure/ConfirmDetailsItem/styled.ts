import styled from 'styled-components/macro'

import { StyledRowBetween } from 'modules/swap/pure/Row/styled'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin-right: 5px;
    color: ${({ theme }) => theme.text1};
  }
`

export const Row = styled(StyledRowBetween)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Content = styled.div`
  margin-left: auto;
`
