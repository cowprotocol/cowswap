import React from 'react'
import styled from 'styled-components'

import Version from '../Version'

const FooterVersion = styled(Version)`
  margin-right: auto;
  min-width: max-content;
`

const Wrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  justify-content: space-evenly;
  margin: auto 6rem 0 2rem;

  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `}
`

export default function Footer({ children }: { children?: React.ReactChildren }) {
  return (
    <Wrapper>
      <FooterVersion />
      {children}
    </Wrapper>
  )
}
