import { ConfirmationPendingContent } from './ConfirmationPendingContent'

const Fixtures = {
  default: (
    <ConfirmationPendingContent
      onDismiss={() => alert('dismiss')}
      statusIcon={<></>}
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
  ),
}

export default Fixtures
