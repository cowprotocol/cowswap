import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { ExplorerLink } from 'legacy/components/ExplorerLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import { SafeWalletLink } from 'common/pure/SafeWalletLink'

interface Props {
  chainId: SupportedChainId
  tx: {
    hash: string
    hashType: HashType
    safeTransaction?: { safe: string; safeTxHash: string }
  }
}

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout, or Gnosis Safe web if its a Gnosis Safe Transaction
 * @param props
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EnhancedTransactionLink(props: Props) {
  const { tx, chainId } = props

  if (tx.hashType === HashType.GNOSIS_SAFE_TX) {
    const safeTx = tx.safeTransaction

    if (!safeTx) return null

    return <SafeWalletLink chainId={chainId} safeTransaction={safeTx} />
  } else {
    return <ExplorerLink id={tx.hash} type="transaction" />
  }
}
