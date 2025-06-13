import React, { ReactNode } from 'react'

import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { StarIcon } from '../Common'
import * as styledEl from '../styled'
import { CoWAmmBannerContext } from '../types'

interface TokenSelectorContentProps {
  isDarkMode: boolean
  context: CoWAmmBannerContext
  children: ReactNode
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenSelectorContent({ isDarkMode, context, children }: TokenSelectorContentProps) {
  const { title, ctaText, onClose, onCtaClick, handleCTAMouseEnter, handleCTAMouseLeave } = context

  const mainColor = isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN : UI.COLOR_COWAMM_DARK_GREEN

  return (
    <styledEl.TokenSelectorWrapper>
      <styledEl.TokenSelectorWrapperInner
        bgColor={isDarkMode ? `var(${UI.COLOR_COWAMM_DARK_GREEN})` : undefined}
        color={isDarkMode ? `var(${UI.COLOR_COWAMM_LIGHT_GREEN})` : undefined}
      >
        <styledEl.CloseButton size={24} top={14} onClick={onClose} color={`var(${mainColor})`} />
        <styledEl.Title color={`var(${mainColor})`}>
          <ProductLogo height={20} overrideColor={`var(${mainColor})`} variant={ProductVariant.CowAmm} logoIconOnly />
          <span>{title}</span>
        </styledEl.Title>
        <styledEl.Card
          bgColor={'transparent'}
          borderColor={`var(${isDarkMode ? UI.COLOR_COWAMM_LIGHT_GREEN_OPACITY_30 : UI.COLOR_COWAMM_DARK_GREEN_OPACITY_30})`}
          borderWidth={2}
          padding={'10px'}
          gap={'14px'}
          height={90}
        >
          <StarIcon size={26} top={-16} right={80} color={UI.COLOR_COWAMM_LIGHTER_GREEN} />
          {children}
          <StarIcon size={16} bottom={3} right={20} color={UI.COLOR_COWAMM_LIGHTER_GREEN} />
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
}
