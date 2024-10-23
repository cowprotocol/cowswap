import { TokenName, TokenSymbol, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
`

export const TokenInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  gap: 10px;
`

export const TokenWrapper = styled(TokenInfoWrapper)`
  padding: 20px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
`

export const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 20px;
`

export const StyledTokenSymbol = styled(TokenSymbol)`
  font-size: 21px;
  font-weight: 600;
`

export const StyledTokenName = styled(TokenName)`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const InfoRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  width: 100%;
  gap: 10px;
  border-bottom: 1px solid var(${UI.COLOR_BORDER});
  padding: 14px 0;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  > div:first-child {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }
`

export const SelectButton = styled.button`
  display: inline-block;
  background: #bcec79;
  color: #194d05;
  font-size: 14px;
  font-weight: bold;
  border-radius: 24px;
  padding: 10px 24px;
  text-decoration: none;
  border: 0;
  outline: 0;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`
