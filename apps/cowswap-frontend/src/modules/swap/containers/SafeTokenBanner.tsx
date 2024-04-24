import BRAIN_IMAGE from '@cowprotocol/assets/svg/brain.svg'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { BannerOrientation, ClosableBanner, InlineBanner } from '@cowprotocol/ui'

import { Settings } from 'react-feather'

const SAFE_TOKEN = '0x5afe3855358e112b5647b952709e6165e1c1eeee'
const SAFE_TOKEN_WARNING_STORAGE_KEY = 'safeTokenWarning:v0'

interface SafeTokenBanner {
  sellTokenAddress: string | undefined
  buyTokenAddress: string | undefined
}

export function SafeTokenBanner({ sellTokenAddress, buyTokenAddress }: SafeTokenBanner) {
  const { showSafeTokenWarning } = useFeatureFlags()

  const isSafeTokenSelected =
    sellTokenAddress?.toLowerCase() === SAFE_TOKEN || buyTokenAddress?.toLowerCase() === SAFE_TOKEN

  if (!showSafeTokenWarning || !isSafeTokenSelected) {
    return null
  }

  return ClosableBanner(SAFE_TOKEN_WARNING_STORAGE_KEY, (onClose) => (
    <InlineBanner
      bannerType="success"
      orientation={BannerOrientation.Horizontal}
      customIcon={BRAIN_IMAGE}
      iconSize={70}
      margin={'10px 0 0'}
      onClose={onClose}
    >
      <p>
        The price of <b>SAFE</b> may be volatile during this period!
      </p>
      <p>
        Consider setting a higher slippage tolerance in your trade <strong>settings {<Settings size={12} />}</strong> to
        avoid your order expiring.
      </p>
    </InlineBanner>
  ))
}
