import { Trans } from '@lingui/macro'
import React, { ErrorInfo } from 'react'
import store, { AppState } from 'state/index'
import { ExternalLink, TYPE } from 'theme/index'
import Page, { Title } from 'components/Page'
import { AutoColumn } from 'components/Column'
import styled from 'styled-components/macro'
import ReactGA from 'react-ga'
import { getUserAgent } from 'utils/getUserAgent'
import { AutoRow } from 'components/Row'
import { MEDIA_WIDTHS } from '@src/theme'
import CowError from 'assets/cow-swap/CowError.png'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  min-height: 100vh;
  overflow-x: hidden;
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
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    position: relative;
  }
`

export const LogoImage = styled.img.attrs((props) => ({
  src: props.theme.logo.src,
  alt: props.theme.logo.alt,
  width: props.theme.logo.width,
  height: props.theme.logo.height,
}))`
  object-fit: contain;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 150px;
  `};
`

const CowLogo = styled.div`
  display: flex;
  margin: 1rem;
  transition: transform 0.3s ease;

  &:hover {
    transform: rotate(-5deg);
  }
`
const CodeBlockWrapper = styled.div`
  background: ${({ theme }) => theme.bg4};
  overflow: auto;
  white-space: pre;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 16px;
  padding: 16px;
  color: ${({ theme }) => theme.text2};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 12px;
    width: auto;
  `};
`

const StyledParagraph = styled.p`
  overflow-x: auto;
`

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  padding: 6px 24px;
`

type ErrorBoundaryState = {
  error: Error | null
}

function truncate(value?: string): string | undefined {
  return value ? value.slice(0, 1000) : undefined
}

export default class ErrorBoundary extends React.Component<unknown, ErrorBoundaryState> {
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
    const { error } = this.state
    if (error !== null) {
      const encodedBody = encodeURIComponent(issueBody(error))
      return (
        <AppWrapper>
          <HeaderWrapper>
            <a href=".">
              <CowLogo>
                <LogoImage />
              </CowLogo>
            </a>
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
                  <TYPE.main fontSize={10} color={'text1'}>
                    <StyledParagraph>{error.stack}</StyledParagraph>
                  </TYPE.main>
                </code>
              </CodeBlockWrapper>
              <AutoRow>
                <LinkWrapper>
                  <ExternalLink
                    id="create-github-issue-link"
                    href={`https://github.com/gnosis/cowswap/issues/new?assignees=&labels=🐞 Bug,🔥 Critical&body=${encodedBody}&title=${encodeURIComponent(
                      `Crash report: \`${error.name}${error.message && `: ${truncate(error.message)}`}\``
                    )}`}
                    target="_blank"
                  >
                    <TYPE.link fontSize={16}>
                      <Trans>Create an issue on GitHub</Trans>
                      <span>↗</span>
                    </TYPE.link>
                  </ExternalLink>
                </LinkWrapper>
                <LinkWrapper>
                  <ExternalLink id="get-support-on-discord" href="https://chat.cowswap.exchange/" target="_blank">
                    <TYPE.link fontSize={16}>
                      <Trans>Get support on Discord</Trans>
                      <span>↗</span>
                    </TYPE.link>
                  </ExternalLink>
                </LinkWrapper>
              </AutoRow>
            </AutoColumn>
          </Wrapper>
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
  const pieces = path.substring(2).split(/[\/\\?]/)
  switch (pieces[0]) {
    case 'swap':
      return 'swap'
    case 'add':
      if (pieces[1] === 'v2') return 'mint'
      else return 'mintV3'
    case 'remove':
      if (pieces[1] === 'v2') return 'burn'
      else return 'burnV3'
  }
  return null
}

function issueBody(error: Error): string {
  const relevantState = getRelevantState()
  const deviceData = getUserAgent()
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
