import { ButtonSize, ButtonError, RowBetween } from '@cowprotocol/ui'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

export const AnimateWave = styled.span`
  animation-duration: 2.5s;
  animation-iteration-count: infinite;
  animation-name: wave-animation;
  display: inline-block;
  transform-origin: 70% 70%;

  @keyframes wave-animation {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(14deg);
    }
    20% {
      transform: rotate(-8deg);
    }
    30% {
      transform: rotate(14deg);
    }
    40% {
      transform: rotate(-4deg);
    }
    50% {
      transform: rotate(10deg);
    }
    60% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`

export interface SwapButtonBoxProps {
  showLoading?: boolean
  children?: React.ReactNode
}

export const SwapButtonBox = ({ children, showLoading = false }: SwapButtonBoxProps) =>
  showLoading ? (
    <TradeLoadingButton />
  ) : (
    <Text fontSize={18} fontWeight={600}>
      {children}
    </Text>
  )

export function FeesExceedFromAmountMessage() {
  return (
    <RowBetween>
      <ButtonError buttonSize={ButtonSize.BIG} error id="swap-button" disabled>
        <Text fontSize={20} fontWeight={500}>
          Costs exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}
