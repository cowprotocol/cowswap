import React, { useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BannerOrientation, ButtonPrimary, InlineBanner } from '@cowprotocol/ui'

import { useAsyncMemo } from 'use-async-memo'

import { buildOmnibridgePostHook } from './buildHook'

import { CowShedHooks } from '../../cowShed'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from '../../cowShed/consts'
import { HookDappProps } from '../../types/hooks'

const cowShed = new CowShedHooks(SupportedChainId.GNOSIS_CHAIN, {
  factoryAddress: COW_SHED_FACTORY,
  implementationAddress: COW_SHED_IMPLEMENTATION,
})

export function OmnibridgeApp({ context }: HookDappProps) {
  const { account, orderParams, addHook, signer } = context
  const proxyAddress = useAsyncMemo(
    () => (account && signer ? cowShed.computeProxyAddress(account, signer) : null),
    [account, signer],
  )

  const addHookCallback = useCallback(async () => {
    if (!proxyAddress || !orderParams || !signer) {
      return
    }

    try {
      const hook = await buildOmnibridgePostHook({
        proxyAddress,
        tokenAddress: orderParams.buyTokenAddress,
        validTo: orderParams.validTo,
        cowShed,
        signer,
      })

      addHook({ hook, receiverOverride: proxyAddress })
    } catch (e) {
      console.error(e)
    }
  }, [signer, addHook, orderParams, proxyAddress])

  if (!orderParams) return <p>Please, specify valid order first</p>
  if (!proxyAddress) return <p>Please, connect wallet first</p>

  return (
    <div>
      <InlineBanner orientation={BannerOrientation.Horizontal}>
        <p>The funds of the swap will be transfered to a proxy {proxyAddress}!</p>
      </InlineBanner>
      <br />
      <p>You will be asked for typed data signing.</p>
      <ButtonPrimary onClick={addHookCallback}>Add hook</ButtonPrimary>
    </div>
  )
}
