import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'legacy/components/Button'
import { IntroDescription, BannerExplainer } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimState, useClaimTimeInfo, useClaimLinks } from 'legacy/state/claim/hooks'
import { ClaimStatus } from 'legacy/state/claim/actions'
import { formatDateWithTimezone } from 'utils/time'
import useNetworkName from 'legacy/hooks/useNetworkName'
import { ExternalLink } from 'legacy/theme'
import SVG from 'react-inlinesvg'
import CowProtocolImage from 'legacy/assets/cow-swap/cowprotocol.svg'

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
