import { ReactElement } from 'react'

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
  children?: ReactElement
  isEthFlow?: boolean
}

// TODO: Add proper return type annotation
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
export function TransactionContentWithLink(props: TransactionContentWithLinkProps) {
  const { chainId } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const { transactionHash, orderUid, children, isEthFlow } = props

  const isOrder = isCowOrder('transaction', orderUid)
  const isSafeOrder = !!(isSafeWallet && orderUid && !isCowOrder('transaction', orderUid))
  const isSafeTx = !!(isSafeWallet && transactionHash && !isCowOrder('transaction', transactionHash))

  const tx = {
    hash: (isOrder && !isEthFlow ? orderUid : transactionHash || orderUid) || '',
    hashType: (isSafeOrder || isSafeTx) && !isOrder ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
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
