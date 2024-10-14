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

import { ArrowBackground } from './arrowBackground'
import { LpToken, StateKey } from './dummyData'
import * as styledEl from './styled'

import { DEMO_DROPDOWN_OPTIONS } from './index'

const lpTokenIcons: Record<LpToken, string> = {
  [LpToken.UniswapV2]: ICON_UNISWAP,
  [LpToken.Sushiswap]: ICON_SUSHISWAP,
  [LpToken.PancakeSwap]: ICON_PANCAKESWAP,
  [LpToken.Curve]: ICON_CURVE,
}

interface CoWAmmBannerContentProps {
  location: 'global' | 'tokenSelector'
  selectedState: StateKey
  setSelectedState: (state: StateKey) => void
  dummyData: Record<StateKey, { apr: number; comparison: string }>
  lpTokenConfig: Record<StateKey, LpToken[]>
  handleCTAClick: () => void
  handleBannerClose: () => void
}

export function CoWAmmBannerContent({
  location,
  selectedState,
  setSelectedState,
  dummyData,
  lpTokenConfig,
  handleCTAClick,
  handleBannerClose,
}: CoWAmmBannerContentProps) {
  const isMobile = useMediaQuery(upToSmall)
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

  const aprMessage = useMemo(() => {
    const { apr } = dummyData[selectedState]
    return `+${apr.toFixed(1)}%`
  }, [selectedState, dummyData])

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
  }, [selectedState, lpTokenConfig])

  const isTokenSelector = (loc: typeof location): loc is 'tokenSelector' => loc === 'tokenSelector'

  const renderBannerContent = () => {
    if (isTokenSelector(location)) {
      return (
        <styledEl.TokenSelectorWrapper>
          <styledEl.TokenSelectorWrapperInner>
            <styledEl.Title>
              <ProductLogo
                height={20}
                overrideColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`}
                variant={ProductVariant.CowAmm}
                logoIconOnly
              />
              <span>CoW AMM</span>
            </styledEl.Title>
            <styledEl.Card
              bgColor={'transparent'}
              borderColor={`var(${UI.COLOR_COWAMM_DARK_GREEN_OPACITY_30})`}
              borderWidth={2}
              padding={'14px'}
              gap={'14px'}
              height={'78px'}
            >
              <styledEl.StarIcon size={26} top={-16} right={80} color={`var(${UI.COLOR_COWAMM_LIGHTER_GREEN})`}>
                <SVG src={ICON_STAR} />
              </styledEl.StarIcon>
              <h3>
                <Textfit mode="single" forceSingleModeWidth={false} min={45} max={48} key={aprMessage}>
                  {aprMessage}
                </Textfit>
              </h3>
              <p>
                <Textfit mode="multi" forceSingleModeWidth={false} min={12} max={21} key={comparisonMessage}>
                  {comparisonMessage}
                </Textfit>
              </p>
              <styledEl.StarIcon size={16} bottom={3} right={20} color={`var(${UI.COLOR_COWAMM_LIGHTER_GREEN})`}>
                <SVG src={ICON_STAR} />
              </styledEl.StarIcon>
            </styledEl.Card>
          </styledEl.TokenSelectorWrapperInner>
        </styledEl.TokenSelectorWrapper>
      )
    }

    return (
      <>
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
      </>
    )
  }

  return (
    <>
      {isTokenSelector(location) ? (
        renderBannerContent()
      ) : (
        <styledEl.BannerWrapper>
          <styledEl.CloseButton size={24} onClick={handleBannerClose} />

          <styledEl.DEMO_DROPDOWN value={selectedState} onChange={(e) => setSelectedState(e.target.value as StateKey)}>
            {DEMO_DROPDOWN_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </styledEl.DEMO_DROPDOWN>

          {renderBannerContent()}

          <styledEl.CTAButton
            onClick={handleCTAClick}
            onMouseEnter={handleCTAMouseEnter}
            onMouseLeave={handleCTAMouseLeave}
            size={isTokenSelector(location) ? 38 : undefined}
            fontSize={isTokenSelector(location) ? 18 : undefined}
            bgColor={isTokenSelector(location) ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : undefined}
            bgHoverColor={isTokenSelector(location) ? `var(${UI.COLOR_COWAMM_GREEN})` : undefined}
            color={isTokenSelector(location) ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : undefined}
          >
            Booooost APR gas-free!
          </styledEl.CTAButton>

          <ArrowBackground ref={arrowBackgroundRef} />

          <styledEl.SecondaryLink href={'https://cow.fi/'}>Pool analytics ↗</styledEl.SecondaryLink>
        </styledEl.BannerWrapper>
      )}
    </>
  )
}
