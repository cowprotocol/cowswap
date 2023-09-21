import CowProtocolImage from '@cowprotocol/assets/cow-swap/cowprotocol.svg'

import { ExtLink, BannerCard, BannerCardContent, BannerCardSvg, CardActions } from './styled'

export default function Governance() {
  return (
    <BannerCard>
      <BannerCardContent>
        <b>CoW DAO Governance</b>
        <small>Use your (v)COW balance to vote on important proposals or participate in forum discussions.</small>
        <CardActions content="flex-start" justify="flex-start">
          {' '}
          <ExtLink href={'https://snapshot.org/#/cow.eth'}>View proposals ↗</ExtLink>
          <ExtLink href={'https://forum.cow.fi/'}>CoW forum ↗</ExtLink>
        </CardActions>
      </BannerCardContent>
      <BannerCardSvg src={CowProtocolImage} description="CoWDAO Governance" />
    </BannerCard>
  )
}
