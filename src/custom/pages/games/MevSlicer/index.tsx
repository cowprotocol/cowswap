import { ButtonPrimary } from 'components/Button/ButtonMod'
import Page, { Content } from 'components/Page'
import styled from 'styled-components/macro'

import ninjaCowImg from 'assets/cow-swap/ninja-cow.png'

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

function openGame() {
  window?.open(GAME_URL, '_blank')?.focus()
}

export default function MevSlicer() {
  return (
    <Wrapper>
      <p>This Cow doesn&apos;t run away any more! Not from MEV!</p>
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
      <p>
        <ButtonPrimary padding="8px" $borderRadius="8px" onClick={openGame}>
          Play MEV Slicer
        </ButtonPrimary>
      </p>

      <Content></Content>
    </Wrapper>
  )
}
