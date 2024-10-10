import { useState } from 'react'

import ICON_ARROW from '@cowprotocol/assets/cow-swap/arrow.svg'
import ICON_CURVE from '@cowprotocol/assets/cow-swap/icon-curve.svg'
import ICON_PANCAKESWAP from '@cowprotocol/assets/cow-swap/icon-pancakeswap.svg'
import ICON_SUSHISWAP from '@cowprotocol/assets/cow-swap/icon-sushi.svg'
import ICON_UNISWAP from '@cowprotocol/assets/cow-swap/icon-uni.svg'
import ICON_STAR from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import { ClosableBanner } from '@cowprotocol/ui'

import { X } from 'react-feather'
import SVG from 'react-inlinesvg'
import { Textfit } from 'react-textfit'
import styled from 'styled-components/macro'

import { cowAnalytics } from 'modules/analytics'

// Add this enum at the top of the file, after imports
enum CoWAMMColors {
  DarkGreen = '#194d05',
  Green = '#2b6f0b',
  LightGreen = '#bcec79',
  LighterGreen = '#dcf8a7',
  Blue = '#3fc4ff',
  LightBlue = '#ccf8ff',
}

// Add this enum after the CoWAMMColors enum
enum LpToken {
  UniswapV2 = 'UniswapV2',
  Sushiswap = 'Sushiswap',
  PancakeSwap = 'PancakeSwap',
  Curve = 'Curve',
}

const BannerWrapper = styled.div`
  position: fixed;
  top: 76px;
  right: 10px;
  z-index: 3;
  width: 485px;
  height: auto;
  border-radius: 24px;
  background-color: ${CoWAMMColors.DarkGreen};
  color: ${CoWAMMColors.DarkGreen};
  padding: 20px;
  gap: 20px;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${Media.upToSmall()} {
    width: 100%;
    height: auto;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 57px;
    top: initial;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-shadow: 0 0 0 100vh rgb(0 0 0 / 40%);
    z-index: 10;
  }
`

const CloseButton = styled(X)`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
  color: ${CoWAMMColors.LightGreen};
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }
`

const Title = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto 0 0;
  color: ${CoWAMMColors.LightGreen};

  ${Media.upToSmall()} {
    font-size: 26px;
  }
