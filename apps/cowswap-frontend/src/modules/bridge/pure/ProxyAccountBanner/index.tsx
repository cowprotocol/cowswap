import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import { getProxyAccountUrl } from 'modules/accountProxy'

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
          <Trans>
            Swap bridged via your {ACCOUNT_PROXY_LABEL}: <AddressLink address={recipient} chainId={chainId} />
          </Trans>
        </div>
      }
      expandedContent={
        <div>
          <Trans>
            CoW Swap uses a dedicated {ACCOUNT_PROXY_LABEL}, controlled only by you, to ensure smooooth bridging.
            Confirm the recipient address above is <AddressLink address={recipient} chainId={chainId} />
          </Trans>
          <br />
          <br />
          <Link to={getProxyAccountUrl(chainId)} target="_blank">
            <b style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              <Trans>View your private {ACCOUNT_PROXY_LABEL}</Trans> +{' '}
            </b>
          </Link>
        </div>
      }
    />
  )
}
