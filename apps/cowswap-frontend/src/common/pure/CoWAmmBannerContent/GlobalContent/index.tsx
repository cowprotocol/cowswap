import React, { RefObject } from 'react'

import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { ArrowBackground } from '../../ArrowBackground'
import { StarIcon, TextFit } from '../Common'
import { LpToken } from '../dummyData'
import { LpEmblems } from '../LpEmblems'
import * as styledEl from '../styled'
import { CoWAmmBannerContext } from '../types'

interface GlobalContentProps {
  isUniV2InferiorWithLowAverageYield: boolean
  tokens: LpToken[]
  arrowBackgroundRef: RefObject<HTMLDivElement>
  context: CoWAmmBannerContext
}

export function GlobalContent({
  context,
  isUniV2InferiorWithLowAverageYield,
  tokens,
  arrowBackgroundRef,
}: GlobalContentProps) {
  const {
    title,
    ctaText,
    aprMessage,
    comparisonMessage,
    onClose,
    isMobile,
    onCtaClick,
    handleCTAMouseLeave,
    handleCTAMouseEnter,
  } = context

  return (
    <styledEl.BannerWrapper>
      <styledEl.CloseButton size={24} onClick={onClose} />
      <styledEl.Title>
        <ProductLogo
          height={20}
          overrideColor={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}
          variant={ProductVariant.CowAmm}
          logoIconOnly
        />
        <span>{title}</span>
      </styledEl.Title>
      <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_BLUE})`} color={`var(${UI.COLOR_COWAMM_DARK_BLUE})`}>
        <StarIcon size={36} right={80} top={-17} />
        <h3>
          <TextFit mode="single" minFontSize={isMobile ? 40 : 80} maxFontSize={isMobile ? 50 : 80}>
            {aprMessage}
          </TextFit>
        </h3>
        <span>
          <TextFit mode="multi" minFontSize={10} maxFontSize={isMobile ? 21 : 28}>
            {comparisonMessage}
          </TextFit>
        </span>
        <StarIcon size={26} right={20} bottom={-10} />
      </styledEl.Card>

      {!isMobile && (
        <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_GREEN})`} color={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}>
          <span>
            <TextFit mode="multi" minFontSize={10} maxFontSize={30}>
              One-click convert, <strong>boost yield</strong>
            </TextFit>
          </span>
          <LpEmblems tokens={tokens} isUniV2InferiorWithLowAverageYield={isUniV2InferiorWithLowAverageYield} />
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
