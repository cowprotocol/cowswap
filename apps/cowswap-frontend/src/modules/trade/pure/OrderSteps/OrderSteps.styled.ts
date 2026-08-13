import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const StepsList = styled.ol`
  --circle-size: 24px;
  --inner-circle-size: 12px;
  --icon-size: 14px;
  --status-bg: var(${UI.COLOR_TEXT_OPACITY_10});
  --status-color: var(${UI.COLOR_TEXT_OPACITY_70});
  --spacing-around: 12px;

  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  gap: 0;
  width: 100%;
  margin-inline: auto;
`
