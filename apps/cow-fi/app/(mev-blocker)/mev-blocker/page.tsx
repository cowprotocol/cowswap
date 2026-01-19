'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { Color, Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { REDIRECT_SECONDS } from './constants'

const REDIRECT_URL = 'https://mevblocker.io'

const Page = styled.main`
  display: flex;
  min-height: 70vh;
  align-items: flex-start;
  justify-content: center;
  padding: 9.6rem 2.4rem;
`

const Card = styled.section`
  width: 100%;
  max-width: 48rem;
  background: var(${UI.COLOR_NEUTRAL_100});
  border: 0.1rem solid var(${UI.COLOR_NEUTRAL_90});
  border-radius: 3.2rem;
  padding: 3.6rem;
  box-shadow: 0 2.4rem 6rem rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 2rem;

  ${Media.upToMedium()} {
    padding: 3.2rem 2.4rem;
    border-radius: 2.4rem;
  }
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: 1.2rem;
  font-weight: ${Font.weight.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.6rem 1.2rem;
  border-radius: 99.9rem;
  background: ${Color.cowfi_orange_pale};
  color: ${Color.cowfi_orange_bright};
`

const Title = styled.h1`
  font-size: 4rem;
  line-height: 1.15;
  font-weight: ${Font.weight.bold};
  color: var(${UI.COLOR_NEUTRAL_0});

  ${Media.upToMedium()} {
    font-size: 3rem;
  }
`

const Subtitle = styled.p`
  font-size: 1.8rem;
  line-height: 1.6;
  color: var(${UI.COLOR_NEUTRAL_30});
`

const Countdown = styled.p`
  font-size: 1.6rem;
  line-height: 1.6;
  color: var(${UI.COLOR_NEUTRAL_10});

  > span {
    color: var(${UI.COLOR_BLUE_900_PRIMARY});
  }
`

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.6rem;
  align-items: center;

  ${Media.upToMedium()} {
    flex-direction: column;
    align-items: stretch;
  }
`

const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2.1rem 2.4rem;
  border-radius: 999px;
  background: ${Color.cowfi_orange_bright};
  color: ${Color.cowfi_orange_pale};
  font-size: 2.1rem;
  line-height: 1.2;
  text-align: center;
  font-weight: ${Font.weight.bold};
  text-decoration: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`

const FallbackText = styled.p`
  font-size: 1.4rem;
  line-height: 1.6;
  color: var(${UI.COLOR_NEUTRAL_40});
  margin: 0;
  display: flex;
  width: 100%;
`

const InlineLink = styled.a`
  color: var(${UI.COLOR_NEUTRAL_10});
  font-weight: ${Font.weight.bold};
`

export default function MevBlockerRedirectPage(): ReactNode {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const targetTime = Date.now() + REDIRECT_SECONDS * 1000
    const intervalId = window.setInterval(() => {
      const remainingSeconds = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000))
      setSecondsLeft(remainingSeconds)
    }, 250)

    const timeoutId = window.setTimeout(() => {
      window.location.assign(REDIRECT_URL)
    }, REDIRECT_SECONDS * 1000)

    return () => {
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [])

  const countdownLabel = useMemo(() => {
    if (secondsLeft === 1) {
      return '1 second'
    }

    return `${secondsLeft} seconds`
  }, [secondsLeft])

  return (
    <Page>
      <Card>
        <Badge>MEV Blocker update</Badge>
        <Title>MEV Blocker has been acquired.</Title>
        <Subtitle>We are redirecting you to the new home.</Subtitle>
        <Countdown aria-live="polite">
          Redirecting you in <span>{countdownLabel}</span>.
        </Countdown>
        <ActionRow>
          <PrimaryLink href={REDIRECT_URL}>Go to mevblocker.io now</PrimaryLink>
          <FallbackText>
            If you are not redirected&nbsp;<InlineLink href={REDIRECT_URL}>click here</InlineLink>.
          </FallbackText>
        </ActionRow>
      </Card>
    </Page>
  )
}
