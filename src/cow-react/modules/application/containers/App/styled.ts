import * as CSS from 'csstype'

import { Routes } from 'cow-react/constants/routes'
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
  width: auto;
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const BodyWrapper = styled.div<{ location: { pathname: string } }>`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding-top: 10vh;
  align-items: center;
  justify-content: center;
  flex: auto;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
  padding-top: 5vh;
  align-items: flex-start;
`}

  ${({ theme, location }) => theme.mediaWidth.upToMedium`
  padding: ${[Routes.SWAP].includes(location.pathname as Routes) ? '0 0 16px' : '0 16px 16px'};
`}
`
