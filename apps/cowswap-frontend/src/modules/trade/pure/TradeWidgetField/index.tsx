import { ReactElement } from 'react'

import { HelpTooltip, renderTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { Content, ErrorText, TradeWidgetFieldBox, TradeWidgetFieldLabel } from './styled'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: React.ReactNode
  children?: ReactElement
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltip?: React.ReactNode | ((params: any) => React.ReactNode)
  error?: TradeWidgetFieldError
  className?: string
  hasPrefix?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { className, children, label, tooltip, error, hasPrefix } = props
  const tooltipElement = renderTooltip(tooltip, props)

  return (
    <TradeWidgetFieldBox className={className} hasPrefix={hasPrefix}>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {tooltip && <HelpTooltip text={tooltipElement} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
