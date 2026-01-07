import { ReactNode } from 'react'

import HAND_SVG from '@cowprotocol/assets/cow-swap/hand.svg'
import { BannerOrientation, InlineBanner, StatusColorVariant } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'
import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

import { getProxyAccountUrl } from 'modules/accountProxy/utils/getProxyAccountUrl'
import { useIsHooksTradeType } from 'modules/trade'

import { NetworkBridgeBanner } from '../NetworkBridgeBanner/NetworkBridgeBanner'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
`

export function BottomBanners(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isHookTradeType = useIsHooksTradeType()
  const accountProxyUrl = getProxyAccountUrl(chainId, 'hooks')

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
          <Trans>
            Funds stuck? <Link to={accountProxyUrl}>Recover your funds</Link>
          </Trans>
        </InlineBanner>
      )}
    </Wrapper>
  )
}
