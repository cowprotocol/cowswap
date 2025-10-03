import { ReactNode } from 'react'

import cowDarkIMG from '@cowprotocol/assets/images/404/swap/dark/cow.svg'
import cowLightIMG from '@cowprotocol/assets/images/404/swap/light/cow.svg'
import {
  CowSaucerScene as BaseCowSaucerScene,
  SWAP_SAUCER_PALETTE_DARK,
  SWAP_SAUCER_PALETTE_LIGHT,
} from '@cowprotocol/ui'

interface CowSaucerSceneProps {
  darkMode: boolean
}

export function CowSaucerScene({ darkMode }: CowSaucerSceneProps): ReactNode {
  return (
    <BaseCowSaucerScene
      darkMode={darkMode}
      palettes={{ light: SWAP_SAUCER_PALETTE_LIGHT, dark: SWAP_SAUCER_PALETTE_DARK }}
      cowSprites={{ light: cowLightIMG, dark: cowDarkIMG }}
    />
  )
}
