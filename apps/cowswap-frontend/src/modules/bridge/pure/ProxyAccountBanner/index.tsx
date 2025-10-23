import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Link } from 'react-router'

import { getProxyAccountUrl } from 'modules/accountProxy'

import { AddressLink } from 'common/pure/AddressLink'

interface ProxyAccountBannerProps {
  recipient: string
  chainId: number
  bridgeReceiverOverride: string | null
}

export function ProxyAccountBanner({ recipient, bridgeReceiverOverride, chainId }: ProxyAccountBannerProps): ReactNode {
  const isRecipientOverridden = recipient === bridgeReceiverOverride
  return (
    <CollapsibleInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      fontSize={13}
      collapsedContent={
        <div>
          {isRecipientOverridden ? 'Modified recipient address to' : 'Swap bridged via your ' + ACCOUNT_PROXY_LABEL}
          : <AddressLink address={recipient} chainId={chainId} />
        </div>
      }
      expandedContent={
        isRecipientOverridden ? (
          <div>
            The bridge provider modified the recipient address to <AddressLink address={recipient} chainId={chainId} />.
            This ensure smooooth bridging.
            <br />
            <br />
            Only proceed if you trust this provider.
          </div>
        ) : (
          <div>
            CoW Swap uses a dedicated {ACCOUNT_PROXY_LABEL}, controlled only by you, to ensure smooooth bridging.
            Confirm the recipient address above is <AddressLink address={recipient} chainId={chainId} />
            <br />
            <br />
            <Link to={getProxyAccountUrl(chainId)} target="_blank">
              <b style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                View your private {ACCOUNT_PROXY_LABEL} +{' '}
              </b>
            </Link>
          </div>
        )
      }
    />
  )
}
