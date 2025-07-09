import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

export const UnsignedOrderWarning: React.FC = () => {
  return (
    <InlineBanner
      orientation={BannerOrientation.Horizontal}
      bannerType={StatusColorVariant.Alert}
      noBackground
      padding="0"
      breakWord
    >
      <p>An unsigned order is not necessarily placed by the owner's account. Please be cautious.</p>
    </InlineBanner>
  )
}
