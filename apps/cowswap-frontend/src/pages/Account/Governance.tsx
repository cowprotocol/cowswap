import { DELEGATE_URL } from './constants'
import { ExtLink, BannerCard, BannerCardContent, CardActions, BannerCardTitle } from './styled'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Governance() {
  return (
    <BannerCard>
      <BannerCardContent fontSize="14px">
        <BannerCardTitle fontSize={24}>CoW DAO Governance</BannerCardTitle>
        <small>Use your (v)COW balance to vote on important proposals or participate in forum discussions.</small>
        <CardActions content="flex-start">
          {' '}
          <ExtLink href={'https://snapshot.org/#/cow.eth'}>View proposals ↗</ExtLink>
          <ExtLink href={'https://forum.cow.fi/'}>CoW forum ↗</ExtLink>
          <ExtLink href={DELEGATE_URL}>Delegate (v)COW ↗</ExtLink>
        </CardActions>
      </BannerCardContent>
    </BannerCard>
  )
}
