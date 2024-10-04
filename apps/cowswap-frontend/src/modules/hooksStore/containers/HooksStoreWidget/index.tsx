import { useCallback, useEffect, useState } from 'react'

import ICON_HOOK from '@cowprotocol/assets/cow-swap/hook.svg'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { SwapWidget } from 'modules/swap'
import { useIsSellNative } from 'modules/trade'

import { RescueFundsToggle, TradeWidgetWrapper } from './styled'

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
  const { account } = useWalletInfo()
  const [isRescueWidgetOpen, setRescueWidgetOpen] = useState<boolean>(false)
  const [selectedHookPosition, setSelectedHookPosition] = useState<HookPosition | null>(null)
  const [hookToEdit, setHookToEdit] = useState<string | undefined>(undefined)

  const isNativeSell = useIsSellNative()

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

  useSetupHooksStoreOrderParams()
  useSetRecipientOverride()

  const isHookSelectionOpen = !!(selectedHookPosition || hookToEdit)
  const hideSwapWidget = isHookSelectionOpen || isRescueWidgetOpen

  const shouldNotUseHooks = isNativeSell

  const TopContent = shouldNotUseHooks ? null : (
    <>
      {!isRescueWidgetOpen && account && (
        <RescueFundsToggle onClick={() => setRescueWidgetOpen(true)}>Problems receiving funds?</RescueFundsToggle>
      )}
      <DismissableInlineBanner
        orientation={BannerOrientation.Horizontal}
        customIcon={ICON_HOOK}
        iconSize={36}
        bannerId="hooks-store-banner-tradeContainer"
      >
        <p>
          With hooks you can add specific actions <b>before</b> and <b>after</b> your swap. {/*TODO: update the link*/}
          <a href="https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk" target="_blank" rel="noopener noreferrer">
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
        <SwapWidget topContent={TopContent} bottomContent={BottomContent} />
      </TradeWidgetWrapper>
      <IframeDappsManifestUpdater />
      {isHookSelectionOpen && (
        <HookRegistryList onDismiss={onDismiss} hookToEdit={hookToEdit} isPreHook={selectedHookPosition === 'pre'} />
      )}
      {isRescueWidgetOpen && <RescueFundsFromProxy onDismiss={() => setRescueWidgetOpen(false)} />}
    </>
  )
}
