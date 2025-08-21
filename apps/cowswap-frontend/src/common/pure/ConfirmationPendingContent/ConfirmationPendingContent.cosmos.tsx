import { t } from '@lingui/core/macro'

import { ConfirmationPendingContent } from './ConfirmationPendingContent'

import { CowModal } from '../Modal'

const Fixtures = {
  default: () => (
    <CowModal onDismiss={console.log} isOpen={true}>
      <ConfirmationPendingContent
        onDismiss={() => alert('dismiss')}
        title={
          <>
            Reset <strong>USDT</strong> allowance
          </>
        }
        description={t`Reset USDT allowance to 0 before setting new spending cap`}
        operationLabel={t`token approval`}
      />
    </CowModal>
  ),
}

export default Fixtures
