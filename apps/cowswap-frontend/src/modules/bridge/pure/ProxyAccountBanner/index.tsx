import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { BannerOrientation, CollapsibleInlineBanner, StatusColorVariant } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { Link } from 'react-router'

import { getProxyAccountUrl } from 'modules/accountProxy/utils/getProxyAccountUrl'

import { AddressLink } from 'common/pure/AddressLink'

interface ProxyAccountBannerProps {
  recipient: string
  chainId: number
  bridgeReceiverOverride: string | null
}

export function ProxyAccountBanner({ recipient, bridgeReceiverOverride, chainId }: ProxyAccountBannerProps): ReactNode {
  const isRecipientOverridden = recipient === bridgeReceiverOverride
  const { i18n, t } = useLingui()
  const accountProxyLabelString = i18n._(ACCOUNT_PROXY_LABEL)

  return (
    <CollapsibleInlineBanner
      bannerType={StatusColorVariant.Info}
      orientation={BannerOrientation.Horizontal}
      fontSize={13}
      collapsedContent={
        <div>
          {isRecipientOverridden
            ? t`Modified recipient address to`
            : t`Swap bridged via your` + ` ` + accountProxyLabelString}
          : <AddressLink address={recipient} chainId={chainId} />
        </div>
      }
      expandedContent={
        isRecipientOverridden ? (
          <div>
            <Trans>
              The bridge provider modified the recipient address to{' '}
              <AddressLink address={recipient} chainId={chainId} />. This ensure smooooth bridging.
            </Trans>
            <br />
            <br />
            <Trans>Only proceed if you trust this provider.</Trans>
          </div>
        ) : (
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
        )
      }
    />
  )
}
