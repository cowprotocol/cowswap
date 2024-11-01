import { ExternalLink, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  --grid-columns: 1fr 90px 60px 20px;
  display: flex;
  flex-direction: column;
  overflow: auto;
  margin: 0 0 20px;
  height: 100%;
`

export const LpTokenWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const ListHeader = styled.div`
  display: grid;
  grid-template-columns: var(--grid-columns);
  font-size: 12px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  margin: 0 25px 15px 20px;
`

export const ListItem = styled.div`
  display: grid;
  grid-template-columns: var(--grid-columns);
  padding: 10px 20px;
  cursor: pointer;
  font-size: 14px;
  align-items: center;

  &:hover {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const LpTokenInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  > strong {
    font-weight: 600;
  }

  > p {
    margin: 0;
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_60});
    letter-spacing: -0.02rem;
  }
`

export const LpTokenYieldPercentage = styled.span`
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
`

export const LpTokenBalance = styled.span`
  display: flex;
  align-items: center;
  font-size: 14px;
  letter-spacing: -0.02rem;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 0 8px 0 0;
`

export const LpTokenTooltip = styled.div`
  display: flex;
  align-items: center;
  margin: auto;
  gap: 6px;
  opacity: 0.8;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
`

export const NoPoolWrapper = styled.div`
  border-top: 1px solid var(${UI.COLOR_BORDER});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 20px 20px 0;
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  margin: auto 0 0;

  > div {
    flex: 1;
  }
`

export const CreatePoolLink = styled(ExternalLink)`
  display: inline-block;
  background: #bcec79;
  color: #194d05;
  font-size: 16px;
  font-weight: bold;
  border-radius: 24px;
  padding: 10px 24px;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`

export const EmptyList = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const MobileCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(${UI.COLOR_PAPER});
  padding: 20px;
  border-bottom: 1px solid var(${UI.COLOR_PAPER_DARKER});
`

export const MobileCardRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

export const MobileCardLabel = styled.span`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const MobileCardValue = styled.span`
  font-size: 16px;
  font-weight: 600;
`
