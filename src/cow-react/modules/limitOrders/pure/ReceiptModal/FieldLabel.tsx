import * as styledEl from './styled'
import { InfoIcon } from 'components/InfoIcon'

interface FieldLabelProps {
  label: string
  tooltip: string
}

export function FieldLabel({ label, tooltip }: FieldLabelProps) {
  return (
    <styledEl.Label>
      <styledEl.LabelText>{label}</styledEl.LabelText>
      <InfoIcon content={tooltip} />
    </styledEl.Label>
  )
}
