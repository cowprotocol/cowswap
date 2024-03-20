import { isCowOrder } from '@cowprotocol/common-utils'
import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

const OrderLinkWrapper = styled.div`
  margin-top: 15px;
  text-decoration: underline;

  &:hover,
  &:hover a {
    text-decoration: none !important;
  }
`

interface TransactionContentWithLinkProps {
  transactionHash: string | undefined
  orderUid?: string
  children?: JSX.Element
}
export function TransactionContentWithLink(props: TransactionContentWithLinkProps) {
  const { chainId } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const { transactionHash, orderUid, children } = props

  const tx = {
    hash: transactionHash || orderUid || '',
    hashType:
      isSafeWallet && transactionHash && !isCowOrder('transaction', transactionHash)
        ? HashType.GNOSIS_SAFE_TX
        : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: transactionHash || '',
      safe: safeInfo?.address || '',
    },
  }

  return (
    <>
      {children}
      <OrderLinkWrapper>
        <EnhancedTransactionLink chainId={chainId} tx={tx} />
      </OrderLinkWrapper>
    </>
  )
}
