import * as CSS from 'csstype'
import styled from 'styled-components/macro'

export const AppWrapper = styled.div<Partial<CSS.Properties>>`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? '400px' : '100vh')};
  height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'initial' : '100vh')};
`

export const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  z-index: 3;
`

export const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  width: 100%;
`

export const Marginer = styled.div`
  margin-top: 5rem;
`

export const MarginerBottom = styled.div`
  margin-bottom: 60px;
`

export const BodyWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: flex-start;
  justify-content: center;
  flex: 1 1 auto;
  z-index: 2;
  color: inherit;
  padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '16px 16px 0' : '5vh 16px 0')};

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: ${({ theme }) => (theme.isInjectedWidgetMode ? '0 0 16px' : '0 10px 16px')};
    flex: none;
  `}
`
