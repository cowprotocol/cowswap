import { BundleTxWrapBanner, HighFeeWarning } from 'modules/tradeWidgetAddons'

export function Warnings() {
  return (
    <>
      <HighFeeWarning />
      <BundleTxWrapBanner />
    </>
  )
}
