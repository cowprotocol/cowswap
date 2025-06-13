import React from 'react'

import ICON_ARROW from '@cowprotocol/assets/cow-swap/arrow.svg'
import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { LP_PROVIDER_ICONS } from '../const'
import * as styledEl from '../styled'

interface LpEmblemsProps {
  comparedProviders: LpTokenProvider[] | undefined
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LpEmblems({ comparedProviders }: LpEmblemsProps) {
  const EmblemContent = (
    <>
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
    </>
  )

  if (!comparedProviders?.length) {
    return (
      <styledEl.LpEmblems>
        <styledEl.LpEmblemItem totalItems={1} index={0} isUSDC>
          <TokenLogo token={USDC[SupportedChainId.MAINNET]} size={40} />
        </styledEl.LpEmblemItem>
        {EmblemContent}
      </styledEl.LpEmblems>
    )
  }

  const totalItems = comparedProviders.length

  return (
    <styledEl.LpEmblems>
      <styledEl.LpEmblemItemsWrapper totalItems={totalItems}>
        {comparedProviders.map((provider, index) => (
          <styledEl.LpEmblemItem key={provider} totalItems={totalItems} index={index}>
            <SVG src={LP_PROVIDER_ICONS[provider]} />
          </styledEl.LpEmblemItem>
        ))}
      </styledEl.LpEmblemItemsWrapper>
      {EmblemContent}
    </styledEl.LpEmblems>
  )
}
