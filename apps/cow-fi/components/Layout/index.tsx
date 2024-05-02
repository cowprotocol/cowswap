import styled, { createGlobalStyle } from 'styled-components'
import { PropsWithChildren } from 'react'
import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import { Content } from './index.styles'
import { Color, Font, Media } from 'styles/variables'

const GlobalStyle = createGlobalStyle<{ fullWidthCoWAMM?: boolean }>`
  html, body {
    background-color: ${({ fullWidthCoWAMM }) => (fullWidthCoWAMM ? Color.cowammBlack : Color.darkBlue)};
  }
`

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
`

const BaseLayout = styled.main`
  display: flex;
  flex-flow: column wrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 0;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 0;
  width: 100%;
`

const FullWidthContent = styled(BaseLayout)`
  margin-top: -10.4rem;
`

const FullWidthGradient = styled(BaseLayout)`
  font-size: 1.6rem;
  padding: 14rem 0 5.6rem;
  min-height: 80rem;
  ${Color.gradientMesh};
  background-size: 100% 100%;
  background-attachment: fixed;
`

const FullWidthCoWAMM = styled(BaseLayout)`
  font-size: 1.6rem;
  padding: 18rem 0 5.6rem;
  min-height: 80rem;
  background: ${Color.cowammBlack};
  color: ${Color.cowammWhite};
  font-family: ${Font.circular};

  // mobile
  ${Media.mobile} {
    padding: 12rem 0 5.6rem;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: ${Font.flecha};
    font-weight: 500;
  }
`

type LayoutProps = PropsWithChildren<{
  fullWidth?: boolean
  fullWidthGradient?: boolean
  fullWidthGradientVariant?: boolean
  fullWidthCoWAMM?: boolean
}>

export default function Layout({ children, fullWidth, fullWidthGradientVariant, fullWidthCoWAMM }: LayoutProps) {
  let ContentComponent = Content

  if (fullWidth) {
    ContentComponent = FullWidthContent
  } else if (fullWidthGradientVariant) {
    ContentComponent = FullWidthGradient
  } else if (fullWidthCoWAMM) {
    ContentComponent = FullWidthCoWAMM
  }

  const isLightHeader = fullWidth || fullWidthGradientVariant
  const footerNoMargin = fullWidthGradientVariant

  return (
    <>
      <GlobalStyle fullWidthCoWAMM={fullWidthCoWAMM} />
      <Wrapper>
        <Header isLight={isLightHeader} isLightCoWAMM={fullWidthCoWAMM} />
        <ContentComponent>{children || 'No content found'}</ContentComponent>
        <Footer noMargin={footerNoMargin} isCoWAMM={fullWidthCoWAMM} />
      </Wrapper>
    </>
  )
}
