import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const DemoTracker = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(${UI.COLOR_TEXT_OPACITY_10});
`

export const DemoTrackerLabel = styled.p`
  margin: 0 0 12px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
`
