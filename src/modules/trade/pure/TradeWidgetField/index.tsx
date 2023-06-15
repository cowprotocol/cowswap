import React from 'react'

import { Trans } from '@lingui/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'
import { renderTooltip } from 'legacy/components/Tooltip'

import { TradeWidgetFieldBox, TradeWidgetFieldLabel, Content, ErrorText } from './styled'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: React.ReactNode
  children?: JSX.Element
  tooltip?: React.ReactNode | ((params: any) => React.ReactNode)
  error?: TradeWidgetFieldError
  className?: string
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { className, children, label, tooltip, error } = props
  const tooltipElement = renderTooltip(tooltip, props)

  return (
    <TradeWidgetFieldBox className={className}>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {tooltip && <QuestionHelper text={tooltipElement} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
