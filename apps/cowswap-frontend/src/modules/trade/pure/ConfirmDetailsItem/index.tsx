import { ReactNode } from 'react'

import { RowFixed } from '@cowprotocol/ui'

import { CornerDownRight } from 'react-feather'

import { InfoIcon } from 'legacy/components/InfoIcon'

import { TextWrapper } from 'modules/swap/pure/Row/styled'
import { TimelineDot } from 'modules/trade/pure/Row/styled'

import { Content, Row, Wrapper } from './styled'

export type ConfirmDetailsItemProps = {
  children: ReactNode
  label?: ReactNode
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
  withTimelineDot?: boolean
}

export function ConfirmDetailsItem(props: ConfirmDetailsItemProps) {
  const { children, label, tooltip, withArrow = false, withTimelineDot = false } = props

  return (
    <Wrapper>
      {withArrow && <CornerDownRight size={14} />}
      {withTimelineDot && <TimelineDot />}

      {label ? (
        <Row>
          <RowFixed>
            {label && <TextWrapper>{label}</TextWrapper>}
            {tooltip && <InfoIcon content={tooltip} />}
          </RowFixed>

          <Content>{children}</Content>
        </Row>
      ) : (
        children
      )}
    </Wrapper>
  )
}
