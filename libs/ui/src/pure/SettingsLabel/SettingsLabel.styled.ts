import styled from 'styled-components/macro'

import { HelpTooltip } from '../HelpTooltip'

export const SettingsLabelTitle = styled.div`
  position: relative;
  z-index: 1;
  font-weight: 400;
  color: inherit;
  font-size: 14px;
  text-wrap: balance;
`

export const SettingsLabelHelpTooltip = styled(HelpTooltip)`
  display: inline-flex;
  vertical-align: middle;
`
