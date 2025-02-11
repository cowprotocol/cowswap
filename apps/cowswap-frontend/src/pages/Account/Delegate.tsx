import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import DelegateCowIcon from '@cowprotocol/assets/cow-swap/delegate-cow.svg'
import { ButtonPrimary } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { BannerCard, BannerCardContent, BannerCardIcon, BannerCardTitle } from './styled'

export default function Delegate() {
  const delegateUrl = new URL(
    'https://forum.cow.fi/t/recognised-delegates-scheme/2688#p-5670-current-list-of-recognised-delegates-2',
  )
  delegateUrl.searchParams.set('utm_source', 'cowswap')
  delegateUrl.searchParams.set('utm_medium', 'account_page')
  delegateUrl.searchParams.set('utm_campaign', 'delegate')

  return (
    <BannerCard>
      <BannerCardIcon width={159}>
        <SVG src={DelegateCowIcon} title="Delegate" />
      </BannerCardIcon>
      <BannerCardContent>
        <BannerCardTitle>
          Too <i>busy</i> <br />
          to vote?
        </BannerCardTitle>
        <small>
          Delegate your <img src={CowImage} alt="Cow Balance" height="16" width="16" /> (v)COW
        </small>
        <ButtonPrimary as="a" href={delegateUrl.toString()} target="_blank" rel="noopener nofollow">
          Delegate Now ↗
        </ButtonPrimary>
      </BannerCardContent>
    </BannerCard>
  )
}
