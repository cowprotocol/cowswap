import { Trans } from '@lingui/macro'

import styled from 'styled-components/macro'
import { transparentize } from 'polished'
import { EthFlowState } from '@cow/modules/swap/services/ethFlow/types'

const ModalMessage = styled.div`
  display: flex;
  flex-flow: row wrap;
  padding: 0;
  width: 100%;
  color: ${({ theme }) => theme.wallet.color};
  font-size: 15px;
  line-height: 1.3;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 2rem;
  `}
`

const LowBalanceMessage = styled(ModalMessage)`
  margin: 0 0 8px;
  background-color: ${({ theme }) => transparentize(0.2, theme.warning)};
  color: ${({ theme }) => theme.text2};
  padding: 8px 12px;
  border-radius: 10px;
  width: 100%;
  box-sizing: border-box;
`

export type BalanceChecks = { isLowBalance: boolean; txsRemaining: string | null } | undefined

export type TopContentParams = {
  descriptions: string[] | null
  state: EthFlowState
  balanceChecks: BalanceChecks
  nativeSymbol: string
}

export function EthFlowModalTopContent({ descriptions, state, balanceChecks, nativeSymbol }: TopContentParams) {
  return (
    <>
      {!!descriptions?.length && (
        <ModalMessage>
          {descriptions.map((description, index) => (
            <p key={index}>
              <Trans>{description}</Trans>
            </p>
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
                sufficient for{' '}
                <strong>up to {balanceChecks.txsRemaining} wrapping, unwrapping, or approval operation(s).</strong>
              </>
            )}
          </Trans>
        </LowBalanceMessage>
      )}
    </>
  )
}
