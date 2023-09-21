import { Identicon } from '@cowprotocol/wallet'

import { ConfirmationPendingContent } from './ConfirmationPendingContent'

import { CowModal } from '../Modal'

const Fixtures = {
  default: (
    <CowModal onDismiss={console.log} isOpen={true}>
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
    </CowModal>
  ),
}

export default Fixtures
