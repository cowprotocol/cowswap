import { ReactNode } from 'react'

import { i18n } from '@lingui/core'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ThreeDots } from 'common/pure/ThreeDots/ThreeDots.pure'

export function CaptchaPendingLoading(): ReactNode {
  return <ThreeDots centered aria-label={t`Loading captcha`} />
}

export const ProxyAccountLoading = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return (
    <span>
      <Trans>Loading {accountProxyLabel}</Trans>
      <ThreeDots />
    </span>
  )
}

export const ProxyAccountUnknown = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return <Trans>Couldn't verify {accountProxyLabel}, please try later</Trans>
}

export function WalletCapabilitiesLoading(): ReactNode {
  return <ThreeDots centered aria-label={t`Loading wallet capabilities`} />
}
