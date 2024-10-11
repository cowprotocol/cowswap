import { useState, useCallback, useMemo } from 'react'

import styled from 'styled-components/macro'
import ICON_STAR from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'
import { ClosableBanner } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'

import { upToSmall, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { cowAnalytics } from 'modules/analytics'

import { dummyData, StateKey } from './dummyData'
import * as styledEl from './styled'

export const Wrapper = styled.div`
  z-index: 3;
  width: 100%;
  padding: 20px;
  position: relative;
`

const WrapperInner = styled.div`
  position: relative;
  width: 100%;
  height: auto;
  border-radius: 24px;
  background-color: var(${UI.COLOR_COWAMM_LIGHT_GREEN});
  color: var(${UI.COLOR_COWAMM_DARK_GREEN});
  padding: 14px;
  margin: 0 auto;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 14px;
  overflow: hidden;
`

const ANALYTICS_URL = 'https://cow.fi/pools?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner'
const BANNER_ID = 'cow_amm_banner_tokenselector_2024_va'

export function CoWAmmTokenSelectorBanner() {
  const [selectedState, setSelectedState] = useState<StateKey>('noLp')

  const handleCTAClick = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner [Token selector] CTA Clicked',
    })

    window.open(ANALYTICS_URL, '_blank')
  }, [])

  const handleClose = useCallback(() => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner [Token selector] Closed',
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

  const handleBannerClose = (close: () => void) => () => {
    handleClose()
    close()
  }

  return ClosableBanner(BANNER_ID, (close) => (
    <Wrapper>
      <WrapperInner>
        <styledEl.CloseButton
          top={14}
          size={24}
          onClick={handleBannerClose(close)}
          color={`var(${UI.COLOR_COWAMM_DARK_GREEN})`}
        />

        <styledEl.Title color={`var(${UI.COLOR_COWAMM_DARK_GREEN})`}>
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

        <styledEl.CTAButton
          onClick={handleCTAClick}
          size={38}
          fontSize={18}
          bgColor={`var(${UI.COLOR_COWAMM_DARK_GREEN})`}
          bgHoverColor={`var(${UI.COLOR_COWAMM_GREEN})`}
          color={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}
        >
          Boooooost APR gas-free!
        </styledEl.CTAButton>
      </WrapperInner>
    </Wrapper>
  ))
}
