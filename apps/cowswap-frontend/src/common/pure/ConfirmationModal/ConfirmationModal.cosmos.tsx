import { t } from '@lingui/core/macro'

import { ConfirmationModal } from './ConfirmationModal'

const Fixtures = {
  default: () => (
    <ConfirmationModal
      isOpen
      title={t`Turn on Expert mode?`}
      confirmWord={t`confirm`}
      action={t`continue`}
      onDismiss={() => {}}
      onEnable={() => {}}
    />
  ),
}

export default Fixtures
