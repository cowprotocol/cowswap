import { Identicon } from 'modules/wallet'

import { ConfirmationPendingContent } from './ConfirmationPendingContent'

import { GpModal } from '../Modal'

const Fixtures = {
  default: (
    <GpModal onDismiss={console.log} isOpen={true}>
      <ConfirmationPendingContent
        onDismiss={() => alert('dismiss')}
        statusIcon={<Identicon size={56} />}
        title={
          <>
            Reset <strong>USDT</strong> allowance
          </>
        }
        description="Reset USDT allowance to 0 before setting new spending cap"
        operationSubmittedMessage="The token approval is submitted."
        walletAddress="walletAddress"
        operationLabel="token approval"
      />
    </GpModal>
  ),
}

export default Fixtures
