import { stringify } from 'qs'
import { useWalletInfo } from 'hooks/useWalletInfo'

export const REFERRAL_QUERY_PARAM = 'referral'

export function getReferralLink(walletAddress: string): string {
  const referralParam = { [REFERRAL_QUERY_PARAM]: walletAddress }

  return `${window.location.origin}/#/?${stringify(referralParam)}`
}

/**
 * Returns the referral link with the connected wallet address
 */
export default function useReferralLink(): string | null {
  const { account } = useWalletInfo()

  if (account) {
    return getReferralLink(account)
  }

  return null
}
