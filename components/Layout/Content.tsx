import styled from 'styled-components';
import { PropsWithChildren } from 'react'

import { siteConfig } from 'const/meta'
import { mainMenu, footerMenu } from '../../const/menu'
import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import { Color, Font, Media } from 'const/styles/variables'

export type LayoutProps = PropsWithChildren<{
  siteConfigData?: any // needs fix
  metrics?: any // needs fix
  mainMenuData?: any // needs fix
  footerMenuData?: any // needs fix
}>

const Wrapper = styled.div`
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
`

const Content = styled.main`
  margin: 0 auto;
  padding: 18rem 0 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 84rem;
  display: flex;
  flex-flow: column wrap;
  min-height: 80rem;

  h1 {
    font-size: 8rem;
    line-height: 1.2;
    margin: 0 0 6rem;
  }

  h2 {
    font-size: 3rem;
    line-height: 1.2;
    margin: 0 0 2.4rem;
  }

  p {
    margin: 0 0 1.6rem;
    font-size: ${Font.sizeDefault};
    color: ${Color.grey};
  }

  section {
    margin: 0 0 6rem;
  }

  ${Media.mobile} {
    margin: 10rem 0 0;
  }
`

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Wrapper>
        <Header menu={mainMenu} siteConfig={siteConfig} />
        <Content>{children ? children : 'No content found'}</Content>
        <Footer menu={footerMenu} siteConfig={siteConfig} />
      </Wrapper>
    </>
  )
}