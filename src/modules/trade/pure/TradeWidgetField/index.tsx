import React from 'react'

import { Trans } from '@lingui/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'

import { TradeWidgetFieldBox, TradeWidgetFieldLabel, Content, ErrorText } from './styled'

export type TradeWidgetFieldError = { type: 'error' | 'warning'; text: string | null } | null

export interface TradeWidgetFieldProps {
  label: React.ReactNode
  children?: JSX.Element
  hint?: React.ReactNode | ((params: any) => React.ReactNode)
  error?: TradeWidgetFieldError
  className?: string
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { className, children, label, hint, error } = props
  let hintElement: React.ReactNode;

  if (typeof hint === 'function') {
    hintElement = hint(props);
  } else {
    hintElement = hint;
  }

  return (
    <TradeWidgetFieldBox className={className}>
      <TradeWidgetFieldLabel>
        <Trans>{label}</Trans>
        {hint && <QuestionHelper text={hintElement} />}
      </TradeWidgetFieldLabel>
      <Content>{children}</Content>
      {error && <ErrorText type={error.type}>{error.text}</ErrorText>}
    </TradeWidgetFieldBox>
  )
}
