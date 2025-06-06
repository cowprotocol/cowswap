import { ReactNode } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import { CornerDownRight } from 'react-feather'

import { Content, Row, Wrapper, Label } from './styled'

import { TimelineDot } from '../Row/styled'

export type ConfirmDetailsItemProps = {
  children: ReactNode
  label?: ReactNode
  labelOpacity?: boolean
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
  withTimelineDot?: boolean
  highlighted?: boolean
  contentTextColor?: string
  isLast?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ConfirmDetailsItem(props: ConfirmDetailsItemProps) {
  const {
    children,
    label,
    labelOpacity = false,
    tooltip,
    withArrow = false,
    withTimelineDot = false,
    contentTextColor,
    isLast = false,
  } = props

  return (
    <Wrapper>
      {withArrow && <CornerDownRight size={14} />}
      {withTimelineDot && <TimelineDot isLast={isLast} />}
      {label ? (
        <Row>
          {label && (
            <Label labelOpacity={labelOpacity}>
              {label}
              {tooltip && <InfoTooltip className="info-tooltip" content={tooltip} />}
            </Label>
          )}

          <Content contentTextColor={contentTextColor}>{children}</Content>
        </Row>
      ) : (
        children
      )}
    </Wrapper>
  )
}
