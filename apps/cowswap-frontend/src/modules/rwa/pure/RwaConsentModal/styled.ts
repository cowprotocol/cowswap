import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: block;
  width: 100%;
  background: var(${UI.COLOR_PAPER});
  border-radius: 20px;
  overflow: auto;
`

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 20px 20px;
`

export const TokenBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;
`

export const TokenSymbolName = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: inherit;
  text-align: left;
`

export const TokenSymbol = styled.span`
  font-weight: 700;
`

export const TokenNameDivider = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`

export const TokenName = styled.span`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-weight: 400;
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: inherit;

  p {
    margin: 0;
  }
`

export const AcknowledgementSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 8px 0;

  p {
    margin: 0;
    font-weight: 500;
  }
`

export const BulletList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;

  li {
    margin: 0;
    line-height: 1.5;
  }
`

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;

  > button {
    width: 100%;
    min-height: 56px;
  }
`
