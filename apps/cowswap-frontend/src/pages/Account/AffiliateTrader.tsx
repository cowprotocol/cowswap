import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useState } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useIsEagerConnectInProgress } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import {
  AffiliateTraderCodeInfo,
  AffiliateTraderLoading,
  AffiliateTraderNextPayout,
  AffiliateTraderOnboard,
  AffiliateTraderStats,
  TraderWalletStatus,
  useAffiliateTraderWallet,
  AffiliateTraderIneligible,
  AffiliateTraderUnsupportedNetwork,
  ThreeColumnGrid,
  PageWrapper,
  UnsupportedNetwork,
  affiliateTraderSavedCodeAtom,
} from 'modules/affiliate'
import { PageTitle } from 'modules/application'

const DISCONNECTED_UI_DELAY_MS = 400

export default function AffiliateTrader(): ReactNode {
  const { i18n } = useLingui()

  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const isEagerConnectInProgress = useIsEagerConnectInProgress()
  const [isDisconnectedUiReady, setIsDisconnectedUiReady] = useState(false)

  useEffect(() => {
    if (walletStatus !== TraderWalletStatus.DISCONNECTED) {
      setIsDisconnectedUiReady(false)
      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsDisconnectedUiReady(true)
    }, DISCONNECTED_UI_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [walletStatus])

  const shouldHideDisconnectedState =
    walletStatus === TraderWalletStatus.DISCONNECTED && (isEagerConnectInProgress || !isDisconnectedUiReady)

  return (
    <>
      {walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <PageWrapper>
        <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

        {walletStatus === TraderWalletStatus.INELIGIBLE ? (
          <AffiliateTraderIneligible />
        ) : walletStatus === TraderWalletStatus.UNSUPPORTED ? (
          <AffiliateTraderUnsupportedNetwork />
        ) : shouldHideDisconnectedState || walletStatus === TraderWalletStatus.PENDING ? (
          <AffiliateTraderLoading />
        ) : !savedCode || walletStatus === TraderWalletStatus.DISCONNECTED ? (
          <AffiliateTraderOnboard />
        ) : (
          <>
            <ThreeColumnGrid>
              <AffiliateTraderCodeInfo />
              <AffiliateTraderStats />
              <AffiliateTraderNextPayout />
            </ThreeColumnGrid>
          </>
        )}
      </PageWrapper>
    </>
  )
}
