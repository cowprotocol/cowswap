import { TokenAmount, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const TokenWrapper = styled.div`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 14px;
  margin-bottom: 10px;

  > p {
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    margin: 0;
    padding: 0;
  }
`

export const BalanceWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

export const TokenLogoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 5px 10px 5px 5px;
  align-items: center;
  background: var(${UI.COLOR_PAPER});
  border-radius: 100px;
  font-weight: 500;
  font-size: 18px;
  box-shadow: var(${UI.BOX_SHADOW_2});
`

export const TokenAmountStyled = styled(TokenAmount)`
  font-size: 28px;
  font-weight: 500;
`
