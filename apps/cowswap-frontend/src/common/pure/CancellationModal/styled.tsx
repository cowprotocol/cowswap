import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import NotificationBanner from 'legacy/components/NotificationBanner'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin: 0 auto;
  width: 100%;
`

export const TypeButton = styled.button<{ isOnChain$: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background: ${({ isOnChain$ }) => (isOnChain$ ? `var(${UI.COLOR_INFO_BG})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ isOnChain$ }) => (isOnChain$ ? `var(${UI.COLOR_INFO_TEXT})` : 'inherit')};
  padding: 4px 8px;
  border-radius: 4px;
  outline: none;
  border: 0;
  margin: 0 3px;
  font-size: inherit;
  cursor: pointer;

  :hover {
    outline: 1px solid
      ${({ isOnChain$ }) => (isOnChain$ ? `var(${UI.COLOR_INFO_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_25})`)};
  }
`

export const StyledNotificationBanner = styled(NotificationBanner)`
  margin-top: 15px;
  margin-bottom: 0;
  box-sizing: border-box;
`

export const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: var(${UI.COLOR_PAPER_DARKER});
  line-height: 1.6;
`

export const OrderTypeDetails = styled.div`
  margin: 0 0 15px 5px;
  padding-left: 10px;
  border-left: 3px solid var(${UI.COLOR_TEXT_OPACITY_25});

  > p {
    margin: 0 0 10px 0;
  }

  > p:last-child {
    margin-bottom: 0;
  }
`
