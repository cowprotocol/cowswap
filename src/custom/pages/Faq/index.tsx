import styled from 'styled-components/macro'
import { Link } from 'react-router-dom'

import { DISCORD_LINK } from 'constants/index'
import Page, { Content } from 'components/Page'
import { Wrapper, ExternalLinkFaq } from './styled'

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

export function Footer(props: { back?: boolean }) {
  const { back = true } = props
  return (
    <>
      <hr />

      <p>
        Didn&#39;t find an answer? Join the{' '}
        <ExternalLinkFaq href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
          community on Discord
        </ExternalLinkFaq>
      </p>
      <p>
        We really hope you like CowSwap. If you do,&nbsp;<Link to="/">Milk it!</Link>
        <span role="img" aria-label="glass of milk">
          🥛
        </span>
      </p>
      {back && (
        <p>
          <BackButton />
        </p>
      )}
    </>
  )
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
          <p>
            <Footer back={false} />
          </p>
        </Content>
      </Page>
    </Wrapper>
  )
}
