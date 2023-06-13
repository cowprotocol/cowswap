import { ReactNode } from 'react'

import { CornerDownRight } from 'react-feather'

import { RowFixed } from 'legacy/components/Row'
import { MouseoverTooltipContent } from 'legacy/components/Tooltip'

import { TextWrapper } from 'modules/swap/pure/Row/styled'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { Content, Row, Wrapper } from './styled'

type Props = {
  children: ReactNode
  label?: string
  tooltip?: ReactNode
  withArrow?: boolean
  fiatAmount?: string
}

export function ConfirmDetailsItem(props: Props) {
  const { children, label, tooltip, withArrow = true } = props

  return (
    <Wrapper>
      {withArrow && <CornerDownRight size={16} />}

      {label ? (
        <>
          <Row>
            <RowFixed>
              {label && <TextWrapper>{label}</TextWrapper>}
              {tooltip && (
                <MouseoverTooltipContent content={tooltip} wrap>
                  <StyledInfoIcon size={16} />
                </MouseoverTooltipContent>
              )}
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
