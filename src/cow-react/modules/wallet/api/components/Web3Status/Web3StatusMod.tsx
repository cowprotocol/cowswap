// eslint-disable-next-line no-restricted-imports
import { t, Trans } from '@lingui/macro'
import { useWeb3React } from '@web3-react/core'
import { getConnection } from '@cow/modules/wallet/api/utils'
// import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'

import { useHasSocks } from 'hooks/useSocksBalance'
import { useToggleWalletModal } from 'state/application/hooks'
// import { isTransactionRecent, useAllTransactions } from 'state/transactions/hooks'
// import { TransactionDetails } from 'state/transactions/types'
import { shortenAddress } from 'utils'
import StatusIcon from '@cow/modules/wallet/api/components/StatusIcon'
import Loader from 'components/Loader'
import { RowBetween } from 'components/Row'
// import WalletModal from '../WalletModal'
// MOD imports
import FollowPendingTxPopup, { useCloseFollowTxPopupIfNotPendingOrder } from 'components/Popups/FollowPendingTxPopup'
import { NetworkIcon, Text, Web3StatusConnect, Web3StatusConnected, Web3StatusError } from './styled'

/* const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`*/

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
