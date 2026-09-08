import { ReactNode } from 'react'

import { InfoTooltip } from '@cowprotocol/ui'

import { CornerDownRight } from 'react-feather'

import { Content, Row, Wrapper, Label } from './styled'

import { TimelineDot } from '../Row/styled'

export type ConfirmDetailsItemProps = {
  children: ReactNode
  label?: ReactNode
  className?: string
  /** Test hook for the whole row — most rows don't need one, only those an e2e test targets. */
  testId?: string
  labelOpacity?: boolean
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
  withTimelineDot?: boolean
  highlighted?: boolean
  contentTextColor?: string
  isLast?: boolean
}

export function ConfirmDetailsItem(props: ConfirmDetailsItemProps): ReactNode {
  const {
    children,
    className,
    testId,
    label,
    labelOpacity = false,
    tooltip,
    withArrow = false,
    withTimelineDot = false,
    contentTextColor,
    isLast = false,
  } = props

  return (
    <Wrapper className={className} data-testid={testId}>
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
