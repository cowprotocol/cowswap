import { PropsWithChildren } from 'react'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

import Card from 'legacy/components/Card'

const Wrapper = styled(Card)`
  background: linear-gradient(0deg, rgba(255, 233, 194, 0.8), rgba(255, 233, 194, 0.8)), #ffffff;
  flex-direction: row;
  display: flex;
  padding-left: 16px;
  padding-right: 32px;
  padding-top: 24px;
  padding-bottom: 24px;
`

const LeftContainer = styled.div`
  align-items: center;
  justify-content: center;
  padding-right: 16px;
  display: flex;
`
const RightContainer = styled.div`
  color: #764e07;
  font-size: 13px;
  line-height: 16px;
  a {
    color: #764e07;
  }
`

const WarningIcon = styled(AlertCircle)`
  min-height: 32px;
  min-width: 32px;
  color: #764e0766;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WarningCard({ children, className }: PropsWithChildren & { className?: string }) {
  return (
    <Wrapper className={className}>
      <LeftContainer>
        <WarningIcon />
      </LeftContainer>
      <RightContainer>{children}</RightContainer>
    </Wrapper>
  )
}
