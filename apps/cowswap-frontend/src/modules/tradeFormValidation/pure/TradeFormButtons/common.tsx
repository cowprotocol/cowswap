import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { CenteredDots } from '@cowprotocol/ui'

import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react/macro'

export const ProxyAccountLoading = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return (
    <>
      <span>
        <Trans>Loading {accountProxyLabel}</Trans>
      </span>
      <CenteredDots smaller />
    </>
  )
}

export const ProxyAccountUnknown = (): ReactNode => {
  const accountProxyLabel = i18n._(ACCOUNT_PROXY_LABEL)
  return <Trans>Couldn't verify {accountProxyLabel}, please try later</Trans>
}
