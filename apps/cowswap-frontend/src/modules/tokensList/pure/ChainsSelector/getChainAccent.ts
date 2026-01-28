import { ChainInfo, SupportedChainId } from '@cowprotocol/cow-sdk'
import { getChainAccentColors } from '@cowprotocol/ui'

import { transparentize } from 'color2k'

import { SOLANA_CHAIN_ID } from 'common/chains/nonEvm'

import type { ChainAccentVars } from './styled'

const LIGHT_BG_ALPHA = 0.22
const DARK_BG_ALPHA = 0.2
const LIGHT_BORDER_ALPHA = 0.45
const DARK_BORDER_ALPHA = 0.35

const SOLANA_PURPLE = '#9945ff'
const SOLANA_GREEN = '#14f195'

const chainAlpha = (color: string, alpha: number): string => transparentize(color, 1 - alpha)

const getSolanaGradient = (lightMode: boolean): string => {
  const purpleStart = lightMode ? 0.28 : 0.42
  const purpleMid = lightMode ? 0.2 : 0.32
  const greenEnd = lightMode ? 0.32 : 0.24
  const greenStop = lightMode ? 82 : 100

  return `linear-gradient(120deg, ${chainAlpha(SOLANA_PURPLE, purpleStart)} 0%, ${chainAlpha(
    SOLANA_PURPLE,
    purpleMid,
  )} 55%, ${chainAlpha(SOLANA_GREEN, greenEnd)} ${greenStop}%)`
}

export function getChainAccent(chain: ChainInfo): ChainAccentVars | undefined {
  const accentConfig = getChainAccentColors(chain.id as SupportedChainId)
  if (!accentConfig) {
    if (!chain.color) return undefined

    if (chain.id === SOLANA_CHAIN_ID) {
      return {
        backgroundColor: getSolanaGradient(true),
        backgroundColorDark: getSolanaGradient(false),
        backgroundIsGradient: true,
        borderColor: chainAlpha(SOLANA_PURPLE, LIGHT_BORDER_ALPHA),
        borderColorDark: chainAlpha(SOLANA_PURPLE, DARK_BORDER_ALPHA),
        accentColor: 'rgb(0 148 87)',
        accentColorDark: SOLANA_GREEN,
      }
    }

    return {
      backgroundColor: chainAlpha(chain.color, LIGHT_BG_ALPHA),
      backgroundColorDark: chainAlpha(chain.color, DARK_BG_ALPHA),
      borderColor: chainAlpha(chain.color, LIGHT_BORDER_ALPHA),
      borderColorDark: chainAlpha(chain.color, DARK_BORDER_ALPHA),
      accentColor: chain.color,
      accentColorDark: chain.color,
    }
  }

  return {
    backgroundVar: accentConfig.bgVar,
    borderVar: accentConfig.borderVar,
    accentColorVar: accentConfig.accentVar,
  }
}
