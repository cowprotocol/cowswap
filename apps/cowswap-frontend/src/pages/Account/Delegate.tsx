import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import DelegateCowIcon from '@cowprotocol/assets/cow-swap/delegate-cow.svg'
import { ClosableBanner, ButtonPrimary } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import { BANNER_IDS } from 'common/constants/banners'

import { DELEGATE_URL } from './constants'
import { BannerCard, BannerCardIcon, BannerCardContent, BannerCardTitle, CloseButton } from './styled'

interface DelegateProps {
  dismissable?: boolean
  rowOnMobile?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Delegate({ dismissable = false, rowOnMobile }: DelegateProps) {
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const renderContent = (onClose?: () => void) => (
    <BannerCard rowOnMobile={rowOnMobile}>
      {dismissable && onClose && <CloseButton onClick={onClose} />}
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
        <ButtonPrimary as="a" href={DELEGATE_URL} target="_blank" rel="noopener nofollow">
          Delegate Now ↗
        </ButtonPrimary>
      </BannerCardContent>
    </BannerCard>
  )

  return dismissable ? ClosableBanner(BANNER_IDS.DELEGATE, (onClose) => renderContent(onClose)) : renderContent()
}
