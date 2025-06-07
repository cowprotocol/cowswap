import { ReactElement } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import * as styledEl from './styled'

interface Props {
  label: string
  tooltip?: string | ReactElement
  prefix?: string | ReactElement
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FieldLabel({ label, tooltip, prefix }: Props) {
  return (
    <styledEl.Label>
      {prefix}
      <styledEl.LabelText>{label}</styledEl.LabelText>
      {tooltip && <InfoTooltip content={tooltip} />}
    </styledEl.Label>
  )
}
