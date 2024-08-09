import { Media } from '@cowprotocol/ui'
import { ClosableBanner } from '@cowprotocol/ui'

import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { cowAnalytics } from 'modules/analytics'

const BannerWrapper = styled.div`
  --darkGreen: #194d05;
  --lightGreen: #bcec79;

  position: fixed;
  top: 76px;
  right: 10px;
  z-index: 3;
  width: 400px;
  height: 327px;
  border-radius: 24px;
  background-color: var(--darkGreen);
  color: var(--lightGreen);
  padding: 24px;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
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

  > i {
    position: absolute;
    top: -30px;
    left: -30px;
    width: 166px;
    height: 42px;
    border: 1px solid var(--lightGreen);
    border-radius: 16px;
    border-left: 0;
    animation: bounceLeftRight 7s infinite;
    animation-delay: 2s;
  }

  &::before {
    content: '';
    position: absolute;
    top: 100px;
    left: -23px;
    width: 56px;
    height: 190px;
    border: 1px solid var(--lightGreen);
    border-radius: 16px;
    border-left: 0;
    animation: bounceUpDown 7s infinite;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -21px;
    right: 32px;
    width: 76px;
    height: 36px;
    border: 1px solid var(--lightGreen);
    border-radius: 16px;
    border-bottom: 0;
    animation: bounceLeftRight 7s infinite;
    animation-delay: 1s;
  }

  > div {
    display: flex;
    flex-flow: column wrap;
    gap: 24px;
    width: 100%;
    max-width: 75%;
    margin: 0 auto;
  }

  @keyframes bounceUpDown {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-7px);
    }
  }

  @keyframes bounceLeftRight {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(7px);
    }
  }
`

const Title = styled.h2`
  font-size: 34px;
  font-weight: bold;
  margin: 0;

  ${Media.upToSmall()} {
    font-size: 26px;
  }
`

const Description = styled.p`
  font-size: 17px;
  line-height: 1.5;
  margin: 0;

  ${Media.upToSmall()} {
    font-size: 15px;
  }
`

const CTAButton = styled.button`
  background-color: var(--lightGreen);
  color: var(--darkGreen);
  border: none;
  border-radius: 56px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  max-width: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: border-radius 0.2s ease-in-out;

  &:hover {
    border-radius: 16px;

    > i {
      transform: rotate(45deg);
    }
  }

  > i {
    font-size: 22px;
    font-weight: bold;
    font-style: normal;
    line-height: 1;
    margin: 3px 0 0;
    transition: transform 0.2s ease-in-out;
    animation: spin 6s infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    20% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(360deg);
    }
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

export function CoWAmmBanner() {
  const handleCTAClick = () => {
    cowAnalytics.sendEvent({
      category: 'CoW Swap',
      action: 'CoW AMM Banner CTA Clicked',
    })

    window.open(
      'https://balancer.fi/pools/cow?utm_source=swap.cow.fi&utm_medium=web&utm_content=cow_amm_banner',
      '_blank'
    )
  }

  return ClosableBanner('cow_amm_banner', (close) => (
    <BannerWrapper>
      <i></i>
      <CloseButton size={24} onClick={close} />
      <div>
        <Title>The first MEV-capturing AMM</Title>
        <Description>
          CoW AMM shields you from LVR, so you can provide liquidity with less risk and more rewards.
        </Description>
      </div>
      <CTAButton onClick={handleCTAClick}>
        LP on CoW AMM <i>↗</i>
      </CTAButton>
    </BannerWrapper>
  ))
}
