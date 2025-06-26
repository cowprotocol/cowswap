import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { darken, transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { EthFlowState } from '../../services/ethFlow/types'

const ModalMessage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 16px 0 0;
  width: 100%;
  color: ${({ theme }) => transparentize(theme.text, 0.15)};
  font-size: 14px;
  line-height: 1.3;

  ${Media.upToSmall()} {
    margin-top: 2rem;
  }

  > span {
    margin: 0 0 8px;
  }
`

const LowBalanceMessage = styled(ModalMessage)`
  margin: 0 0 10px;
  background: ${({ theme }) => (theme.darkMode ? transparentize(theme.alert, 0.9) : transparentize(theme.alert, 0.85))};
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_ALERT})` : darken(theme.alert, 0.2))};
  padding: 16px;
  border-radius: 16px;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;

  > strong {
    display: contents;
  }
`

export type BalanceChecks = { isLowBalance: boolean; txsRemaining: string | null } | undefined

export type TopContentParams = {
  descriptions: string[] | null
  state: EthFlowState
  balanceChecks: BalanceChecks
  nativeSymbol: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EthFlowModalTopContent({ descriptions, state, balanceChecks, nativeSymbol }: TopContentParams) {
  return (
    <>
      {!!descriptions?.length && (
        <ModalMessage>
          {descriptions.map((description, index) => (
            <span key={index}>
              <Trans>{description}</Trans>
            </span>
          ))}
        </ModalMessage>
      )}
      {/* Warn user if native balance low for on-chain operations EXCEPT if state is ready to swap */}
      {state !== EthFlowState.SwapReady && balanceChecks?.isLowBalance && (
        <LowBalanceMessage>
          <Trans>
            At current gas prices, your remaining {nativeSymbol} balance after confirmation may be{' '}
            {!balanceChecks.txsRemaining ? (
              <strong>insufficient for any further on-chain transactions.</strong>
            ) : (
              <>
                only sufficient for{' '}
                <strong>up to {balanceChecks.txsRemaining} wrapping, unwrapping, or approval operation(s).</strong>
              </>
            )}
          </Trans>
        </LowBalanceMessage>
      )}
    </>
  )
}
