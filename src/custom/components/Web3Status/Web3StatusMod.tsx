// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getConnection } from 'connection/utils'
import { darken } from 'polished'
// import { useMemo } from 'react'
import { Activity } from 'react-feather'
import { useAppSelector } from 'state/hooks'
import styled, { css } from 'styled-components/macro'

import { useHasSocks } from 'hooks/useSocksBalance'
import { useToggleWalletModal } from 'state/application/hooks'
// import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
// import { TransactionDetails } from 'state/transactions/types'
import { shortenAddress } from 'utils'
// import { ButtonSecondary } from 'components/Button'
import StatusIcon from 'components/Identicon/StatusIcon'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'
// import WalletModal from '../WalletModal'

// MOD imports
import FollowPendingTxPopup, { useCloseFollowTxPopupIfNotPendingOrder } from 'components/Popups/FollowPendingTxPopup'
import { ButtonSecondary } from 'components/Button'

/* const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`*/

// mod
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

// we want the latest one to come first, so return negative if a is after b
// function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
//   return b.addedTime - a.addedTime
// }

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

  // const allTransactions = useAllTransactions()

  // const sortedRecentTransactions = useMemo(() => {
  //   const txs = Object.values(allTransactions)
  //   return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  // }, [allTransactions])

  // const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)

  // const hasPendingTransactions = !!pending.length
  const hasPendingTransactions = !!pendingCount
  const hasSocks = useHasSocks()
  const toggleWalletModal = useToggleWalletModal()
  useCloseFollowTxPopupIfNotPendingOrder()

  if (!chainId) {
    return null
  } else if (error) {
    return (
      <Web3StatusError /* onClick={toggleWalletModal} */>
        <NetworkIcon />
        <Text>
          <Trans>Error</Trans>
        </Text>
      </Web3StatusError>
    )
  } else if (account) {
    return (
      <Web3StatusConnected
        id="web3-status-connected"
        // onClick={toggleWalletModal}
        pending={hasPendingTransactions}
      >
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
          {/* <Trans>Connect to a wallet</Trans> */}
          <Trans>Connect wallet</Trans> {/* MOD */}
        </Text>
      </Web3StatusConnect>
    )
  }
}

/* export default function Web3Status() {
  const { ENSName } = useWeb3React()

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  return (
    <>
      <Web3StatusInner />
        <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
} */
