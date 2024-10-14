import { useCallback, useMemo, useRef } from 'react'

import ICON_ARROW from '@cowprotocol/assets/cow-swap/arrow.svg'
import ICON_CURVE from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import ICON_PANCAKESWAP from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import ICON_SUSHISWAP from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import ICON_UNISWAP from '@cowprotocol/assets/cow-swap/icon-uni.svg'
import ICON_STAR from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'
import { useIsDarkMode } from 'legacy/state/user/hooks'

import { ArrowBackground } from './arrowBackground'
import { LpToken, StateKey } from './dummyData'
import * as styledEl from './styled'

import { BannerLocation, DEMO_DROPDOWN_OPTIONS } from './index'

const lpTokenIcons: Record<LpToken, string> = {
  [LpToken.UniswapV2]: ICON_UNISWAP,
  [LpToken.Sushiswap]: ICON_SUSHISWAP,
  [LpToken.PancakeSwap]: ICON_PANCAKESWAP,
  [LpToken.Curve]: ICON_CURVE,
}

interface CoWAmmBannerContentProps {
  id: string
  title: string
  ctaText: string
  location: BannerLocation
  isDemo: boolean
  selectedState: StateKey
  setSelectedState: (state: StateKey) => void
  dummyData: Record<StateKey, { apr: number; comparison: string }>
  lpTokenConfig: Record<StateKey, LpToken[]>
  onCtaClick: () => void
  onClose: () => void
}

