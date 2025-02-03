import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { CowGame } from '@cowprotocol/cow-runner-game'

import styled from 'styled-components/macro'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { CowSwapCategory } from 'common/analytics/types'

const Wrapper = styled(Page)`
  min-height: initial;

  // Override. Should be addressed in the CowGame package instead.
  .icon-offline {
    display: none;
  }

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

export default function CowRunnerPage() {
  const cowAnalytics = useCowAnalytics()

  useEffect(() => {
    cowAnalytics.sendEvent({
      category: CowSwapCategory.GAMES,
      action: 'Playing CoW Runner game',
    })
  }, [cowAnalytics])

  return (
    <Wrapper>
      <PageTitle title="CoW Runner" />
      <p>
        Run! ...and try not getting sandwiched{' '}
        <span role="img" aria-label="sandwich-icon">
          🥪
        </span>
        - MEV is lethal these days!
      </p>

      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
