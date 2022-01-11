import { Trans } from '@lingui/macro'
import { ButtonSecondary } from 'components/Button'
import { ExternalLink } from 'theme'
import { IntroDescription } from './styled'
import { ClaimCommonTypes } from './types'
import { useClaimDispatchers, useClaimState } from 'state/claim/hooks'
import { ClaimStatus } from 'state/claim/actions'

type ClaimIntroductionProps = Pick<ClaimCommonTypes, 'hasClaims'> & {
  isAirdropOnly: boolean
}

export default function CanUserClaimMessage({ hasClaims, isAirdropOnly }: ClaimIntroductionProps) {
  const { activeClaimAccount, claimStatus } = useClaimState()
  const { setActiveClaimAccount } = useClaimDispatchers()

  // only show when active claim account
  if (!activeClaimAccount || claimStatus !== ClaimStatus.DEFAULT) return null

  if (isAirdropOnly && hasClaims) {
    return (
      <IntroDescription>
        <p>
          <Trans>
            Thank you for being a supporter of CowSwap and the CoW protocol. As an important member of the CowSwap
            Community you may claim vCOW to be used for voting and governance. You can claim your tokens until{' '}
            <i>[XX-XX-XXXX - XX:XX GMT]</i>
            <ExternalLink href="https://cow.fi/">Read more about vCOW</ExternalLink>
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
          <ButtonSecondary onClick={() => setActiveClaimAccount('')} padding="0">
            Try another account
          </ButtonSecondary>{' '}
          or <ExternalLink href="https://cow.fi/">read more about vCOW</ExternalLink>
        </Trans>
      </IntroDescription>
    )
  }

  return null
}
