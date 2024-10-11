import { useAtom } from 'jotai'
import { cowAmmBannerStateAtom } from './cowAmmBannerState'

import { useCallback, useMemo } from 'react'

import ICON_ARROW from '@cowprotocol/assets/cow-swap/arrow.svg'
import ICON_CURVE from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import ICON_PANCAKESWAP from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import ICON_SUSHISWAP from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import ICON_UNISWAP from '@cowprotocol/assets/cow-swap/icon-uni.svg'
import ICON_STAR from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { ClosableBanner } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { cowAnalytics } from 'modules/analytics'

import { LpToken, dummyData, lpTokenConfig, StateKey } from './dummyData'
import * as styledEl from './styled'

const ANALYTICS_URL = 'https://cow.fi/pools?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner'
const BANNER_ID = 'cow_amm_banner_2024_va'

const DEMO_DROPDOWN_OPTIONS = [
  { value: 'noLp', label: 'No LP tokens' },
  { value: 'uniV2', label: 'UNI-V2 LP' },
  { value: 'sushi', label: 'SushiSwap LP' },
  { value: 'curve', label: 'Curve LP' },
  { value: 'pancake', label: 'PancakeSwap LP' },
  { value: 'twoLps', label: '2 LP tokens' },
  { value: 'threeLps', label: '3 LP tokens' },
  { value: 'fourLps', label: '4 LP tokens' },
]

const lpTokenIcons: Record<LpToken, string> = {
  [LpToken.UniswapV2]: ICON_UNISWAP,
  [LpToken.Sushiswap]: ICON_SUSHISWAP,
  [LpToken.PancakeSwap]: ICON_PANCAKESWAP,
  [LpToken.Curve]: ICON_CURVE,
}

export function CoWAmmBanner() {
  const [selectedState, setSelectedState] = useAtom(cowAmmBannerStateAtom)
  const isMobile = useMediaQuery(upToSmall)

  const handleCTAClick = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner [Global] CTA Clicked',
    })

    window.open(ANALYTICS_URL, '_blank')
  }, [])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner [Global] Closed',
    })
  }, [])

  const aprMessage = useMemo(() => {
    const { apr } = dummyData[selectedState]
    return `+${apr.toFixed(1)}%`
  }, [selectedState])

  const comparisonMessage = useMemo(() => {
    const { comparison } = dummyData[selectedState]
    if (selectedState === 'noLp') {
      return `yield over the average UNI-V2 pool`
    }
    if (selectedState === 'twoLps' || selectedState === 'threeLps') {
      return `Get higher average APR than ${comparison}`
    }
    return `Get higher APR than ${comparison}`
  }, [selectedState, dummyData])

  const lpEmblems = useMemo(() => {
    const tokens = lpTokenConfig[selectedState]
    const totalItems = tokens.length

    if (totalItems === 0) {
      return null
    }

    return (
      <styledEl.LpEmblems>
        <styledEl.LpEmblemItemsWrapper totalItems={totalItems}>
          {tokens.map((token, index) => (
            <styledEl.LpEmblemItem key={token} totalItems={totalItems} index={index}>
              <SVG src={lpTokenIcons[token]} />
            </styledEl.LpEmblemItem>
          ))}
        </styledEl.LpEmblemItemsWrapper>
        <styledEl.EmblemArrow>
          <SVG src={ICON_ARROW} />
        </styledEl.EmblemArrow>
        <styledEl.CoWAMMEmblemItem>
          <ProductLogo
            height={'100%'}
            overrideColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`}
            variant={ProductVariant.CowAmm}
            logoIconOnly
          />
        </styledEl.CoWAMMEmblemItem>
      </styledEl.LpEmblems>
    )
  }, [selectedState])

  const handleBannerClose = (close: () => void) => () => {
    handleClose()
    close()
  }

  return ClosableBanner(BANNER_ID, (close) => (
    <styledEl.BannerWrapper>
      <styledEl.CloseButton size={24} onClick={handleBannerClose(close)} />

      <styledEl.DEMO_DROPDOWN value={selectedState} onChange={(e) => setSelectedState(e.target.value as StateKey)}>
        {DEMO_DROPDOWN_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </styledEl.DEMO_DROPDOWN>

      <styledEl.Title>
        <ProductLogo
          height={20}
          overrideColor={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}
          variant={ProductVariant.CowAmm}
          logoIconOnly
        />
        <span>CoW AMM</span>
      </styledEl.Title>
      <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_BLUE})`}>
        <styledEl.StarIcon size={36} top={-17} right={80}>
          <SVG src={ICON_STAR} />
        </styledEl.StarIcon>
        <h3>
          <Textfit mode="single" forceSingleModeWidth={false} min={80} max={80} key={aprMessage}>
            {aprMessage}
          </Textfit>
        </h3>
        <p>
          <Textfit mode="multi" forceSingleModeWidth={false} min={10} max={28} key={comparisonMessage}>
            {comparisonMessage}
          </Textfit>
        </p>
        <styledEl.StarIcon size={26} bottom={-10} right={20}>
          <SVG src={ICON_STAR} />
        </styledEl.StarIcon>
      </styledEl.Card>

      {!isMobile && (
        <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_GREEN})`} color={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}>
          <p>
            <Textfit mode="multi" forceSingleModeWidth={false} min={10} max={30}>
              One-click convert, <b>boost yield</b>
            </Textfit>
          </p>
          {lpEmblems}
        </styledEl.Card>
      )}

      <styledEl.CTAButton onClick={handleCTAClick}>Booooost APR gas-free!</styledEl.CTAButton>
      <styledEl.SecondaryLink href={'https://cow.fi/'}>Pool analytics ↗</styledEl.SecondaryLink>
    </styledEl.BannerWrapper>
  ))
}
