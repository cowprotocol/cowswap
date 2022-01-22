import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'components/Button'
import { ExternalLink } from 'theme'
import { IntroDescription } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimState, useClaimTimeInfo } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'
import { formatDateWithTimezone } from 'utils/time'
import { COW_LINKS } from 'pages/Claim/index'

type ClaimIntroductionProps = Pick<ClaimCommonTypes, 'hasClaims' | 'handleChangeAccount'> & {
  isAirdropOnly: boolean
}

export default function CanUserClaimMessage({ hasClaims, isAirdropOnly, handleChangeAccount }: ClaimIntroductionProps) {
  const { activeClaimAccount, claimStatus } = useClaimState()

  const { airdropDeadline } = useClaimTimeInfo()

  // only show when active claim account
  if (!activeClaimAccount || claimStatus !== ClaimStatus.DEFAULT) return null

  if (isAirdropOnly && hasClaims) {
    return (
      <IntroDescription>
        <p>
          <Trans>
            Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
            Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
            <i>{formatDateWithTimezone(airdropDeadline)}</i>
            <ExternalLink href={COW_LINKS.vCowPost}>Read more about vCOW</ExternalLink>
          </Trans>
        </p>
      </IntroDescription>
    )
  }

  if (!hasClaims) {
    return (
      <IntroDescription center>
        <Trans>
          Unfortunately this account is not eligible for any vCOW claims. <br />
          <ButtonSecondary onClick={handleChangeAccount} padding="0">
            Try another account
          </ButtonSecondary>{' '}
          or <ExternalLink href={COW_LINKS.vCowPost}>read more about vCOW</ExternalLink>
        </Trans>
      </IntroDescription>
    )
  }

  return null
}
