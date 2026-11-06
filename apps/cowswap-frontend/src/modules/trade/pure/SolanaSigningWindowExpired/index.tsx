import { ReactNode, useCallback } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { ButtonPrimary, font, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { AlertTriangle } from 'react-feather'
import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { NewModal, NewModalProps } from 'common/pure/NewModal'

import { SolanaTradeAmountsRow } from '../SolanaTradeAmountsRow'

export type SolanaSigningWindowExpiredProps = NewModalProps & {
  inputAmount: Nullish<CurrencyAmount<Currency>>
  outputAmount: Nullish<CurrencyAmount<Currency>>
}

export function SolanaSigningWindowExpired(props: SolanaSigningWindowExpiredProps): ReactNode {
  const { inputAmount, outputAmount, ...rest } = props
  const { onDismiss } = rest
  const onBackToSwap = useCallback(() => onDismiss?.(), [onDismiss])

  return (
    <NewModal {...rest} title={<Trans>Signing window expired</Trans>} contentPadding="16px">
      <StatusGroup>
        <StatusPanel>
          <AlertIcon size={48} />
          <StatusHeading>
            <Trans>No order was submitted</Trans>
          </StatusHeading>
          <StatusMessage>
            <Trans>The signing window closed before the transaction was signed. Please try again.</Trans>
          </StatusMessage>
        </StatusPanel>

        <SolanaTradeAmountsRow inputAmount={inputAmount} outputAmount={outputAmount} />
      </StatusGroup>

      <BackToSwapButton onClick={onBackToSwap}>
        <Trans>Back to swap</Trans>
      </BackToSwapButton>
    </NewModal>
  )
}

const StatusGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  border-radius: 21px;
  overflow: hidden;
`

const StatusPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 260px;
  padding: 24px;
  background: var(${UI.COLOR_DANGER_BG});
  text-align: center;
`

const AlertIcon = styled(AlertTriangle)`
  color: var(${UI.COLOR_DANGER_TEXT});
  stroke-width: 1.5;
  margin-bottom: 8px;
`

const StatusHeading = styled.span`
  ${font('FONT_MEDIUM', 'semibold')}
  color: var(${UI.COLOR_DANGER_TEXT});
`

const StatusMessage = styled.span`
  ${font('FONT_NORMAL')}
  color: var(${UI.COLOR_DANGER_TEXT});
`

const BackToSwapButton = styled(ButtonPrimary)`
  width: 100%;
  min-height: 58px;
  margin-top: 16px;
  ${font('FONT_LARGE')}
`
