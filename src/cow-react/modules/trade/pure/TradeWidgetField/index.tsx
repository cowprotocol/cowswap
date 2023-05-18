import { Wrapper, Label, Content, ErrorText, WarningText } from './styled'
import { Trans } from '@lingui/macro'
import { Nullish } from '@cow/types'
import QuestionHelper from 'components/QuestionHelper'

export interface TradeWidgetFieldProps {
  label: string
  children?: JSX.Element
  hint?: JSX.Element | string
  error?: Nullish<string>
  warning?: Nullish<string>
}

export function TradeWidgetField(props: TradeWidgetFieldProps) {
  const { children, label, hint, error, warning } = props
  return (
    <Wrapper>
      <Label>
        <Trans>{label}</Trans>
        {hint && <QuestionHelper text={hint} />}
      </Label>
      <Content>{children}</Content>
      {error && <ErrorText>{error}</ErrorText>}
      {warning && <WarningText>{warning}</WarningText>}
    </Wrapper>
  )
}
