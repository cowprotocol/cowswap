import { useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { CowGame } from '@cowprotocol/cow-runner-game'

import styled from 'styled-components/macro'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function CowRunnerPage() {
  const cowAnalytics = useCowAnalytics()

  useEffect(() => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.GAMES,
      action: 'Playing CoW Runner game',
    })
  }, [cowAnalytics])

  return (
    <Wrapper>
      <PageTitle title={PAGE_TITLES.COW_RUNNER} />
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
