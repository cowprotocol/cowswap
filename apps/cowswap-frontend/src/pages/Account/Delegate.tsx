import CowImage from '@cowprotocol/assets/cow-swap/cow_token.svg'
import DelegateCowIcon from '@cowprotocol/assets/cow-swap/delegate-cow.svg'
import { ClosableBanner, ButtonPrimary } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
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
        <SVG src={DelegateCowIcon} title={t`Delegate`} />
      </BannerCardIcon>
      <BannerCardContent>
        <BannerCardTitle>
          <Trans>
            Too <i>busy</i> <br />
            to vote?
          </Trans>
        </BannerCardTitle>
        <small>
          <Trans>Delegate your</Trans>
          <img src={CowImage} alt={t`Cow Balance`} height="16" width="16" /> (v)COW
        </small>
        <ButtonPrimary as="a" href={DELEGATE_URL} target="_blank" rel="noopener nofollow">
          <Trans>Delegate Now</Trans> ↗
        </ButtonPrimary>
      </BannerCardContent>
    </BannerCard>
  )

  return dismissable ? (
    <ClosableBanner storageKey={BANNER_IDS.DELEGATE} callback={(onClose) => renderContent(onClose)} />
  ) : (
    renderContent()
  )
}
