import { ButtonSize } from 'theme/enum'
import { Text } from 'rebass'
import { ButtonError } from 'components/Button'
import { RowBetween } from 'components/Row'
import { TradeLoadingButton } from '@cow/modules/trade/pure/TradeLoadingButton'

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
          Fees exceed from amount
        </Text>
      </ButtonError>
    </RowBetween>
  )
}
