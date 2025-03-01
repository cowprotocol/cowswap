import { DELEGATE_URL } from './constants'
import { ExtLink, BannerCard, BannerCardContent, CardActions, BannerCardTitle } from './styled'

export default function Governance() {
  return (
    <BannerCard>
      <BannerCardContent fontSize="14px">
        <BannerCardTitle fontSize={24}>Chameleon DAO Governance</BannerCardTitle>
        <small>Use your (v)CHM balance to vote on important proposals or participate in forum discussions.</small>
        <CardActions content="flex-start">
          {' '}
          <ExtLink href={'https://snapshot.org/#/cow.eth'}>View proposals ↗</ExtLink>
          <ExtLink href={'https://forum.cow.fi/'}>Chameleon forum ↗</ExtLink>
          <ExtLink href={DELEGATE_URL}>Delegate (v)CHM ↗</ExtLink>
        </CardActions>
      </BannerCardContent>
    </BannerCard>
  )
}
