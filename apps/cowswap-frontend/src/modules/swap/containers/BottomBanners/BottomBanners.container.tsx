import { ReactNode } from 'react'

import HAND_SVG from '@cowprotocol/assets/cow-swap/hand.svg'
import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'

import { getProxyAccountUrl } from 'modules/accountProxy/utils/getProxyAccountUrl'
import { useIsHooksTradeType } from 'modules/trade'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import { Wrapper } from './BottomBanners.styled'

import { DeprecatedNetworkBanner } from '../DeprecatedNetworkBanner/DeprecatedNetworkBanner.container'
import { NetworkBridgeBanner } from '../NetworkBridgeBanner/NetworkBridgeBanner.container'

export function BottomBanners(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isHookTradeType = useIsHooksTradeType()
  const accountProxyUrl = getProxyAccountUrl(chainId, 'hooks')

  let bannerNode: ReactNode | null = null

  if (isProviderNetworkDeprecated) {
    bannerNode = <DeprecatedNetworkBanner />
  } else if (isHookTradeType && account) {
    bannerNode = (
      <InlineBanner
        bannerType={StatusColorVariant.Info}
        customIcon={HAND_SVG}
        iconSize={24}
        orientation={BannerOrientation.Horizontal}
        backDropBlur
        margin="10px auto auto"
      >
        <Trans>
          Funds stuck? <Link to={accountProxyUrl}>Recover your funds</Link>
        </Trans>
      </InlineBanner>
    )
  } else {
    bannerNode = <NetworkBridgeBanner />
  }

  return <Wrapper>{bannerNode}</Wrapper>
}