export function CoWAmmBannerContent({
  id,
  title,
  ctaText,
  location,
  isDemo,
  selectedState,
  setSelectedState,
  dummyData,
  lpTokenConfig,
  onCtaClick,
  onClose,
}: CoWAmmBannerContentProps) {
  const isMobile = useMediaQuery(upToSmall)
  const isDarkMode = useIsDarkMode()
  const arrowBackgroundRef = useRef<HTMLDivElement>(null)

  const handleCTAMouseEnter = useCallback(() => {
    if (arrowBackgroundRef.current) {
      arrowBackgroundRef.current.style.visibility = 'visible'
      arrowBackgroundRef.current.style.opacity = '1'
    }
  }, [])

  const handleCTAMouseLeave = useCallback(() => {
    if (arrowBackgroundRef.current) {
      arrowBackgroundRef.current.style.visibility = 'hidden'
      arrowBackgroundRef.current.style.opacity = '0'
    }
  }, [])

  const { apr, comparison } = dummyData[selectedState]

  const aprMessage = useMemo(() => `+${apr.toFixed(1)}%`, [apr])

  const comparisonMessage = useMemo(() => {
    if (selectedState === 'noLp') {
      return `yield over the average UNI-V2 pool`
    }
    const prefix = ['twoLps', 'threeLps'].includes(selectedState)
      ? 'Get higher average APR than'
      : 'Get higher APR than'
    return `${prefix} ${comparison}`
  }, [selectedState, comparison])

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
  }, [selectedState, lpTokenConfig])

  const renderProductLogo = (color: string) => (
    <ProductLogo height={20} overrideColor={`var(${color})`} variant={ProductVariant.CowAmm} logoIconOnly />
  )

  const renderStarIcon = (props: any) => (
    <styledEl.StarIcon {...props}>
      <SVG src={ICON_STAR} />
    </styledEl.StarIcon>
  )

  const renderTextfit = (
    content: React.ReactNode,
    mode: 'single' | 'multi',
    minFontSize: number,
    maxFontSize: number,
  ) => (
    <Textfit mode={mode} forceSingleModeWidth={false} min={minFontSize} max={maxFontSize}>
      {content}
    </Textfit>
  )

  const renderTokenSelectorContent = () => (
    <styledEl.TokenSelectorWrapper>
      <styledEl.TokenSelectorWrapperInner
        bgColor={isDarkMode ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : undefined}
        color={isDarkMode ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : undefined}
      >
        <styledEl.CloseButton
          size={24}
          top={14}
          onClick={onClose}
          color={`var(${isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN : UI.COLOR_COWAMM_DARK_GREEN})`}
        />
        <styledEl.Title color={`var(${isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN : UI.COLOR_COWAMM_DARK_GREEN})`}>
          {renderProductLogo(isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN : UI.COLOR_COWAMM_DARK_GREEN)}
          <span>{title}</span>
        </styledEl.Title>
        <styledEl.Card
          bgColor={'transparent'}
          borderColor={`var(${isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN_OPACITY_30 : UI.COLOR_COWAMM_DARK_GREEN_OPACITY_30})`}
          borderWidth={2}
          padding={'14px'}
          gap={'14px'}
          height={'78px'}
        >
          {renderStarIcon({ size: 26, top: -16, right: 80, color: `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})` })}
          <h3>{renderTextfit(aprMessage, 'single', 45, 48)}</h3>
          <span>{renderTextfit(comparisonMessage, 'multi', 12, 21)}</span>
          {renderStarIcon({ size: 16, bottom: 3, right: 20, color: `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})` })}
        </styledEl.Card>
        <styledEl.CTAButton
          onClick={onCtaClick}
          onMouseEnter={handleCTAMouseEnter}
          onMouseLeave={handleCTAMouseLeave}
          size={38}
          fontSize={18}
          bgColor={isDarkMode ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : `var(${UI.COLOR_COWAMM_DARK_GREEN})`}
          bgHoverColor={isDarkMode ? `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})` : `var(${UI.COLOR_COWAMM_GREEN})`}
          color={isDarkMode ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : `var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}
        >
          {ctaText}
        </styledEl.CTAButton>
      </styledEl.TokenSelectorWrapperInner>
    </styledEl.TokenSelectorWrapper>
  )

  const renderGlobalContent = () => (
    <styledEl.BannerWrapper>
      <styledEl.CloseButton size={24} onClick={onClose} />
      <styledEl.Title>
        {renderProductLogo(UI.COLOR_COWAMM_LIGHT_GREEN)}
        <span>{title}</span>
      </styledEl.Title>
      <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_BLUE})`}>
        {renderStarIcon({ size: 36, top: -17, right: 80 })}
        <h3>{renderTextfit(aprMessage, 'single', 80, 80)}</h3>
        <span>{renderTextfit(comparisonMessage, 'multi', 10, 28)}</span>
        {renderStarIcon({ size: 26, bottom: -10, right: 20 })}
      </styledEl.Card>

      {!isMobile && (
        <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_GREEN})`} color={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}>
          <span>
            {renderTextfit(
              <>
                One-click convert, <strong>boost yield</strong>
              </>,
              'multi',
              10,
              30,
            )}
          </span>
          {lpEmblems}
        </styledEl.Card>
      )}

      <styledEl.CTAButton onClick={onCtaClick} onMouseEnter={handleCTAMouseEnter} onMouseLeave={handleCTAMouseLeave}>
        {ctaText}
      </styledEl.CTAButton>

      <styledEl.SecondaryLink href={'https://cow.fi/'}>Pool analytics ↗</styledEl.SecondaryLink>

      <ArrowBackground ref={arrowBackgroundRef} />
    </styledEl.BannerWrapper>
  )

  const renderDemoDropdown = () => (
    <styledEl.DEMO_DROPDOWN value={selectedState} onChange={(e) => setSelectedState(e.target.value as StateKey)}>
      {DEMO_DROPDOWN_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </styledEl.DEMO_DROPDOWN>
  )

  const content = (() => {
    switch (location) {
      case BannerLocation.TokenSelector:
        return renderTokenSelectorContent()
      case BannerLocation.Global:
        return renderGlobalContent()
      default:
        return null
    }
  })()

  if (!content) {
    return null
  }

  return (
    <div data-banner-id={id}>
      {content}
      {isDemo && renderDemoDropdown()}
    </div>
  )
}
