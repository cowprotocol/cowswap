import { ReactNode } from 'react'

import { ButtonSize, ButtonError, AutoRow, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { SwapCallbackError } from 'legacy/components/swap/styleds'

const Wrapper = styled.div`
  ${RowBetween} > div,
  ${RowFixed} > div {
    color: inherit;
  }
`

export interface SwapModalFooterProps {
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  disabledConfirm: boolean
  buttonText?: ReactNode
}

export function SwapModalFooter({ onConfirm, swapErrorMessage, disabledConfirm, buttonText }: SwapModalFooterProps) {
  return (
    <Wrapper>
      <AutoRow>
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          style={{ margin: '10px 0 0 0' }}
          id="confirm-swap-or-send"
          buttonSize={ButtonSize.BIG}
        >
          <Text fontSize={20} fontWeight={500}>
            <Trans>{buttonText || 'Confirm Swap'}</Trans>
          </Text>
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </Wrapper>
  )
}
