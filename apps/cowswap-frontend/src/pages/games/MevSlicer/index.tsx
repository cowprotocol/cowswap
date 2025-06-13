import ninjaCowImg from '@cowprotocol/assets/cow-swap/ninja-cow.png'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { ButtonPrimary } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Page, Content } from 'modules/application/pure/Page'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

const GAME_URL = 'https://mevslicer.netlify.app/'

const Wrapper = styled(Page)`
  min-height: initial;
  padding: 48px 24px 0;

  // Override. Should be addressed in the CowGame package instead.
  .icon-offline {
    display: none;
  }

  h1,
  p {
    text-align: center;
    margin: 0;
  }

  p > img {
    width: 100%;
    max-width: 200px;
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
function openGame() {
  window?.open(GAME_URL, '_blank')?.focus()
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function MevSlicer() {
  return (
    <Wrapper>
      <PageTitle title={PAGE_TITLES.MEV_SLICER} />
      <p>This CoW doesn&apos;t run away any more! Not from MEV!</p>
      <p>
        Now is the time to take some action! -{' '}
        <strong>
          Let&apos;s slice some{' '}
          <span role="img" aria-label="sandwich-icon">
            🥪
          </span>
          !
        </strong>
      </p>
      <p>
        <img src={ninjaCowImg} alt="Ninja Cow" />
      </p>

      <ButtonPrimary
        padding="8px"
        $borderRadius="8px"
        onClick={openGame}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.GAMES,
          action: 'Playing MEV Slicer game',
        })}
      >
        Play MEV Slicer
      </ButtonPrimary>

      <Content></Content>
    </Wrapper>
  )
}
