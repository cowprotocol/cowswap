import { ReactNode, useMemo } from 'react'

import { getExplorerAddressLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { HowItWorks } from './HowItWorks'
import { AffiliateInlineLink } from './shared'

export function TraderIneligible(): ReactNode {
  const { account } = useWalletInfo()

  const explorerLink = useMemo(
    () => (!account ? null : getExplorerAddressLink(SupportedChainId.MAINNET, account)),
    [account],
  )

  const title = <Trans>This wallet has already traded on CoW Swap.</Trans>

  return (
    <>
      {explorerLink ? (
        <>
          <AffiliateInlineLink href={explorerLink} target="_blank">
            {title}
          </AffiliateInlineLink>
        </>
      ) : (
        title
      )}
      <br /> <Trans>Referral rewards are for new wallets only.</Trans> <HowItWorks />
    </>
  )
}
