import { ReceiptModal as ReceiptModalPure } from '@cow/modules/limitOrders/pure/ReceiptModal'
import { useAtomValue } from 'jotai/utils'
import { receiptAtom } from '@cow/modules/limitOrders/state/limitOrdersReceiptAtom'
import { useCloseReceiptModal } from './hooks'
import { useWeb3React } from '@web3-react/core'
import { supportedChainId } from '@src/custom/utils/supportedChainId'

export function LimitOrdersReceiptModal() {
  const { selected } = useAtomValue(receiptAtom)
  const { chainId: _chainId } = useWeb3React()
  const closeReceiptModal = useCloseReceiptModal()
  const chainId = supportedChainId(_chainId)

  if (!chainId || !selected) {
    return null
  }

  return <ReceiptModalPure chainId={chainId} order={selected} isOpen={!!selected} onDismiss={closeReceiptModal} />
}
