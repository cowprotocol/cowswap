import { Token } from '@uniswap/sdk-core'

import Modal from 'common/pure/Modal'
import { ImportToken } from 'legacy/components/SearchModal/ImportToken'

export default function TokenWarningModal({
  isOpen,
  tokens,
  onConfirm,
  onDismiss,
}: {
  isOpen: boolean
  tokens: Token[]
  onConfirm: () => void
  onDismiss: () => void
}) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={100}>
      <ImportToken tokens={tokens} handleCurrencySelect={onConfirm} />
    </Modal>
  )
}
