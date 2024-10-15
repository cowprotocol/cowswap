import React from 'react'
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
import { LpToken, StateKey, dummyData, lpTokenConfig } from './dummyData'
import * as styledEl from './styled'

import { BannerLocation, DEMO_DROPDOWN_OPTIONS } from './index'
import { TokenLogo } from '../../../../../../libs/tokens/src/pure/TokenLogo'
import { USDC, WBTC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DummyDataType, TwoLpScenario } from './dummyData'

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
  dummyData: typeof dummyData
  lpTokenConfig: typeof lpTokenConfig
  onCtaClick: () => void
  onClose: () => void
}

function isTwoLpScenario(scenario: DummyDataType[keyof DummyDataType]): scenario is TwoLpScenario {
  return 'uniV2Apr' in scenario && 'sushiApr' in scenario
}

const renderTextfit = (
  content: React.ReactNode,
  mode: 'single' | 'multi',
  minFontSize: number,
  maxFontSize: number,
  key: string,
) => (
  <Textfit key={key} mode={mode} forceSingleModeWidth={false} min={minFontSize} max={maxFontSize}>
    {content}
  </Textfit>
)

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

  const { apr } = dummyData[selectedState]

  const aprMessage = useMemo(() => `+${apr.toFixed(1)}%`, [apr])

  const comparisonMessage = useMemo(() => {
    const currentData = dummyData[selectedState]

    if (!currentData) {
      return 'Invalid state selected'
    }

    const renderPoolInfo = (poolName: string) => (
      <styledEl.PoolInfo
        flow={location === BannerLocation.TokenSelector ? 'row' : 'column'}
        align={location === BannerLocation.TokenSelector ? 'center' : 'flex-start'}
        bgColor={
          location === BannerLocation.TokenSelector ? `var(${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_15})` : undefined
        }
        color={location === BannerLocation.TokenSelector ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : undefined}
        tokenBorderColor={location === BannerLocation.TokenSelector ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : undefined}
      >
        higher APR available for your {poolName} pool:
        <i>
          <div>
            <TokenLogo token={WBTC} /> <TokenLogo token={USDC[SupportedChainId.MAINNET]} />
          </div>
          <span>WBTC-USDC</span>
        </i>
      </styledEl.PoolInfo>
    )

    if (isTwoLpScenario(currentData)) {
      if (selectedState === 'twoLpsMixed') {
        return renderPoolInfo('UNI-V2')
      } else if (selectedState === 'twoLpsBothSuperior') {
        const { uniV2Apr, sushiApr } = currentData
        const higherAprPool = uniV2Apr > sushiApr ? 'UNI-V2' : 'SushiSwap'
        return renderPoolInfo(higherAprPool)
      }
    }

    if (selectedState === 'uniV2Superior') {
      return renderPoolInfo('UNI-V2')
    }

    if (currentData.hasCoWAmmPool) {
      return `yield over average ${currentData.comparison} pool`
    } else {
      const tokens = lpTokenConfig[selectedState]
      if (tokens.length > 1) {
        const tokenNames = tokens
          .map((token) => {
            switch (token) {
              case LpToken.UniswapV2:
                return 'UNI-V2'
              case LpToken.Sushiswap:
                return 'Sushi'
              case LpToken.PancakeSwap:
                return 'PancakeSwap'
              case LpToken.Curve:
                return 'Curve'
              default:
                return ''
            }
          })
          .filter(Boolean)

        return `yield over average ${tokenNames.join(', ')} pool${tokenNames.length > 1 ? 's' : ''}`
      } else {
        return `yield over average UNI-V2 pool`
      }
    }
  }, [selectedState, lpTokenConfig])

  const lpEmblems = useMemo(() => {
    const tokens = lpTokenConfig[selectedState]
    const totalItems = tokens.length

    if (totalItems === 0) {
      // Fallback to UniswapV2 emblem if no LP tokens
      return (
        <styledEl.LpEmblems>
          <styledEl.LpEmblemItem key={LpToken.UniswapV2} totalItems={1} index={0}>
            <SVG src={lpTokenIcons[LpToken.UniswapV2]} />
          </styledEl.LpEmblemItem>
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
  }, [selectedState, lpTokenConfig, lpTokenIcons])

  const renderProductLogo = useCallback(
    (color: string) => (
      <ProductLogo height={20} overrideColor={`var(${color})`} variant={ProductVariant.CowAmm} logoIconOnly />
    ),
    [],
  )

  const renderStarIcon = useCallback(
    (props: any) => (
      <styledEl.StarIcon {...props}>
        <SVG src={ICON_STAR} />
      </styledEl.StarIcon>
    ),
    [],
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
          padding={'10px'}
          gap={'14px'}
          height={'max-content'}
        >
          {renderStarIcon({ size: 26, top: -16, right: 80, color: `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})` })}
          <h3>{renderTextfit(aprMessage, 'single', 24, 48, `apr-${selectedState}`)}</h3>
          <span>
            {renderTextfit(comparisonMessage, 'multi', 12, isMobile ? 18 : 21, `comparison-${selectedState}`)}
          </span>
          {renderStarIcon({ size: 16, bottom: 3, right: 20, color: `var(${UI.COLOR_COWAMM_LIGHTER_GREEN})` })}
        </styledEl.Card>
        <styledEl.CTAButton
          onClick={onCtaClick}
          onMouseEnter={handleCTAMouseEnter}
          onMouseLeave={handleCTAMouseLeave}
          size={38}
          fontSizeMobile={18}
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

  const renderGlobalContent = () => {
    return (
      <styledEl.BannerWrapper>
        <styledEl.CloseButton size={24} onClick={onClose} />
        <styledEl.Title>
          {renderProductLogo(UI.COLOR_COWAMM_LIGHT_GREEN)}
          <span>{title}</span>
        </styledEl.Title>
        <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_BLUE})`} color={`var(${UI.COLOR_COWAMM_DARK_BLUE})`}>
          {renderStarIcon({ size: 36, top: -17, right: 80 })}
          <h3>{renderTextfit(aprMessage, 'single', isMobile ? 40 : 80, isMobile ? 50 : 80, `apr-${selectedState}`)}</h3>
          <span>
            {renderTextfit(comparisonMessage, 'multi', 10, isMobile ? 21 : 28, `comparison-${selectedState}`)}
          </span>
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
                `boost-yield-${selectedState}`,
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
  }

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
