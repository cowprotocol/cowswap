import { ReactNode } from 'react'

import { CornerDownRight } from 'react-feather'

import { InfoIcon } from 'legacy/components/InfoIcon'
import { RowFixed } from 'legacy/components/Row'

import { TextWrapper } from 'modules/swap/pure/Row/styled'

import { Content, Row, Wrapper } from './styled'

export type ConfirmDetailsItemProps = {
  children: ReactNode
  label?: ReactNode
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
}

export function ConfirmDetailsItem(props: ConfirmDetailsItemProps) {
  const { children, label, tooltip, withArrow = true } = props

  return (
    <Wrapper>
      {withArrow && <CornerDownRight size={14} />}

      {label ? (
        <>
          <Row>
            <RowFixed>
              {label && <TextWrapper>{label}</TextWrapper>}
              {tooltip && <InfoIcon content={tooltip} />}
            </RowFixed>

            <Content>{children}</Content>
          </Row>
        </>
      ) : (
        children
      )}
    </Wrapper>
  )
}
