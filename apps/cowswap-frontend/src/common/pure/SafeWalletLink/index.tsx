import { ReactElement } from 'react'

import { getSafeWebUrl } from '@cowprotocol/core'
import { ButtonPrimary, ExternalLink } from '@cowprotocol/ui'

export function SafeWalletLink(props: {
  chainId: number
  safeTransaction?: { safe: string; safeTxHash: string }
  asButton?: boolean
}): ReactElement | null {
  const { chainId, safeTransaction, asButton } = props

  if (!safeTransaction) {
    return null
  }

  const { safe, safeTxHash } = safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe, safeTxHash)

  // Only show the link to the safe, if we have the "safeUrl"
  if (safeUrl === null) {
    return null
  }

  const linkProps = {
    href: safeUrl,
    ...(asButton && { target: '_blank', rel: 'noopener noreferrer' }),
  }

  const LinkComponent = asButton ? ButtonPrimary : ExternalLink

  return (
    <LinkComponent as={asButton ? 'a' : undefined} {...linkProps}>
      View on Safe ↗
    </LinkComponent>
  )
}
