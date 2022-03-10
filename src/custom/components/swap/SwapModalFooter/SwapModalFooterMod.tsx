import { Trans } from '@lingui/macro'
// import { Trade } from '@uniswap/router-sdk'
// import { Currency, TradeType } from '@uniswap/sdk-core'
import { ReactNode } from 'react'
import { Text } from 'rebass'

import { ButtonError } from 'components/Button'
import { AutoRow } from 'components/Row'
import { SwapCallbackError } from 'components/swap/styleds'

// MOD imports
import { ButtonSize } from 'theme'

export interface SwapModalFooterProps {
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
}

export default function SwapModalFooter({
  onConfirm,
  swapErrorMessage,
  disabledConfirm,
}: /* 
  {
  trade: Trade<Currency, Currency, TradeType>
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
