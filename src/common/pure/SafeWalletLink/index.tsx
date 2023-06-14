import { ExternalLink } from 'legacy/theme'

import { getSafeWebUrl } from 'api/gnosisSafe'

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

  return <ExternalLink href={safeUrl}>View Safe ↗</ExternalLink>
}
