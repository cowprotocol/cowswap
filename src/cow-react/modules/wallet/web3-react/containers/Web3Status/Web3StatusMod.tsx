// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getConnection } from '@cow/modules/wallet/web3-react/utils/connection'
import { darken } from 'polished'
import { Activity } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import styled, { css } from 'styled-components/macro'

import { useHasSocks } from 'hooks/useSocksBalance'
import { useToggleWalletModal } from 'state/application/hooks'
import { shortenAddress } from 'utils'
import StatusIcon from '@cow/modules/wallet/api/pure/StatusIcon'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'

import FollowPendingTxPopup, { useCloseFollowTxPopupIfNotPendingOrder } from 'components/Popups/FollowPendingTxPopup'
import { ButtonSecondary } from 'components/Button'

export const Web3StatusGeneric = styled(ButtonSecondary)``

const Web3StatusError = styled(Web3StatusGeneric)`
  background-color: ${({ theme }) => theme.red1};
  border: 1px solid ${({ theme }) => theme.red1};
  color: ${({ theme }) => theme.white};
  font-weight: 500;
  :hover,
  :focus {
    background-color: ${({ theme }) => darken(0.1, theme.red1)};
  }
`

export const Web3StatusConnect = styled(Web3StatusGeneric)<{ faded?: boolean }>`
  /* border: none; */
  /* color: ${({ theme }) => theme.primaryText1}; */
  /* font-weight: 500; */

  /* :hover,
  :focus {
    border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
    color: ${({ theme }) => theme.primaryText1};
  } */

  /* ${({ faded }) =>
    faded &&
    css`
      background-color: ${({ theme }) => theme.primary5};
      border: 1px solid ${({ theme }) => theme.primary5};
      color: ${({ theme }) => theme.primaryText1};

      :hover,
      :focus {
        border: 1px solid ${({ theme }) => darken(0.05, theme.primary4)};
        color: ${({ theme }) => darken(0.05, theme.primaryText1)};
      }
    `} */
`

export const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean; clickDisabled?: boolean }>`
  background-color: ${({ theme }) => theme.grey1};
  border: 1px solid transparent;
  color: ${({ theme }) => theme.text1};
  font-weight: 500;

  &:hover {
    background-color: ${({ theme }) => theme.grey1};
    color: ${({ theme }) => theme.text1};
  }

  ${({ clickDisabled }) =>
    clickDisabled &&
    css`
      cursor: not-allowed;
      pointer-events: none;
    `}
`

export const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 0.5rem 0 0.25rem;
  font-size: 1rem;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`

function Sock() {
  return (
    <span role="img" aria-label={t`has socks emoji`} style={{ marginTop: -4, marginBottom: -4 }}>
      🧦
    </span>
  )
}

export function Web3StatusInner({ pendingCount }: { pendingCount: number }) {
  const { account, connector, chainId, ENSName } = useWeb3React()
  const connectionType = getConnection(connector).type

  const error = useAppSelector((state) => state.connection.errorByConnectionType[getConnection(connector).type])

  const hasPendingTransactions = !!pendingCount
  const hasSocks = useHasSocks()
  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  if (!chainId) {
    return null
  } else if (error) {
    return (
      <Web3StatusError>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </Web3StatusError>
    )
  } else if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" pending={hasPendingTransactions}>
        {hasPendingTransactions ? (
          <RowBetween>
            <FollowPendingTxPopup>
              <Text>
                <Trans>{pendingCount} Pending</Trans>
              </Text>{' '}
            </FollowPendingTxPopup>
            <Loader stroke="white" />
          </RowBetween>
        ) : (
          <>
            {hasSocks ? <Sock /> : null}
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )}
        {!hasPendingTransactions && <StatusIcon connectionType={connectionType} />}
      </Web3StatusConnected>
    )
  } else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={toggleWalletModal} faded={!account}>
        <Text>
          <Trans>Connect wallet</Trans>
        </Text>
      </Web3StatusConnect>
    )
  }
}
