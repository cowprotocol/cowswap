import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TransactionInnerDetail = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  text-align: center;
  border-radius: 12px;
  padding: 20px 16px 16px;
  color: inherit;
  margin: 24px auto 0 0;
  border: 1px solid ${({ theme }) => `${theme.darkMode ? 'rgb(197 218 239 / 10%)' : 'rgb(16 42 72 / 20%)'}`};
  gap: 10px;

  ${Media.upToSmall()} {
    margin: 24px auto 12px;
    width: 100%;
    max-width: 100%;
    grid-column: 1 / -1;
  }

  > span {
    flex: 1 1 auto;
    margin: 0;
  }

  > span:last-of-type {
    margin: 3px 0 12px;
  }
`
