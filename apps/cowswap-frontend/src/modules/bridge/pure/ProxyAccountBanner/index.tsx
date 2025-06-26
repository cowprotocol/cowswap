import { ReactNode } from 'react'

import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { AddressLink } from 'common/pure/AddressLink'

interface ProxyAccountBannerProps {
  recipient: string
  chainId: number
}

export function ProxyAccountBanner({ recipient, chainId }: ProxyAccountBannerProps): ReactNode {
  return (
    <CollapsibleInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      fontSize={13}
      collapsedContent={
        <div>
          Swap bridged via your proxy account: <AddressLink address={recipient} chainId={chainId} />
        </div>
      }
      expandedContent={
        <div>
          CoW Swap uses a dedicated proxy account, controlled only by you, to ensure smooooth bridging. Confirm the
          recipient address above is <b><AddressLink address={recipient} chainId={chainId} /></b> - that's your
          personal, private proxy account!
        </div>
      }
    />
  )
}