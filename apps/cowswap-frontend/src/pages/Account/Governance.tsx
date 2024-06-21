import { ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { ExtLink, BannerCard, BannerCardContent, BannerCardIcon, CardActions } from './styled'

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
      <BannerCardIcon>
        <ProductLogo variant={ProductVariant.CowSwap} height={76} logoIconOnly />
      </BannerCardIcon>
    </BannerCard>
  )
}
