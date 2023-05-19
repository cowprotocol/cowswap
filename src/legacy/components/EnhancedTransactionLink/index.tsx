import { ExplorerLink } from 'components/ExplorerLink'
import { GnosisSafeLink } from 'modules/account/containers/Transaction/StatusDetails'

import { EnhancedTransactionDetails, HashType } from 'state/enhancedTransactions/reducer'
import { useGnosisSafeInfo, useWalletInfo } from 'modules/wallet'

interface Props {
  tx: EnhancedTransactionDetails
}

/**
 * Creates a link to the relevant explorer: Etherscan, GP Explorer or Blockscout, or Gnosis Safe web if its a Gnosis Safe Transaction
 * @param props
 */
export function EnhancedTransactionLink(props: Props) {
  const { tx } = props
  const { chainId } = useWalletInfo()
  const gnosisSafeInfo = useGnosisSafeInfo()

  if (tx.hashType === HashType.GNOSIS_SAFE_TX) {
    const safeTx = tx.safeTransaction

    if (!chainId || !safeTx || !gnosisSafeInfo) {
      return null
    }

    return <GnosisSafeLink chainId={chainId} safeTransaction={safeTx} />
  } else {
    return <ExplorerLink id={tx.hash} type="transaction" />
  }
}
