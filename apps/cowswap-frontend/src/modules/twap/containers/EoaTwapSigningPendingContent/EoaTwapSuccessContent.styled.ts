import { ButtonOutlined, ExternalLink, font, UI } from '@cowprotocol/ui'

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

export const ViewOrdersButton = styled(ButtonOutlined)`
  ${font('FONT_MEDIUM', 'semibold')}
  width: 100%;
  min-height: 48px;
  color: var(${UI.COLOR_TEXT});

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
    border: 1px solid var(${UI.COLOR_PRIMARY});
  }
`

export const ExplorerAnchor = styled(ExternalLink)`
  ${font('FONT_SMALL_PLUS', 'medium')}
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_WHITE})` : `var(${UI.COLOR_BLUE})`)};

  && {
    text-decoration: underline;
  }

  &:hover {
    color: var(${UI.COLOR_INFO});
  }
`
