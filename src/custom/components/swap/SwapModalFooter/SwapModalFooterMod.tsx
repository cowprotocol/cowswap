import { Trans } from '@lingui/macro'
// import { Currency, TradeType } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'

// import { ReactNode } from 'react'
import { Text } from 'rebass'
import { ButtonError } from 'components/Button'
import { AutoRow } from 'components/Row'
import { SwapCallbackError } from 'components/swap/styleds'
import { ButtonSize } from 'theme'

export interface SwapModalFooterProps {
  onConfirm: () => void
  swapErrorMessage: React.ReactNode | undefined
  disabledConfirm: boolean
}

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: /* 
  {
  trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType>
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
} */
SwapModalFooterProps) {
  return (
    <>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
          buttonSize={ButtonSize.BIG}
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>Confirm Swap</Trans>
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
