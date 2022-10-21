import * as CSS from 'csstype'

import { Routes } from '@cow/constants/routes'
import styled from 'styled-components/macro'

export const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: 100vh;
`

export const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`

export const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  width: 100%;
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const BodyWrapper = styled.div<{ location: { pathname: string } }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  justify-content: center;
  align-items: flex-start;
  flex: auto;
  z-index: 1;
  padding: ${({ location }) => ([Routes.SWAP].includes(location.pathname as Routes) ? '5vh 0 0' : '5vh 0 240px')};

  ${({ theme, location }) => theme.mediaWidth.upToMedium`
    padding: ${[Routes.SWAP].includes(location.pathname as Routes) ? '0 0 16px' : '0 16px 16px'};
  `}
`
