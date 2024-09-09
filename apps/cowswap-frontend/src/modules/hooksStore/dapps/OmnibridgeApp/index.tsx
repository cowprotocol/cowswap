import React, { useCallback, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { HookDappProps } from '@cowprotocol/types'
import { BannerOrientation, ButtonPrimary, InlineBanner } from '@cowprotocol/ui'

import { buildOmnibridgePostHook } from './buildHook'
import { COW_SHED_FACTORY_ADDRESS } from './consts'

import { CowShedHooks } from '../../cowShed'

const cowShed = new CowShedHooks(SupportedChainId.GNOSIS_CHAIN, {
  factoryAddress: COW_SHED_FACTORY_ADDRESS,
  implementationAddress: '0x6105778CED7f362C9eDf6d1BA0079Aba75C9c721',
  proxyCreationCode:
    '0x60a034608e57601f61037138819003918201601f19168301916001600160401b038311848410176093578084926040948552833981010312608e57604b602060458360a9565b920160a9565b6080527f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc556040516102b490816100bd8239608051818181608f01526101720152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b0382168203608e5756fe60806040526004361015610018575b3661019457610194565b6000803560e01c908163025b22bc1461003b575063f851a4400361000e5761010d565b3461010a5760207ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc36011261010a5773ffffffffffffffffffffffffffffffffffffffff60043581811691828203610106577f0000000000000000000000000000000000000000000000000000000000000000163314600014610101577f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc557fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b8280a280f35b61023d565b8380fd5b80fd5b346101645760007ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffc360112610164576020610146610169565b73ffffffffffffffffffffffffffffffffffffffff60405191168152f35b600080fd5b333003610101577f000000000000000000000000000000000000000000000000000000000000000090565b60ff7f68df44b1011761f481358c0f49a711192727fb02c377d697bcb0ea8ff8393ac0541615806101ef575b1561023d5760046040517ff92ee8a9000000000000000000000000000000000000000000000000000000008152fd5b507f400ada75000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000006000351614156101c0565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546000808092368280378136915af43d82803e1561027a573d90f35b3d90fdfea2646970667358221220c7c26ff3040b96a28e96d6d27b743972943aeaef81cc821544c5fe1e24f9b17264736f6c63430008190033',
})

export function OmnibridgeApp({ context }: HookDappProps) {
  const { account, orderParams, addHook, signer } = context
  const proxyAddress = useMemo(() => (account ? cowShed.computeProxyAddress(account) : null), [account])

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
