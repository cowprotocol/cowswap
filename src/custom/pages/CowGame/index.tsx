import React from 'react'
import Page, { Title, Content } from 'components/Page'
import styled from 'styled-components'
import { CowGame } from '@gnosis.pm/cow-runner-game'

const Wrapper = styled(Page)`
  h1,
  p {
    text-align: center;
  }

  ${Content} {
    h1 {
      animation: blinker 0.6s cubic-bezier(1, 0, 0, 1) infinite alternate;
    }
  }

  @keyframes blinker {
    to {
      opacity: 0;
    }
  }
`

export default function CowGamePage() {
  return (
    <Wrapper>
      <Title>
        Run{' '}
        <span role="img" aria-label="cow-icon">
          🐮
        </span>{' '}
        Run!
      </Title>
      <p>
        ...and try not getting sandwiched{' '}
        <span role="img" aria-label="sandwich-icon">
          🥪
        </span>
        . MEV, it&apos;s lethal these days.
      </p>

      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
