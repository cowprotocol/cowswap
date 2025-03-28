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
}

export function ConfirmDetailsItem(props: ConfirmDetailsItemProps) {
  const {
    children,
    label,
    labelOpacity = false,
    tooltip,
    withArrow = false,
    withTimelineDot = false,
    contentTextColor,
  } = props

  return (
    <Wrapper>
      {withArrow && <CornerDownRight size={14} />}
      {withTimelineDot && <TimelineDot />}
      {label ? (
        <Row>
          <div>
            {label && (
              <Label labelOpacity={labelOpacity}>
                <div>
                  {label} {tooltip && <InfoTooltip className="info-tooltip" content={tooltip} />}
                </div>
              </Label>
            )}
          </div>

          <Content contentTextColor={contentTextColor}>{children}</Content>
        </Row>
      ) : (
        children
      )}
    </Wrapper>
  )
}
