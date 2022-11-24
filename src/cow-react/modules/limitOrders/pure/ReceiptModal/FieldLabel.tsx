import * as styledEl from './styled'
import { InfoIcon } from 'components/InfoIcon'

interface Props {
  label: string
  tooltip: string
}

export function FieldLabel({ label, tooltip }: Props) {
  return (
    <styledEl.Label>
      <styledEl.LabelText>{label}</styledEl.LabelText>
      <InfoIcon content={tooltip} />
    </styledEl.Label>
  )
}
