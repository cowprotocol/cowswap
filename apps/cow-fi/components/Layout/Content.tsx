import styled from 'styled-components'
import { PropsWithChildren } from 'react'

import Header from 'components/Layout/Header'
import Footer from 'components/Layout/Footer'
import { Content } from '@/components/Layout/index.styles'

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

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Wrapper>
        <Header />
        <Content>{children ? children : 'No content found'}</Content>
        <Footer />
      </Wrapper>
    </>
  )
}
