import { Trans } from '@lingui/macro'
import React, { ErrorInfo, Component } from 'react'
import ReactGA from 'react-ga'
import styled from 'styled-components/macro'

import store, { AppState } from 'state/index'
import { ExternalLink, ThemedText } from 'theme/index'
import { userAgent } from '@src/utils/userAgent'
import { AutoColumn } from 'components/Column'
import { AutoRow } from 'components/Row'

// MOD imports
import Page, { Title } from 'components/Page'
import { MEDIA_WIDTHS } from '@src/theme'
import CowError from 'assets/cow-swap/CowError.png'
import { UniIcon, LogoImage } from '../Header'
import { HeaderRow } from 'components/Header/HeaderMod'
import Footer from 'components/Footer'

/* const FallbackWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  z-index: 1;
`

const BodyWrapper = styled.div<{ margin?: string }>`
  padding: 1rem;
  width: 100%;
  white-space: ;
` */

const CodeBlockWrapper = styled.div`
  background: ${({ theme }) => theme.bg4};
  overflow: auto;
  white-space: pre;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 16px;
  padding: 16px;
  color: ${({ theme }) => theme.text2};

  /* MOD */
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 12px;
    width: auto;
  `};
`

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  padding: 6px 24px;
`

/* const SomethingWentWrongWrapper = styled.div`
  padding: 6px 24px;
` */

type ErrorBoundaryState = {
  error: Error | null
}

// const IS_UNISWAP = window.location.hostname === 'app.uniswap.org'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  min-height: 100vh;
  overflow-x: hidden;
  &:after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    filter: blur(20px);
    backdrop-filter: blur(20px);
    background-image: ${({ theme }) => theme.body.background};
    transition: 0.5s;
    z-index: -1;
  }
`

const Wrapper = styled(Page)`
  display: flex;
  flex-direction: column;
  width: 100vw;
  max-width: 60vw;
  margin: 120px 0;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    max-width: 95vw;
    margin: 0 0 80px;
  }
`

const StyledTitle = styled(Title)`
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    text-align: center;
  }
`

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0 0.5rem 0;

  @media screen and (max-width: ${MEDIA_WIDTHS.upToMedium}px) {
    flex-direction: column;
    align-items: center;
  }
`
const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
  position: fixed;
  top: 0;
  z-index: 2;
  padding: 16px;
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`
const FooterWrapper = styled(HeaderWrapper)`
  z-index: 1;
  flex-grow: 1;
  width: 100%;
  position: relative;
  top: auto;
`

const StyledParagraph = styled.p`
  overflow-x: auto;
`

function truncate(value?: string): string | undefined {
  return value ? value.slice(0, 1000) : undefined
}

export default class ErrorBoundary extends Component<unknown, ErrorBoundaryState> {
  constructor(props: unknown) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    ReactGA.exception({
      ...error,
      ...errorInfo,
      fatal: true,
    })
  }

  render() {
    document.body.classList.remove('noScroll') // mod
    const { error } = this.state

    if (error !== null) {
      const encodedBody = encodeURIComponent(issueBody(error))
      return (
        // TODO: the strcture changed in the original file. We might want to re-use some stuff
        <AppWrapper>
          <HeaderWrapper>
            <HeaderRow marginRight="0">
              <a href=".">
                <UniIcon>
                  <LogoImage />
                </UniIcon>
              </a>
            </HeaderRow>
          </HeaderWrapper>
          <Wrapper>
            <FlexContainer>
              <StyledTitle>
                <Trans> Something went wrong</Trans>
              </StyledTitle>
              <img src={CowError} alt="CowSwap Error" height="125" />
            </FlexContainer>
            <AutoColumn gap={'md'}>
              <CodeBlockWrapper>
                <code>
                  <ThemedText.Main fontSize={10} color={'text1'}>
                    <StyledParagraph>{error.stack}</StyledParagraph>
                  </ThemedText.Main>
                </code>
              </CodeBlockWrapper>
              <AutoRow>
                <LinkWrapper>
                  <ExternalLink
                    id="create-github-issue-link"
                    href={`https://github.com/gnosis/cowswap/issues/new?assignees=&labels=🐞 Bug,🔥 Critical&body=${encodedBody}&title=${encodeURIComponent(
                      `Crash report: \`${error.name}${error.message && `: ${truncate(error.message)}`}\``
                    )}`}
                  >
                    <ThemedText.Link fontSize={16}>
                      <Trans>Create an issue on GitHub</Trans>
                      <span>↗</span>
                    </ThemedText.Link>
                  </ExternalLink>
                </LinkWrapper>
                <LinkWrapper>
                  <ExternalLink id="get-support-on-discord" href="https://chat.cowswap.exchange/">
                    <ThemedText.Link fontSize={16}>
                      <Trans>Get support on Discord</Trans>
                      <span>↗</span>
                    </ThemedText.Link>
                  </ExternalLink>
                </LinkWrapper>
              </AutoRow>
            </AutoColumn>
          </Wrapper>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </AppWrapper>
      )
    }
    return this.props.children
  }
}

function getRelevantState(): null | keyof AppState {
  const path = window.location.hash
  if (!path.startsWith('#/')) {
    return null
  }
  const pieces = path.substring(2).split(/[/\\?]/)
  switch (pieces[0]) {
    case 'swap':
      return 'swap'
    /* case 'add':
      if (pieces[1] === 'v2') return 'mint'
      else return 'mintV3'
    case 'remove':
      if (pieces[1] === 'v2') return 'burn'
      else return 'burnV3' */
  }
  return null
}

function issueBody(error: Error): string {
  const relevantState = getRelevantState()
  const deviceData = userAgent
  return `## URL
  
${window.location.href}

${
  relevantState
    ? `## \`${relevantState}\` state
    
\`\`\`json
${JSON.stringify(store.getState()[relevantState], null, 2)}
\`\`\`
`
    : ''
}
${
  error.name &&
  `## Error

\`\`\`
${error.name}${error.message && `: ${truncate(error.message)}`}
\`\`\`
`
}
${
  error.stack &&
  `## Stacktrace

\`\`\`
${truncate(error.stack)}
\`\`\`
`
}
${
  deviceData &&
  `## Device data

\`\`\`json
${JSON.stringify(deviceData, null, 2)}
\`\`\`
`
}
`
}
