import styled from 'styled-components/macro'

import { SettingsFeedbackVariant } from './SettingsFeedback.pure'

import { UI } from '../../enum'

const SETTINGS_FEEDBACK_VARIANT_COLORS = {
  success: UI.COLOR_GREEN,
  warning: UI.COLOR_WARNING,
  error: UI.COLOR_DANGER,
  info: UI.COLOR_PRIMARY,
} as const satisfies Record<SettingsFeedbackVariant, string>

export const FeedbackWrapper = styled.div<{ $variant: SettingsFeedbackVariant }>`
  display: flex;
  gap: 4px;
  width: 100%;
  color: var(${({ $variant }) => SETTINGS_FEEDBACK_VARIANT_COLORS[$variant]});
  font-size: 13px;
  margin: 0;

  & svg {
    width: 16px;
    height: 16px;
    min-width: 16px;
  }
`
