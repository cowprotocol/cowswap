import { ButtonSize, ButtonError, RowBetween } from '@cowprotocol/ui'

import { Text } from 'rebass'

import { TradeLoadingButton } from 'common/pure/TradeLoadingButton'

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
