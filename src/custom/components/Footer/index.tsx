import React from 'react'
import styled from 'styled-components'

import Version from '../Version'
// import ClickWrap from '../ClickWrap'

const FooterVersion = styled(Version)`
  margin-right: auto;
  min-width: max-content;

  > div {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 0 8px;
    `}
  }
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-evenly;
  margin: auto 96px 0 32px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin: 0 auto 150px;
  `}
`

const FooterWrapper = styled.div`
  width: 100%;
`

export default function Footer({ children }: { children?: React.ReactChildren }) {
  return (
    <Wrapper>
      {/* <ClickWrap /> */}
      <FooterWrapper>
        <FooterVersion />
        {children}
      </FooterWrapper>
    </Wrapper>
  )
}
