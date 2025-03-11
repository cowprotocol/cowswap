import { useMemo } from 'react'

import HAND_SVG from '@cowprotocol/assets/cow-swap/hand.svg'
import { BannerOrientation, InlineBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Link } from 'react-router-dom'

import { parameterizeTradeRoute, useIsHooksTradeType } from 'modules/trade'

import { Routes } from 'common/constants/routes'

import { NetworkBridgeBanner } from '../NetworkBridgeBanner/NetworkBridgeBanner'

export function BottomBanners() {
  const { chainId, account } = useWalletInfo()
  const isHookTradeType = useIsHooksTradeType()
  const cowShedLink = useMemo(
    () =>
      parameterizeTradeRoute(
        {
          chainId: chainId.toString(),
          inputCurrencyId: undefined,
          outputCurrencyId: undefined,
          inputCurrencyAmount: undefined,
          outputCurrencyAmount: undefined,
          orderKind: undefined,
        },
        Routes.COW_SHED,
      ),
    [chainId],
  )

  return (
    <>
      {!isHookTradeType && <NetworkBridgeBanner />}
      {isHookTradeType && !!account && (
        <InlineBanner
          bannerType="information"
          customIcon={HAND_SVG}
          iconSize={24}
          orientation={BannerOrientation.Horizontal}
          backDropBlur
          margin="10px auto auto"
        >
          Funds stuck? <Link to={cowShedLink}>Recover your funds</Link>
        </InlineBanner>
      )}
    </>
  )
}
