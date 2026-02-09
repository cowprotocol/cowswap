import { HelpTooltip, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const WarningIndicator = styled.button<{ hasBackground?: boolean }>`
  --height: 28px;
  margin: 0;
  background: ${({ hasBackground = true }) => (hasBackground ? `var(${UI.COLOR_DANGER_BG})` : 'transparent')};
  color: var(${UI.COLOR_DANGER});
  line-height: 0;
  border: 0;
  padding: 0;
  width: auto;
  height: var(--height);
  border-radius: 0 9px 9px 0;

  svg {
    cursor: help;
    color: inherit;
  }

  svg > path {
    fill: currentColor;
    stroke: none;
  }
`

export const WarningContent = styled.div`
  max-width: 270px;
  padding: 10px;

  h3,
  p {
    margin: 0;
    line-height: 1.2;
  }

  h3 {
    margin-bottom: 8px;
  }
`

export const StyledQuestionHelper = styled(HelpTooltip)`
  margin: 0;
`

export const WarningParagraph = styled.div`
  margin-bottom: 20px;

  :last-child {
    margin-bottom: 0;
  }
`

export const WarningActionBox = styled.div`
  margin-top: 15px;
`
