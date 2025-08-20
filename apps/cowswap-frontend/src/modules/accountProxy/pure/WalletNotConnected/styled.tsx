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

export const WalletIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 70px;
  background: var(${UI.COLOR_TEXT_OPACITY_10});
  display: flex;
  align-items: center;
  justify-content: center;

  > svg,
  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 25%;
    fill: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`
