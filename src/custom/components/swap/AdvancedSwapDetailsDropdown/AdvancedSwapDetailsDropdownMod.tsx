import { Percent } from '@uniswap/sdk-core'
import styled from 'styled-components/macro'
import { useLastTruthy } from 'hooks/useLast'
import { AdvancedSwapDetails /* , AdvancedSwapDetailsProps */ } from 'components/swap/AdvancedSwapDetails'
import TradeGp from 'state/swap/TradeGp'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  width: 100%;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
`

interface AdvancedSwapDetailsProps {
  trade?: TradeGp
  allowedSlippage: Percent
}

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)

  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </AdvancedDetailsFooter>
  )
}

// TODO: file no longer exists at origin.
// TODO: decide if we want to adapt to new code or make it a no longer "mod" file
