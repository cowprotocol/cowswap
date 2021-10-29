import { ButtonPrimary } from 'components/Button/ButtonMod'
import Page, { Content } from 'components/Page'
import styled from 'styled-components/macro'

import nijaCowImg from './nija-cow.png'

const GAME_URL = 'https://mevslicer.netlify.app/'

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

function openGame() {
  window?.open(GAME_URL, '_blank')?.focus()
}

export default function MevSlicer() {
  return (
    <Wrapper>
      <p>This Cow doesn&apos;t run any more! Not from MEV!</p>
      <p>
        Now is time to take some action! -{' '}
        <strong>
          Let&apos;s slice some{' '}
          <span role="img" aria-label="sandwich-icon">
            🥪
          </span>
          !
        </strong>
      </p>
      <p>
        <img src={nijaCowImg} alt="Nija Cow" />
      </p>
      <p>
        <ButtonPrimary padding="8px" $borderRadius="8px" onClick={openGame}>
          MEV Slicer
        </ButtonPrimary>
      </p>

      <Content></Content>
    </Wrapper>
  )
}
