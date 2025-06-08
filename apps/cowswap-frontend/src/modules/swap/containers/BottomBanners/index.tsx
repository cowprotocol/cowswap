import { useMemo } from 'react'

import HAND_SVG from '@cowprotocol/assets/cow-swap/hand.svg'
import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Link } from 'react-router'
import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

import { parameterizeTradeRoute, useIsHooksTradeType } from 'modules/trade'

import { Routes } from 'common/constants/routes'

import { NetworkBridgeBanner } from '../NetworkBridgeBanner/NetworkBridgeBanner'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
    <Wrapper>
      {!isHookTradeType && <NetworkBridgeBanner />}
      {isHookTradeType && !!account && (
        <InlineBanner
          bannerType={StatusColorVariant.Info}
          customIcon={HAND_SVG}
          iconSize={24}
          orientation={BannerOrientation.Horizontal}
          backDropBlur
          margin="10px auto auto"
        >
          Funds stuck? <Link to={cowShedLink}>Recover your funds</Link>
        </InlineBanner>
      )}
    </Wrapper>
  )
}
