import { ReactNode } from 'react'
import { Trans } from '@lingui/macro'
import { Text } from 'rebass'
import { AutoRow, RowBetween, RowFixed } from 'components/Row'
import styled from 'styled-components/macro'
import { ButtonError } from 'components/Button'
import { ButtonSize } from 'theme/enum'
import { SwapCallbackError } from 'components/swap/styleds'

const Wrapper = styled.div`
  ${RowBetween} > div,
  ${RowFixed} > div {
    color: ${({ theme }) => theme.text1};
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
