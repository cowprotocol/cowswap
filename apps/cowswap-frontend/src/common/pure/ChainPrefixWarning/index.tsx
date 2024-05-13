import { BaseChainInfo } from '@cowprotocol/common-const'

import { WarningCard } from '../WarningCard'

type Props = {
  chainPrefixWarning: string
  chainInfo: BaseChainInfo
}
export default function ChainPrefixWarning({ chainPrefixWarning, chainInfo }: Props) {
  return (
    <div style={{ margin: 10 }}>
      <WarningCard>
        <div>
          The recipient address you inputted had the chainPrefix <strong>{chainPrefixWarning}</strong>, but your wallet
          is on {chainInfo.label} which uses the chain prefix <strong>{chainInfo.addressPrefix}</strong>. Please,
          double-check that the recipient address is for the correct network.
        </div>
      </WarningCard>
    </div>
  )
}
