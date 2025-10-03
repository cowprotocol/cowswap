import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'react-router'

import { getProxyAccountUrl } from 'modules/accountProxy'

import { AddressLink } from 'common/pure/AddressLink'

interface ProxyAccountBannerProps {
  recipient: string
  chainId: number
}

export function ProxyAccountBanner({ recipient, chainId }: ProxyAccountBannerProps): ReactNode {
  const { i18n } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  return (
    <CollapsibleInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      fontSize={13}
      collapsedContent={
        <div>
          <Trans>
            Swap bridged via your {accountProxyLabelString}: <AddressLink address={recipient} chainId={chainId} />
          </Trans>
        </div>
      }
      expandedContent={
        <div>
          <Trans>
            CoW Swap uses a dedicated {accountProxyLabelString}, controlled only by you, to ensure smooooth bridging.
            Confirm the recipient address above is <AddressLink address={recipient} chainId={chainId} />
          </Trans>
          <br />
          <br />
          <Link to={getProxyAccountUrl(chainId)} target="_blank">
            <b style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              <Trans>View your private {accountProxyLabelString}</Trans> +{' '}
            </b>
          </Link>
        </div>
      }
    />
  )
}
