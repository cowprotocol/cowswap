import { ButtonOutlined, ButtonPrimary, ExternalLink, font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SuccessBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
  text-align: center;
`

export const IconWrap = styled.div`
  --status-bg: var(${UI.COLOR_SUCCESS_BG});
  --status-color: var(${UI.COLOR_SUCCESS_TEXT});

  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: var(--status-bg);
  color: var(--status-color);
`

export const Title = styled.h3`
  ${font('FONT_MEDIUM', 'semibold')}
  margin: 0;
  color: inherit;
`

export const Subtitle = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0;
  color: inherit;
`

export const ExplorerAnchor = styled(ExternalLink)`
  ${font('FONT_SMALL_PLUS', 'medium')}
  color: var(${UI.COLOR_PRIMARY});

  &:hover {
    color: var(${UI.COLOR_PRIMARY});
  }
`

export const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
`

export const NewTradeButton = styled(ButtonOutlined)`
  ${font('FONT_MEDIUM', 'semibold')}
  width: 100%;
  min-height: 48px;
  color: var(${UI.COLOR_TEXT});
`

export const ViewOrdersButton = styled(ButtonPrimary)`
  ${font('FONT_MEDIUM', 'semibold')}
  width: 100%;
  min-height: 48px;
`
