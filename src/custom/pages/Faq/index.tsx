import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'

import Page, { Content } from 'components/Page'
import { Wrapper } from './styled'

export interface TocSection {
  section: TocItem
  items: TocItem[]
}

export interface TocItem {
  label: string
  id: string
}

// TODO: Style
const Sections = styled.ul``

export function BackButton() {
  return <Link to="/faq">Go back</Link>
}

export default function Faq() {
  return (
    <Wrapper>
      <Page>
        <Content>
          <Sections>
            <li>
              <Link to="/faq/general">General</Link>
            </li>
            <li>
              <Link to="/faq/protocol">Protocol</Link>
            </li>
            <li>
              <Link to="/faq/token">Token</Link>
            </li>
            <li>
              <Link to="/faq/trading">Trading</Link>
            </li>
            <li>
              <Link to="/faq/affiliate">Affiliate Program</Link>
            </li>
          </Sections>
        </Content>
      </Page>
    </Wrapper>
  )
}
