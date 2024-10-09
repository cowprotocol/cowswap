import { useState } from 'react'

import { Media, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import { ClosableBanner } from '@cowprotocol/ui'

import { X } from 'react-feather'
import { Textfit } from 'react-textfit'
import styled from 'styled-components/macro'

import { cowAnalytics } from 'modules/analytics'

const BannerWrapper = styled.div`
  --darkGreen: #194d05;
  --green: #2b6f0b;
  --lightGreen: #bcec79;
  --lighterGreen: #dcf8a7;
  --blue: #3fc4ff;

  position: fixed;
  top: 76px;
  right: 10px;
  z-index: 3;
  width: 485px;
  height: auto;
  border-radius: 24px;
  background-color: var(--darkGreen);
  color: var(--darkGreen);
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
  color: var(--lightGreen);
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
  color: var(--lightGreen);

  ${Media.upToSmall()} {
    font-size: 26px;
  }
`

const Card = styled.div<{ bgColor?: string; color?: string }>`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 24px;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 500;
  margin: 0;
  width: 100%;
  max-width: 100%;
  min-height: 150px;
  border-radius: 16px;
  padding: 24px;
  background: ${({ bgColor }) => bgColor || 'transparent'};
  color: ${({ color }) => color || 'inherit'};

  > h3,
  > p {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    width: 100%;
    height: 100%;

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
`

const CTAButton = styled.button`
  --size: 58px;
  background: var(--lightGreen);
  color: var(--darkGreen);
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
    background: var(--lighterGreen);
  }
`

const SecondaryLink = styled.a`
  color: var(--lightGreen);
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

// Dummy data for different states
const dummyData = {
  noLp: { apr: 1.5, comparison: 'UNI-V2' },
  uniV2: { apr: 2.1, comparison: 'UNI-V2' },
  sushi: { apr: 1.8, comparison: 'SushiSwap' },
  curve: { apr: 1.3, comparison: 'Curve' },
  pancake: { apr: 2.5, comparison: 'PancakeSwap' },
  multiple: { apr: 2.0, comparison: 'UNI-V2, SushiSwap' },
} as const

type StateKey = keyof typeof dummyData

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
    if (selectedState === 'multiple') {
      return `Get higher APR than average ${comparison}`
    }
    return `Get higher APR than ${comparison}`
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
        <option value="multiple">Multiple LP tokens</option>
      </DEMO_DROPDOWN>

      <Title>
        <ProductLogo height={20} overrideColor={'var(--lightGreen)'} variant={ProductVariant.CowAmm} logoIconOnly />
        <span>CoW AMM</span>
      </Title>
      <Card bgColor={'var(--blue)'}>
        <h3>
          <Textfit mode="single" forceSingleModeWidth={false} min={21} max={76}>
            {getAprMessage()}
          </Textfit>
        </h3>
        <p>
          <Textfit mode="multi" forceSingleModeWidth={false} min={10} max={28}>
            {getComparisonMessage()}
          </Textfit>
        </p>
      </Card>

      <Card bgColor={'var(--green)'} color={'var(--lighterGreen)'}>
        <p>
          <Textfit mode="single" forceSingleModeWidth={false} min={10} max={28}>
            One-click convert, boost yield
          </Textfit>
        </p>
      </Card>

      <CTAButton onClick={handleCTAClick}>Booooost APR gas-free!</CTAButton>
      <SecondaryLink href={'https://cow.fi/'}>Pool analytics ↗</SecondaryLink>
    </BannerWrapper>
  ))
}
