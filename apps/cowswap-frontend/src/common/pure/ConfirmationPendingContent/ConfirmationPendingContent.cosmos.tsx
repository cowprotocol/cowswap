import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmationPendingContent } from './ConfirmationPendingContent'

import { CowModal } from '../Modal'

const Fixtures = {
  default: () => (
    <CowModal onDismiss={console.log} isOpen={true}>
      <ConfirmationPendingContent
        onDismiss={() => alert('dismiss')}
        title={
          <Trans>
            Reset <strong>USDT</strong> allowance
          </Trans>
        }
        description={t`Reset USDT allowance to 0 before setting new spending cap`}
        operationLabel={t`token approval`}
      />
    </CowModal>
  ),
}

export default Fixtures
