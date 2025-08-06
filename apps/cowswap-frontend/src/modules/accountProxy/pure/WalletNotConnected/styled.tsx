import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Container = styled.div`
  width: 100%;
`

export const Wrapper = styled.div`
  border: 1px solid var(${UI.COLOR_BORDER});
  border-radius: 16px;
  text-align: center;
  margin-bottom: 16px;
  padding: 15px 0;

  > img {
    width: 70%;
    margin-top: 16px;
  }

  > p {
    font-size: 15px;
    font-weight: 500;
  }
`
