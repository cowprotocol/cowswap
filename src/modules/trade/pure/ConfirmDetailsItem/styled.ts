import styled from 'styled-components/macro'

import { StyledRowBetween } from 'modules/swap/pure/Row/styled'

export const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > svg:first-child {
    margin: 0 4px 0 0;
    color: ${({ theme }) => theme.text1};
    opacity: 0.5;
  }
`

export const Row = styled(StyledRowBetween)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Content = styled.div`
  margin: 0 0 0 auto;
  font-weight: 500;
  font-size: 13px;

  i {
    font-style: normal;
    opacity: 0.7;
  }
`
