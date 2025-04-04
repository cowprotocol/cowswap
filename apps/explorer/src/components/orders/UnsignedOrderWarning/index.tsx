import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'

export const UnsignedOrderWarning: React.FC = () => {
  return (
    <InlineBanner orientation={BannerOrientation.Horizontal} bannerType={StatusColorVariant.Alert} padding="0">
      An unsigned order is not necessarily placed by the owner's account. Please be cautious.
    </InlineBanner>
  )
}
