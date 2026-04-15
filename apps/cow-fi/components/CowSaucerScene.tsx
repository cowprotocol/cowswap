'use client'

import { ReactNode } from 'react'

import BG_IMAGE_MED from '@cowprotocol/assets/images/404/cowfi/bg-med.svg'
import BG_IMAGE_SMALL from '@cowprotocol/assets/images/404/cowfi/bg-small.svg'
import BG_IMAGE from '@cowprotocol/assets/images/404/cowfi/bg.svg'
import COW_IMAGE from '@cowprotocol/assets/images/404/cowfi/cow.svg'
import { CowSaucerScene as BaseCowSaucerScene, COWFI_SAUCER_PALETTE_LIGHT, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const FOOTER_OVERLAP = '0rem'

const SceneSection = styled.section`
  position: relative;
  width: 100%;
  margin: 0 0 calc(${FOOTER_OVERLAP} * -1);
  padding-bottom: ${FOOTER_OVERLAP};
  background: url(${BG_IMAGE}) left bottom / 100% auto no-repeat;
  overflow: hidden;

  ${Media.upToMedium()} {
    margin-top: -10rem;
    background-image: url(${BG_IMAGE_MED});
  }

  ${Media.upToSmall()} {
    background-image: url(${BG_IMAGE_SMALL});
  }
`

const SceneAnimation = styled(BaseCowSaucerScene)`
  margin: 0 auto;
`

export function CowSaucerScene(): ReactNode {
  return (
    <SceneSection aria-hidden>
      <SceneAnimation palettes={{ light: COWFI_SAUCER_PALETTE_LIGHT }} cowSprites={{ light: COW_IMAGE }} />
    </SceneSection>
  )
}
