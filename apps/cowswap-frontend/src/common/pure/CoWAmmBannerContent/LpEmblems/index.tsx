import React from 'react'

import ICON_ARROW from '@cowprotocol/assets/cow-swap/arrow.svg'
import ICON_CURVE from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import ICON_PANCAKESWAP from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import ICON_SUSHISWAP from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import ICON_UNISWAP from '@cowprotocol/assets/cow-swap/icon-uni.svg'
import { USDC } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenLogo } from '@cowprotocol/tokens'
import { ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { LpToken } from '../dummyData'
import * as styledEl from '../styled'

const lpTokenIcons: Record<LpToken, string> = {
  [LpToken.UniswapV2]: ICON_UNISWAP,
  [LpToken.Sushiswap]: ICON_SUSHISWAP,
  [LpToken.PancakeSwap]: ICON_PANCAKESWAP,
  [LpToken.Curve]: ICON_CURVE,
}

interface LpEmblemsProps {
  isUniV2InferiorWithLowAverageYield: boolean
  tokens: LpToken[]
}

export function LpEmblems({ tokens, isUniV2InferiorWithLowAverageYield }: LpEmblemsProps) {
  const totalItems = tokens.length

  const renderEmblemContent = () => (
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

  if (totalItems === 0 || isUniV2InferiorWithLowAverageYield) {
    return (
      <styledEl.LpEmblems>
        <styledEl.LpEmblemItem key="USDC" totalItems={1} index={0} isUSDC={isUniV2InferiorWithLowAverageYield}>
          {isUniV2InferiorWithLowAverageYield ? (
            <TokenLogo token={USDC[SupportedChainId.MAINNET]} size={40} />
          ) : (
            <SVG src={lpTokenIcons[LpToken.UniswapV2]} />
          )}
        </styledEl.LpEmblemItem>
        {renderEmblemContent()}
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
      {renderEmblemContent()}
    </styledEl.LpEmblems>
  )
}
