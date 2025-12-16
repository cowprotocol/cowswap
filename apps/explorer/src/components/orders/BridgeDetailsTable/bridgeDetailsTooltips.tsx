import { ACCOUNT_PROXY_LABEL_EXPLORER } from '@cowprotocol/common-const'

import { AccountProxyLink } from '../shared/AccountProxyLink'

export const BridgeDetailsTooltips = {
  transactionHash: 'The transaction hash or provider-specific explorer link for the bridge operation.',
  status: 'The current status of the bridge operation.',
  amounts: 'The amount of tokens sent to the bridge and the expected amount to be received.',
  youReceived: 'The actual amount of tokens received from the bridge operation. Unknown until the bridge is completed.',
  costsAndFees: 'Estimated or actual costs and protocol fees for the bridge operation.',
  bridgingTime: 'Expected time for the bridge operation to complete.',
  maxSlippage: 'The maximum allowed slippage for the bridge in percentage.',
  provider: 'The bridging solution provider.',
  accountFromProxy: (
    <span>
      The <AccountProxyLink>{ACCOUNT_PROXY_LABEL_EXPLORER}</AccountProxyLink> address which will/did receive bought
      amount of the Swap before the bridge is initiated.
    </span>
  ),
  accountOrderSigner: 'The account address which signed the order.',
  receiverAddress: 'The account address to which the tokens are bridged on the destination chain.',
}
