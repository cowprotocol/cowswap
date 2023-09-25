import { getSafeWebUrl } from '@cowprotocol/core'
import { ExternalLink } from '@cowprotocol/ui'

export function SafeWalletLink(props: {
  chainId: number
  safeTransaction?: { safe: string; safeTxHash: string }
}): JSX.Element | null {
  const { chainId, safeTransaction } = props

  if (!safeTransaction) {
    return null
  }

  const { safe, safeTxHash } = safeTransaction
  const safeUrl = getSafeWebUrl(chainId, safe, safeTxHash)

  // Only show the link to the safe, if we have the "safeUrl"
  if (safeUrl === null) {
    return null
  }

  return <ExternalLink href={safeUrl}>View on Safe ↗</ExternalLink>
}
