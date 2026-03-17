import { ReactElement, ReactNode } from 'react'

import { HelpCircle, CheckCircle, AlertTriangle, XOctagon } from 'react-feather'

import * as styledEl from './SettingsFeedback.styled'

import { HelpTooltip } from '../HelpTooltip'

export type SettingsFeedbackVariant = 'error' | 'warning' | 'success' | 'info'

const SETTINGS_FEEDBACK_VARIANT_ICONS = {
  success: <CheckCircle size={16} />,
  warning: <AlertTriangle size={16} />,
  error: <XOctagon size={16} />,
  info: <HelpCircle size={16} />,
} as const satisfies Record<SettingsFeedbackVariant, ReactNode>

export interface SettingsFeedbackProps {
  variant: SettingsFeedbackVariant
  message: string
  tooltip?: ReactNode
}

export function SettingsFeedback({ variant, message, tooltip }: SettingsFeedbackProps): ReactElement {
  const icon = SETTINGS_FEEDBACK_VARIANT_ICONS[variant]

  return (
    <styledEl.FeedbackWrapper $variant={variant}>
      {tooltip ? <HelpTooltip Icon={icon} text={tooltip} noMargin /> : icon}
      {message}
    </styledEl.FeedbackWrapper>
  )
}
