import { ReactNode } from 'react'

import imgCowErrorSrc from '@cowprotocol/assets/cow-swap/CowError.png'
import { CODE_LINK, DISCORD_LINK } from '@cowprotocol/common-const'
import { userAgent } from '@cowprotocol/common-utils'
import { AutoRow, MEDIA_WIDTHS, ExternalLink, UI, Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import CopyHelper from 'legacy/components/Copy'

// eslint-disable-next-line import/no-internal-modules -- Direct import to avoid circular dependency (barrel re-exports App which imports ErrorBoundary)
import { Title } from 'modules/application/pure/Page'

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

const StyledTitle = styled(Title)`
  @media screen and (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    text-align: center;
  }
`

const StyledParagraph = styled.p`
  overflow-x: auto;
`

const CodeBlockWrapper = styled.div`
  background: var(${UI.COLOR_PAPER});
  overflow: auto;
  white-space: pre;
  box-shadow:
    0 0 1px rgba(0, 0, 0, 0.01),
    0 4px 8px rgba(0, 0, 0, 0.04),
    0 16px 24px rgba(0, 0, 0, 0.04),
    0 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 16px;
  padding: 16px;
  color: inherit;

  ${Media.upToSmall()} {
    padding: 12px;
    width: auto;
  }
`

const LinkWrapper = styled.div`
  color: ${({ theme }) => theme.blue1};
  padding: 6px 24px;
`

const IdText = styled(ThemedText.Main)`
  opacity: 0.7;
`

const IdRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

function truncate(value?: string): string | undefined {
  return value ? value.slice(0, 1000) : undefined
}

interface ErrorWithStackTraceProps {
  error: Error
  eventId: string
}

export const ErrorWithStackTrace = ({ error, eventId }: ErrorWithStackTraceProps): ReactNode => {
  const encodedBody = encodeURIComponent(issueBody(error, eventId))

  return (
    <>
      <FlexContainer>
        <StyledTitle>
          <Trans>Something went wrong</Trans>
        </StyledTitle>
        <img src={imgCowErrorSrc} alt={t`CowSwap Error`} height="125" />
      </FlexContainer>
      <AutoColumn gap={'md'}>
        {eventId && (
          <IdRow>
            <IdText fontSize={14}>Event ID:</IdText>
            <CopyHelper toCopy={eventId}>{eventId}</CopyHelper>
          </IdRow>
        )}
        <CodeBlockWrapper>
          <code>
            <ThemedText.Main fontSize={10}>
              <StyledParagraph>{error.stack}</StyledParagraph>
            </ThemedText.Main>
          </code>
        </CodeBlockWrapper>
        <AutoRow>
          <LinkWrapper>
            <ExternalLink
              id="create-github-issue-link"
              href={
                CODE_LINK +
                `/issues/new?assignees=&labels=🐞 Bug,🔥 Critical&body=${encodedBody}&title=${encodeURIComponent(
                  `Crash report${eventId ? ` [${eventId}]` : ''}: \`${error.name}${error.message && `: ${truncate(error.message)}`}\``,
                )}`
              }
            >
              <ThemedText.Link fontSize={16}>
                <Trans>Create an issue on GitHub</Trans>
                <span>↗</span>
              </ThemedText.Link>
            </ExternalLink>
          </LinkWrapper>
          <LinkWrapper>
            <ExternalLink id="get-support-on-discord" href={DISCORD_LINK}>
              <ThemedText.Link fontSize={16}>
                <Trans>Get support on Discord</Trans>
                <span>↗</span>
              </ThemedText.Link>
            </ExternalLink>
          </LinkWrapper>
        </AutoRow>
      </AutoColumn>
    </>
  )
}

function issueBody(error: Error, eventId: string): string {
  const deviceData = userAgent
  const sentryEventUrl = `https://cowprotocol.sentry.io/issues/?query=${encodeURIComponent(`id:${eventId}`)}`
  return `## URL

${window.location.href}

## Sentry Event ID

\`\`\`
${eventId}
\`\`\`

${sentryEventUrl}

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
