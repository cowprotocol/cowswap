import { ButtonPrimary, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  overflow: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
`

export const SwapInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 48px 0 19px 0;
`

export const SetTitle = styled.div`
  font-size: 23px;
  margin: 16px 0;
`

export const Title = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`

export const BtnWrapper = styled.div`
  margin: 15px;
`
export const ActionButton = styled(ButtonPrimary)``
