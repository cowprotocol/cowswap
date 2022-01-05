import styled from 'styled-components';
import { PropsWithChildren } from 'react'

import { siteConfig } from 'const/meta'
import { mainMenu, footerMenu } from '../../const/menu'
import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import { Media } from 'const/styles/variables'

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
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  flex-flow: column wrap;

  ${Media.mediumDown} {
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