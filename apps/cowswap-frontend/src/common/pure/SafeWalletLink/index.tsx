import { getSafeWebUrl } from '@cowswap/core'
import { ExternalLink } from '@cowswap/ui'

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
