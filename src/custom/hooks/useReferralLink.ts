import { useWalletInfo } from 'hooks/useWalletInfo'

export const REFERRAL_QUERY_PARAM = 'referral'

export type ReferralLink = {
  link: string
  prefix: string
  address: string
}

export function getReferralLink(walletAddress: string): ReferralLink {
  const prefix = `${window.location.origin}/#/?${REFERRAL_QUERY_PARAM}=`

  return {
    link: prefix + walletAddress,
    prefix,
    address: walletAddress,
  }
}

/**
 * Returns the referral link with the connected wallet address
 */
export default function useReferralLink(): ReferralLink | null {
  const { account } = useWalletInfo()

  if (account) {
    return getReferralLink(account)
  }

  return null
}
