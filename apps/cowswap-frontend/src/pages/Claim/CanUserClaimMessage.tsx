import CowProtocolImage from '@cowprotocol/assets/cow-swap/cowprotocol.svg'
import { useNetworkName } from '@cowprotocol/common-hooks'
import { formatDateWithTimezone } from '@cowprotocol/common-utils'
import { ButtonSecondary } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'

import { ClaimStatus } from 'legacy/state/claim/actions'
import { useClaimState, useClaimTimeInfo, useClaimLinks } from 'legacy/state/claim/hooks'
import { ClaimCommonTypes } from 'legacy/state/claim/types'

import { IntroDescription, BannerExplainer } from './styled'

type ClaimIntroductionProps = Pick<
  ClaimCommonTypes,
  'hasClaims' | 'isClaimed' | 'handleChangeAccount' | 'isAirdropOnly'
>

export default function CanUserClaimMessage({
  hasClaims,
  isClaimed,
  isAirdropOnly,
  handleChangeAccount,
}: ClaimIntroductionProps) {
  const { activeClaimAccount, claimStatus } = useClaimState()
  const network = useNetworkName()

  const claimLinks = useClaimLinks()

  const { airdropDeadline } = useClaimTimeInfo()

  // only show when active claim account
  if (!activeClaimAccount || claimStatus !== ClaimStatus.DEFAULT) return null

  if (isAirdropOnly && hasClaims) {
    return (
      <>
        <IntroDescription>
          <p>
            <Trans>
              Thank you for being a supporter of CoW Swap and the CoW protocol. As an important member of the CoW Swap
              Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
              <i>{formatDateWithTimezone(airdropDeadline)}.</i>
            </Trans>
          </p>
        </IntroDescription>
        <ExternalLink href={claimLinks.vCowPost}>
          <BannerExplainer>
            <SVG src={CowProtocolImage} description="Questions? Read More." />
            <span>
              <b>vCOW the governance token.</b>
              <small>Find out more about the protocol ↗</small>
            </span>
          </BannerExplainer>
        </ExternalLink>
      </>
    )
  }

  if (!hasClaims || isClaimed) {
    return (
      <IntroDescription center>
        <Trans>
          {isClaimed ? (
            ''
          ) : (
            <>
              Unfortunately this account is not eligible for any vCOW claims in {network}. <br />
            </>
          )}
          <ButtonSecondary onClick={handleChangeAccount} padding="0">
            Try another account
          </ButtonSecondary>{' '}
          or try in a different network.
        </Trans>
      </IntroDescription>
    )
  }

  return null
}
