import { ExtLink, BannerCard, BannerCardContent, BannerCardSvg } from './styled'
import CowProtocolImage from 'assets/cow-swap/cowprotocol.svg'

export default function Governance() {
  return (
    <BannerCard>
      <BannerCardContent>
        <b>CoW DAO Governance</b>
        <small>Use your (v)COW balance to vote on important proposals or participate in forum discussions.</small>
        <span>
          {' '}
          <ExtLink href={'https://snapshot.org/#/cow.eth'}>View proposals ↗</ExtLink>
          <ExtLink href={'https://forum.cow.fi/'}>CoW forum ↗</ExtLink>
        </span>
      </BannerCardContent>
      <BannerCardSvg src={CowProtocolImage} description="CoWDAO Governance" />
    </BannerCard>
  )
}
