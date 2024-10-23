import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { ClosableBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet } from '@cowprotocol/wallet'

import { cowAnalytics } from 'modules/analytics'

import { CoWAmmBannerContent } from './CoWAmmBannerContent'
import { cowAmmBannerStateAtom } from './cowAmmBannerState'
import { dummyData, lpTokenConfig } from './dummyData'

const IS_DEMO_MODE = true
const ANALYTICS_URL = 'https://cow.fi/pools?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner'

export const DEMO_DROPDOWN_OPTIONS = [
  { value: 'noLp', label: '🚫 No LP Tokens' },
  { value: 'uniV2Superior', label: '⬆️ 🐴 UNI-V2 LP (Superior Yield)' },
  { value: 'uniV2Inferior', label: '⬇️ 🐴 UNI-V2 LP (Inferior Yield)' },
  { value: 'uniV2InferiorWithLowAverageYield', label: '⬇️ 🐴 UNI-V2 LP (Inferior Yield, Lower Average)' },
  { value: 'sushi', label: '⬇️ 🍣 SushiSwap LP (Inferior Yield)' },
  { value: 'curve', label: '⬇️ 🌈 Curve LP (Inferior Yield)' },
  { value: 'pancake', label: '⬇️ 🥞 PancakeSwap LP (Inferior Yield)' },
  { value: 'twoLpsMixed', label: '⬆️ 🐴 UNI-V2 (Superior) & ⬇️ 🍣 SushiSwap (Inferior) LPs' },
  { value: 'twoLpsBothSuperior', label: '⬆️ 🐴 UNI-V2 & ⬆️ 🍣 SushiSwap LPs (Both Superior, but UNI-V2 is higher)' },
  { value: 'threeLps', label: '⬇️ 🐴 UNI-V2, 🍣 SushiSwap & 🌈 Curve LPs (Inferior Yield)' },
  { value: 'fourLps', label: '⬇️ 🐴 UNI-V2, 🍣 SushiSwap, 🌈 Curve & 🥞 PancakeSwap LPs (Inferior Yield)' },
]

export enum BannerLocation {
  Global = 'global',
  TokenSelector = 'tokenSelector',
}

interface BannerProps {
  location: BannerLocation
}

export function CoWAmmBanner({ location }: BannerProps) {
  const [selectedState, setSelectedState] = useAtom(cowAmmBannerStateAtom)

  const handleCTAClick = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${location}] CTA Clicked`,
    })

    window.open(ANALYTICS_URL, '_blank')
  }, [location])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: `CoW AMM Banner [${location}] Closed`,
    })
  }, [location])

  const handleBannerClose = useCallback(() => {
    handleClose()
  }, [handleClose])

  const bannerId = `cow_amm_banner_2024_va_${location}`

  const isSmartContractWallet = useIsSmartContractWallet()

  return ClosableBanner(bannerId, (close) => (
    <CoWAmmBannerContent
      id={bannerId}
      title="CoW AMM"
      ctaText={isSmartContractWallet ? 'Booooost APR!' : 'Booooost APR gas-free!'}
      location={location}
      isDemo={IS_DEMO_MODE}
      selectedState={selectedState}
      setSelectedState={setSelectedState}
      dummyData={dummyData}
      lpTokenConfig={lpTokenConfig}
      onCtaClick={handleCTAClick}
      onClose={() => {
        handleBannerClose()
        close()
      }}
    />
  ))
}