`

const Card = styled.div<{ bgColor?: string; color?: string; height?: string }>`
  --default-height: 150px;
  display: flex;
  flex-flow: row nowrap;
  gap: 24px;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
  margin: 0;
  width: 100%;
  max-width: 100%;
  height: ${({ height }) => height || 'var(--default-height)'};
  max-height: ${({ height }) => height || 'var(--default-height)'};
  border-radius: 16px;
  padding: 24px;
  background: ${({ bgColor }) => bgColor || 'transparent'};
  color: ${({ color }) => color || 'inherit'};
  position: relative;
  > h3,
  > p {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    width: 100%;
    height: 100%;
    max-height: 100%;

    > div {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  > h3 {
    font-weight: bold;
    letter-spacing: -2px;
  }

  > p {
    font-weight: inherit;
  }

  > p b {
    font-weight: 900;
    color: ${CoWAMMColors.LighterGreen};
  }
`

const CTAButton = styled.button`
  --size: 58px;
  background: ${CoWAMMColors.LightGreen};
  color: ${CoWAMMColors.DarkGreen};
  border: none;
  border-radius: var(--size);
  min-height: var(--size);
  padding: 12px 24px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease-in-out;

  &:hover {
    background: ${CoWAMMColors.LighterGreen};
  }
`

const SecondaryLink = styled.a`
  color: ${CoWAMMColors.LightGreen};
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const DEMO_DROPDOWN = styled.select`
  position: fixed;
  bottom: 150px;
  right: 10px;
  z-index: 999999999;
  padding: 5px;
  font-size: 16px;
`

const StarIcon = styled.div<{ size?: number; top?: number; left?: number; right?: number; bottom?: number }>`
  width: ${({ size }) => size || 16}px;
  height: ${({ size }) => size || 16}px;
  position: absolute;
  top: ${({ top }) => top ?? 'initial'}px;
  left: ${({ left }) => left ?? 'initial'}px;
  right: ${({ right }) => right ?? 'initial'}px;
  bottom: ${({ bottom }) => bottom ?? 'initial'}px;
`

const LpEmblems = styled.div<{ totalItems: number }>`
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
  align-items: center;
`

const LpEmblemItemsWrapper = styled.div<{ totalItems: number }>`
  display: ${({ totalItems }) => (totalItems > 2 ? 'grid' : 'flex')};
  gap: ${({ totalItems }) => (totalItems > 2 ? '0' : '8px')};
  width: 100%;
  justify-content: center;
  align-items: center;

  ${({ totalItems }) =>
    totalItems === 3 &&
    `
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    justify-items: center;

    > :first-child {
      grid-column: 1 / -1;
    }
  `}

  ${({ totalItems }) =>
    totalItems === 4 &&
    `
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  `}
`

const LpEmblemItem = styled.div<{
  totalItems: number
  index: number
}>`
  --size: ${({ totalItems }) =>
    totalItems === 4 ? '50px' : totalItems === 3 ? '65px' : totalItems === 2 ? '80px' : '104px'};
  width: var(--size);
  height: var(--size);
  padding: ${({ totalItems }) => (totalItems === 4 ? '10px' : totalItems >= 2 ? '15px' : '20px')};
  border-radius: 50%;
  background: ${CoWAMMColors.DarkGreen};
  color: ${CoWAMMColors.LightGreen};
  border: ${({ totalItems }) =>
    totalItems > 2 ? `2px solid ${CoWAMMColors.Green}` : `4px solid ${CoWAMMColors.Green}`};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  > svg {
    width: 100%;
    height: 100%;
  }

  ${({ totalItems, index }) => {
    const styleMap: Record<number, Record<number, string>> = {
      2: {
        0: 'margin-right: -42px;',
      },
      3: {
        0: 'margin-bottom: -20px; z-index: 10;',
        1: 'margin-top: -20px;',
        2: 'margin-top: -20px;',
      },
      4: {
        0: 'margin-bottom: -5px; z-index: 10; margin-right: -10px;',
        1: 'margin-bottom: -5px; z-index: 10;',
        2: 'margin-top: -5px; margin-right: -10px;',
        3: 'margin-top: -5px;',
      },
    }

    return styleMap[totalItems]?.[index] || ''
  }}
`

const CoWAMMEmblemItem = styled.div`
  --size: 104px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  padding: 30px 30px 23px 30px;
  background: ${CoWAMMColors.LightGreen};
  color: ${CoWAMMColors.DarkGreen};
  border: 4px solid ${CoWAMMColors.Green};
  display: flex;
  align-items: center;
  justify-content: center;
`

const EmblemArrow = styled.div`
  --size: 32px;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  border-radius: var(--size);
  background: ${CoWAMMColors.DarkGreen};
  border: 3px solid ${CoWAMMColors.Green};
  margin: 0 -24px;
  padding: 6px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${CoWAMMColors.LightGreen};

  > svg > path {
    fill: ${CoWAMMColors.LightGreen};
  }
`
// Update the dummyData object to include all possible states
const dummyData = {
  noLp: { apr: 1.5, comparison: 'UNI-V2' },
  uniV2: { apr: 2.1, comparison: 'UNI-V2' },
  sushi: { apr: 1.8, comparison: 'SushiSwap' },
  curve: { apr: 1.3, comparison: 'Curve' },
  pancake: { apr: 2.5, comparison: 'PancakeSwap' },
  twoLps: { apr: 2.0, comparison: 'UNI-V2 and SushiSwap' },
  threeLps: { apr: 2.2, comparison: 'UNI-V2, SushiSwap, and Curve' },
  fourLps: { apr: 2.4, comparison: 'UNI-V2, Sushiswap, Curve, and Balancer' },
} as const

type StateKey = keyof typeof dummyData

// Update the lpTokenConfig mapping to match dummyData keys
const lpTokenConfig: Record<StateKey, LpToken[]> = {
  noLp: [LpToken.UniswapV2],
  uniV2: [LpToken.UniswapV2],
  sushi: [LpToken.Sushiswap],
  curve: [LpToken.Curve],
  pancake: [LpToken.PancakeSwap],
  twoLps: [LpToken.UniswapV2, LpToken.Sushiswap],
  threeLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve],
  fourLps: [LpToken.UniswapV2, LpToken.Sushiswap, LpToken.Curve, LpToken.Curve],
}

const lpTokenIcons: Record<LpToken, string> = {
  [LpToken.UniswapV2]: ICON_UNISWAP,
  [LpToken.Sushiswap]: ICON_SUSHISWAP,
  [LpToken.PancakeSwap]: ICON_PANCAKESWAP,
  [LpToken.Curve]: ICON_CURVE,
}

export function CoWAmmBanner() {
  const [selectedState, setSelectedState] = useState<StateKey>('noLp')

  const handleCTAClick = () => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner CTA Clicked',
    })

    window.open(
      'https://balancer.fi/pools/cow?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner',
      '_blank',
    )
  }

  const handleClose = () => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner Closed',
    })
  }

  const getAprMessage = () => {
    const { apr } = dummyData[selectedState]
    return `+${apr.toFixed(1)}%`
  }

  const getComparisonMessage = () => {
    const { comparison } = dummyData[selectedState]
    if (selectedState === 'noLp') {
      return `yield over the average UNI-V2 pool`
    }
    if (selectedState === 'twoLps' || selectedState === 'threeLps') {
      return `Get higher average APR than ${comparison}`
    }
    return `Get higher APR than ${comparison}`
  }

  const renderLpEmblems = () => {
    const tokens = lpTokenConfig[selectedState]
    const totalItems = tokens.length

    if (totalItems === 0) {
      return null
    }

    return (
      <LpEmblems totalItems={totalItems}>
        <LpEmblemItemsWrapper totalItems={totalItems}>
          {tokens.map((token, index) => (
            <LpEmblemItem key={token} totalItems={totalItems} index={index}>
              <SVG src={lpTokenIcons[token]} />
            </LpEmblemItem>
          ))}
        </LpEmblemItemsWrapper>
        <EmblemArrow>
          <SVG src={ICON_ARROW} />
        </EmblemArrow>
        <CoWAMMEmblemItem>
          <ProductLogo
            height={'100%'}
            overrideColor={CoWAMMColors.DarkGreen}
            variant={ProductVariant.CowAmm}
            logoIconOnly
          />
        </CoWAMMEmblemItem>
      </LpEmblems>
    )
  }

  return ClosableBanner('cow_amm_banner_2024_va', (close) => (
    <BannerWrapper>
      <CloseButton
        size={24}
        onClick={() => {
          handleClose()
          close()
        }}
      />

      <DEMO_DROPDOWN value={selectedState} onChange={(e) => setSelectedState(e.target.value as StateKey)}>
        <option value="noLp">No LP tokens</option>
        <option value="uniV2">UNI-V2 LP</option>
        <option value="sushi">SushiSwap LP</option>
        <option value="curve">Curve LP</option>
        <option value="pancake">PancakeSwap LP</option>
        <option value="twoLps">2 LP tokens</option>
        <option value="threeLps">3 LP tokens</option>
        <option value="fourLps">4 LP tokens</option>
      </DEMO_DROPDOWN>

      <Title>
        <ProductLogo height={20} overrideColor={CoWAMMColors.DarkGreen} variant={ProductVariant.CowAmm} logoIconOnly />
        <span>CoW AMM</span>
      </Title>
      <Card bgColor={CoWAMMColors.Blue}>
        <StarIcon size={36} top={-17} right={80}>
          <SVG src={ICON_STAR} />
        </StarIcon>
        <h3>
          <Textfit mode="single" forceSingleModeWidth={false} min={21} max={80} key={getAprMessage()}>
            {getAprMessage()}
          </Textfit>
        </h3>
        <p>
          <Textfit mode="multi" forceSingleModeWidth={false} min={10} max={28} key={getComparisonMessage()}>
            {getComparisonMessage()}
          </Textfit>
        </p>
        <StarIcon size={26} bottom={-10} right={20}>
          <SVG src={ICON_STAR} />
        </StarIcon>
      </Card>

      <Card bgColor={CoWAMMColors.Green} color={CoWAMMColors.LightGreen}>
        <p>
          <Textfit mode="multi" forceSingleModeWidth={false} min={10} max={30}>
            One-click convert, <b>boost yield</b>
          </Textfit>
        </p>
        {renderLpEmblems()}
      </Card>

      <CTAButton onClick={handleCTAClick}>Booooost APR gas-free!</CTAButton>
      <SecondaryLink href={'https://cow.fi/'}>Pool analytics ↗</SecondaryLink>
    </BannerWrapper>
  ))
}
