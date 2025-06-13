import { useCallback, useEffect, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CoWHookDappActions, HookDappContext, initCoWHookDapp } from '@cowprotocol/hook-dapp-lib'
import type { Signer } from '@ethersproject/abstract-signer'
import { Web3Provider } from '@ethersproject/providers'

import { useAsyncMemo } from 'use-async-memo'

import { buildOmnibridgePostHook } from './buildHook'

import { CowShedHooks } from '../cowShed'
import { COW_SHED_FACTORY, COW_SHED_IMPLEMENTATION } from '../cowShed/consts'

const cowShed = new CowShedHooks(SupportedChainId.GNOSIS_CHAIN, {
  factoryAddress: COW_SHED_FACTORY,
  implementationAddress: COW_SHED_IMPLEMENTATION,
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OmnibridgeApp() {
  const [actions, setActions] = useState<CoWHookDappActions | null>(null)
  const [context, setContext] = useState<HookDappContext | null>(null)
  const [signer, setSigner] = useState<Signer | null>(null)

  const { account, orderParams } = context || {}

  const proxyAddress = useAsyncMemo(() => {
    return account && signer ? cowShed.computeProxyAddress(account, signer) : null
  }, [account, signer])

  const addHookCallback = useCallback(async () => {
    if (!proxyAddress || !orderParams || !actions || !signer) {
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

      actions.addHook({ hook, recipientOverride: proxyAddress })
    } catch (e) {
      console.error(e)
    }
  }, [signer, actions, orderParams, proxyAddress])

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({ onContext: setContext })
    const web3Provider = new Web3Provider(provider)
    const signer = web3Provider.getSigner()

    setActions(actions)
    setSigner(signer)
  }, [])

  if (!proxyAddress) return <p>Please connect your wallet to continue</p>
  if (!orderParams) return <p>Please specify your swap order before proceeding</p>

  return (
    <div>
      <div>
        <p>The funds of the swap will be transfered to a proxy {proxyAddress}!</p>
      </div>
      <br />
      <p>You will be asked for typed data signing.</p>
      <button onClick={addHookCallback}>Add hook</button>
    </div>
  )
}
