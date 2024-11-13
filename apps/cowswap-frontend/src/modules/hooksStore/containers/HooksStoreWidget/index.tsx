import { useCallback, useEffect, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { SwapWidget } from 'modules/swap'
import { useIsSellNative, useIsWrapOrUnwrap } from 'modules/trade'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { HooksTopActions, RescueFundsToggle, TradeWidgetWrapper } from './styled'

import { useSetRecipientOverride } from '../../hooks/useSetRecipientOverride'
import { useSetupHooksStoreOrderParams } from '../../hooks/useSetupHooksStoreOrderParams'
import { IframeDappsManifestUpdater } from '../../updaters/iframeDappsManifestUpdater'
import { HookRegistryList } from '../HookRegistryList'
import { PostHookButton } from '../PostHookButton'
import { PreHookButton } from '../PreHookButton'
import { RescueFundsFromProxy } from '../RescueFundsFromProxy'

type HookPosition = 'pre' | 'post'

console.log(ICON_HOOK)

export function HooksStoreWidget() {
  const { account, chainId } = useWalletInfo()
  const [isRescueWidgetOpen, setRescueWidgetOpen] = useState<boolean>(false)
  const [selectedHookPosition, setSelectedHookPosition] = useState<HookPosition | null>(null)
  const [hookToEdit, setHookToEdit] = useState<string | undefined>(undefined)

  const isNativeSell = useIsSellNative()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const walletType = useIsSmartContractWallet()
    ? HookDappWalletCompatibility.SMART_CONTRACT
    : HookDappWalletCompatibility.EOA

  const onDismiss = useCallback(() => {
    setSelectedHookPosition(null)
    setHookToEdit(undefined)
  }, [])

  const onPreHookEdit = useCallback((uuid: string) => {
    setSelectedHookPosition('pre')
    setHookToEdit(uuid)
  }, [])

  const onPostHookEdit = useCallback((uuid: string) => {
    setSelectedHookPosition('post')
    setHookToEdit(uuid)
  }, [])

  useEffect(() => {
    if (!account) {
      setRescueWidgetOpen(false)
    }
  }, [account])

  // Close all screens on network changes (including unsupported chain case)
  useEffect(() => {
    setRescueWidgetOpen(false)
    onDismiss()
  }, [chainId, isChainIdUnsupported, onDismiss])

  const defaultPartiallyFillable = true
  useSetupHooksStoreOrderParams({ defaultPartiallyFillable })
  useSetRecipientOverride()

  const isHookSelectionOpen = !!(selectedHookPosition || hookToEdit)
  const hideSwapWidget = isHookSelectionOpen || isRescueWidgetOpen

  const shouldNotUseHooks = isNativeSell || isChainIdUnsupported

  const HooksTop = (
    <HooksTopActions>
      <RescueFundsToggle onClick={() => setRescueWidgetOpen(true)}>Rescue funds</RescueFundsToggle>
    </HooksTopActions>
  )

  const TopContent = shouldNotUseHooks ? (
    HooksTop
  ) : isWrapOrUnwrap ? (
    HooksTop
  ) : (
    <>
      {!isRescueWidgetOpen && account && HooksTop}
      <DismissableInlineBanner
        orientation={BannerOrientation.Horizontal}
        customIcon={ICON_HOOK}
        iconSize={36}
        bannerId="hooks-store-banner-tradeContainer"
      >
        <p>
          With hooks you can add specific actions <b>before</b> and <b>after</b> your swap.{' '}
          <a
            href="https://blog.cow.fi/cow-hooks-you-are-in-control-480ccb40044a"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more.
          </a>
        </p>
      </DismissableInlineBanner>
      <PreHookButton onOpen={() => setSelectedHookPosition('pre')} onEditHook={onPreHookEdit} />
    </>
  )

  const BottomContent = shouldNotUseHooks ? null : (
    <PostHookButton onOpen={() => setSelectedHookPosition('post')} onEditHook={onPostHookEdit} />
  )

  return (
    <>
      <TradeWidgetWrapper visible$={!hideSwapWidget}>
        <SwapWidget
          topContent={TopContent}
          bottomContent={BottomContent}
          defaultPartiallyFillable={defaultPartiallyFillable}
        />
      </TradeWidgetWrapper>
      <IframeDappsManifestUpdater />
      {isHookSelectionOpen && (
        <HookRegistryList
          walletType={walletType}
          onDismiss={onDismiss}
          hookToEdit={hookToEdit}
          isPreHook={selectedHookPosition === 'pre'}
        />
      )}
      {isRescueWidgetOpen && <RescueFundsFromProxy onDismiss={() => setRescueWidgetOpen(false)} />}
    </>
  )
}
