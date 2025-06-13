import React, { ReactNode, RefObject } from 'react'

import { LpTokenProvider } from '@cowprotocol/types'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { ArrowBackground } from '../../ArrowBackground'
import { StarIcon, TextFit } from '../Common'
import { LpEmblems } from '../LpEmblems'
import * as styledEl from '../styled'
import { CoWAmmBannerContext } from '../types'

interface GlobalContentProps {
  arrowBackgroundRef: RefObject<HTMLDivElement | null>
  context: CoWAmmBannerContext
  comparedProviders: LpTokenProvider[] | undefined
  children: ReactNode
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function GlobalContent({ context, children, arrowBackgroundRef, comparedProviders }: GlobalContentProps) {
  const { title, ctaText, onClose, isMobile, onCtaClick, handleCTAMouseLeave, handleCTAMouseEnter } = context

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
        {children}
        <StarIcon size={26} right={20} bottom={-10} />
      </styledEl.Card>

      {!isMobile && (
        <styledEl.Card bgColor={`var(${UI.COLOR_COWAMM_GREEN})`} color={`var(${UI.COLOR_COWAMM_LIGHT_GREEN})`}>
          <span>
            <TextFit mode="multi" minFontSize={10} maxFontSize={30}>
              One-click convert, <strong>boost yield</strong>
            </TextFit>
          </span>
          <LpEmblems comparedProviders={comparedProviders} />
        </styledEl.Card>
      )}

      <styledEl.CTAButton onClick={onCtaClick} onMouseEnter={handleCTAMouseEnter} onMouseLeave={handleCTAMouseLeave}>
        {ctaText}
      </styledEl.CTAButton>

      <styledEl.SecondaryLink href="https://dune.com/cowprotocol/cow-amms-v2">Pool analytics ↗</styledEl.SecondaryLink>

      <ArrowBackground ref={arrowBackgroundRef} />
    </styledEl.BannerWrapper>
  )
}
