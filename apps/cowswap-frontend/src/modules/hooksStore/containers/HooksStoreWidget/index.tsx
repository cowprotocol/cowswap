import { ReactNode, useCallback, useEffect, useState } from 'react'

import { HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { BannerOrientation, DismissableInlineBanner } from '@cowprotocol/ui'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import ICON_HOOK from 'assets/cow-swap/hook.svg'

import { SwapWidget } from 'modules/swap'
import { useIsSellNative, useIsWrapOrUnwrap } from 'modules/trade'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { TradeWidgetWrapper } from './styled'

import { useSetRecipientOverride } from '../../hooks/useSetRecipientOverride'
import { useSetupHooksStoreOrderParams } from '../../hooks/useSetupHooksStoreOrderParams'
import { IframeDappsManifestUpdater } from '../../updaters/iframeDappsManifestUpdater'
import { HookRegistryList } from '../HookRegistryList'
import { PostHookButton } from '../PostHookButton'
import { PreHookButton } from '../PreHookButton'

type HookPosition = 'pre' | 'post'

console.log(ICON_HOOK)

export function HooksStoreWidget(): ReactNode {
  const { chainId } = useWalletInfo()
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

  // Close all screens on network changes (including unsupported chain case)
  useEffect(onDismiss, [chainId, isChainIdUnsupported, onDismiss])

  useSetupHooksStoreOrderParams()
  useSetRecipientOverride()

  const isHookSelectionOpen = !!(selectedHookPosition || hookToEdit)
  const hideSwapWidget = isHookSelectionOpen

  const shouldNotUseHooks = isNativeSell || isChainIdUnsupported

  const TopContent = shouldNotUseHooks ? undefined : isWrapOrUnwrap ? undefined : (
    <>
      <DismissableInlineBanner
        orientation={BannerOrientation.Horizontal}
        customIcon={ICON_HOOK}
        iconSize={36}
        bannerId="hooks-store-banner-tradeContainer"
      >
        <p>
          <Trans>
            With hooks you can add specific actions <b>before</b> and <b>after</b> your swap.
          </Trans>{' '}
          <a href="https://cow.fi/learn/cow-hooks-you-are-in-control" target="_blank" rel="noopener noreferrer">
            <Trans>Learn more.</Trans>
          </a>
        </p>
      </DismissableInlineBanner>
      <PreHookButton
        onOpen={() => setSelectedHookPosition('pre')}
        onEditHook={onPreHookEdit}
        hideTooltip={isHookSelectionOpen}
      />
    </>
  )

  const BottomContent = shouldNotUseHooks ? null : (
    <PostHookButton
      onOpen={() => setSelectedHookPosition('post')}
      onEditHook={onPostHookEdit}
      hideTooltip={isHookSelectionOpen}
    />
  )

  return (
    <>
      <TradeWidgetWrapper visible$={!hideSwapWidget}>
        <SwapWidget topContent={TopContent} bottomContent={BottomContent} />
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
    </>
  )
}
