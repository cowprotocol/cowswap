import { ReactElement, ReactNode } from 'react'

import { isCowOrder } from '@cowprotocol/common-utils'
import { useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'
import { OrderStatus } from 'legacy/state/orders/actions'
import { useOrder } from 'legacy/state/orders/hooks'

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
  /**
   * Explicitly marks `transactionHash` as a Safe transaction hash (safeTxHash).
   * When omitted, it's inferred from whether the connected wallet is a Safe.
   * On-chain transactions (e.g. approve/wrap/unwrap executed directly, including
   * 1/1 Safe immediate execution) report an Ethereum tx hash, which cannot be used
   * to build a working app.safe.global link, so they must keep the explorer link.
   */
  isSafeTx?: boolean
}

// eslint-disable-next-line complexity
export function TransactionContentWithLink(props: TransactionContentWithLinkProps): ReactNode {
  const { chainId } = useWalletInfo()
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const { transactionHash, orderUid, children, isEthFlow, isSafeTx: isSafeTxProp } = props
  const { status } = useOrder({ id: orderUid, chainId }) || {}

  const isOrder = isCowOrder('transaction', orderUid)
  const isSafeOrder = !!(isSafeWallet && orderUid && !isCowOrder('transaction', orderUid))
  const isSafeTx = isSafeTxProp ?? !!(isSafeWallet && transactionHash && !isCowOrder('transaction', transactionHash))

  const isEthFlowCreating =
    isEthFlow && transactionHash && (status === OrderStatus.CREATING || status === OrderStatus.FAILED || !status)

  const tx = {
    hash: (isOrder && !isEthFlow ? orderUid : isEthFlowCreating ? transactionHash : orderUid) || '',
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
