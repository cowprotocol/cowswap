import { useAtom } from 'jotai'
import { useCallback } from 'react'

import { ClosableBanner } from '@cowprotocol/ui'

import { cowAnalytics } from 'modules/analytics'

import { CoWAmmBannerContent } from './CoWAmmBannerContent'
import { cowAmmBannerStateAtom } from './cowAmmBannerState'
import { dummyData, lpTokenConfig } from './dummyData'

const ANALYTICS_URL = 'https://cow.fi/pools?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner'

export const DEMO_DROPDOWN_OPTIONS = [
  { value: 'noLp', label: 'No LP tokens' },
  { value: 'uniV2', label: 'UNI-V2 LP' },
  { value: 'sushi', label: 'SushiSwap LP' },
  { value: 'curve', label: 'Curve LP' },
  { value: 'pancake', label: 'PancakeSwap LP' },
  { value: 'twoLps', label: '2 LP tokens' },
  { value: 'threeLps', label: '3 LP tokens' },
  { value: 'fourLps', label: '4 LP tokens' },
]

type BannerLocation = 'global' | 'tokenSelector'

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

  const handleBannerClose = (close: () => void) => () => {
    handleClose()
    close()
  }

  const bannerId = `cow_amm_banner_2024_va_${location}`

  return ClosableBanner(bannerId, (close) => (
    <CoWAmmBannerContent
      location={location}
      selectedState={selectedState}
      setSelectedState={setSelectedState}
      dummyData={dummyData}
      lpTokenConfig={lpTokenConfig}
      handleCTAClick={handleCTAClick}
      handleBannerClose={handleBannerClose(close)}
    />
  ))
}
