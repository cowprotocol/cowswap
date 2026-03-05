import { ReactNode, useEffect } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { CowGame } from '@cowprotocol/cow-runner-game'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { PageTitle, Page, Content } from 'modules/application'

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

export default function CowRunnerPage(): ReactNode {
  const { i18n } = useLingui()
  const cowAnalytics = useCowAnalytics()

  useEffect(() => {
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.GAMES,
      action: 'Playing CoW Runner game',
    })
  }, [cowAnalytics])

  return (
    <Wrapper>
      <PageTitle title={i18n._(PAGE_TITLES.COW_RUNNER)} />
      <p>
        <Trans>Run! ...and try not getting sandwiched</Trans>{' '}
        <span role="img" aria-label={t`Sandwich icon`}>
          🥪
        </span>
        - <Trans>MEV is lethal these days!</Trans>
      </p>
      <Content>
        <CowGame />
      </Content>
    </Wrapper>
  )
}
