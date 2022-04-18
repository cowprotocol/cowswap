import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { CheckCircle, Triangle } from 'react-feather'
import styled from 'styled-components/macro'

import { useAllTransactions } from 'state/enhancedTransactions/hooks'
import { ExternalLink } from 'theme'
// import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import Loader from 'components/Loader'
import { RowFixed } from 'components/Row'
// import { TransactionSummary } from './TransactionSummary'

// MOD imports
import { getEtherscanLink } from 'utils'

export const TransactionStatusText = styled.div`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  :hover {
    text-decoration: underline;
  }
`

export const TransactionState = styled(ExternalLink)<{ pending: boolean; success?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0rem;
  font-weight: 500;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.primary1};
`

export const IconWrapper = styled.div<{ pending: boolean; success?: boolean }>`
  color: ${({ pending, success, theme }) => (pending ? theme.primary1 : success ? theme.green1 : theme.red1)};
`

export default function Transaction({ hash }: { hash: string }) {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const tx = allTransactions?.[hash]
  const summary = tx?.summary
  const pending = !tx?.receipt
  const success = !pending && tx && (tx.receipt?.status === 1 || typeof tx.receipt?.status === 'undefined')

  if (!chainId) return null

  return (
    <div>
      <TransactionState
        // href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}
        href={getEtherscanLink(chainId, hash, 'transaction')}
        pending={pending}
        success={success}
      >
        <RowFixed>
          <TransactionStatusText>{summary ?? hash} ↗</TransactionStatusText>
        </RowFixed>
        <IconWrapper pending={pending} success={success}>
          {pending ? <Loader /> : success ? <CheckCircle size="16" /> : <Triangle size="16" />}
        </IconWrapper>
      </TransactionState>
    </div>
  )
}
