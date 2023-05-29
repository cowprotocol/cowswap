import { InfoIcon } from 'legacy/components/InfoIcon'

import * as styledEl from './styled'

interface Props {
  label: string
  tooltip?: string | JSX.Element
}

export function FieldLabel({ label, tooltip }: Props) {
  return (
    <styledEl.Label>
      <styledEl.LabelText>{label}</styledEl.LabelText>
      {tooltip && <InfoIcon content={tooltip} />}
    </styledEl.Label>
  )
}
