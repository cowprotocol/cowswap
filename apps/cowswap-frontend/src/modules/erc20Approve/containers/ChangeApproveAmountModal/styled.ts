import { ButtonPrimary, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  overflow: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: 21px;
`

export const SwapInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 21px;
  align-items: center;
  margin: 24px 0;
  font-size: 13px;
`

export const SetTitle = styled.div`
  font-size: 23px;
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 18px;
  }
`

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const BtnWrapper = styled.div`
  margin: 0 10px 10px;
`
export const ActionButton = styled(ButtonPrimary)``
