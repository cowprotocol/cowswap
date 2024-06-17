import { ReactNode } from 'react'

import { RowFixed } from '@cowprotocol/ui'
import { InfoTooltip } from '@cowprotocol/ui'

import { CornerDownRight } from 'react-feather'

import { TimelineDot } from 'modules/trade/pure/Row/styled'

import { Content, Row, Wrapper, Label } from './styled'

export type ConfirmDetailsItemProps = {
  children: ReactNode
  label?: ReactNode
  labelOpacity?: boolean
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
  withTimelineDot?: boolean
  highlighted?: boolean
  alwaysRow?: boolean
}

export function ConfirmDetailsItem(props: ConfirmDetailsItemProps) {
  const {
    children,
    label,
    labelOpacity = false,
    tooltip,
    withArrow = false,
    withTimelineDot = false,
    alwaysRow = false,
  } = props

  return (
    <Wrapper alwaysRow={alwaysRow}>
      {withArrow && <CornerDownRight size={14} />}
      {withTimelineDot && <TimelineDot />}
      {label ? (
        <Row>
          <RowFixed>
            {label && <Label labelOpacity={labelOpacity}>{label}</Label>}
            {tooltip && <InfoTooltip content={tooltip} />}
          </RowFixed>

          <Content>{children}</Content>
        </Row>
      ) : (
        children
      )}
    </Wrapper>
  )
}
