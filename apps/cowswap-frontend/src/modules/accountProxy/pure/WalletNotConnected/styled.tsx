import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`

export const Wrapper = styled.div`
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 16px;
  text-align: center;
  margin: 0;
  padding: 32px 32px 0;

  > p {
    font-size: 15px;
    font-weight: 500;
    margin: 16px auto;
  }
`
