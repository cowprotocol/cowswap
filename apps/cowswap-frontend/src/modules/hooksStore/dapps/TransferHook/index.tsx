import { useCallback, useEffect, useMemo, useState } from 'react'
import { Wrapper } from '../styled'
import { ButtonPrimary } from '@cowprotocol/ui'
import { HookDappProps } from 'modules/hooksStore/types/hooks'
import { Address, createPublicClient, encodeFunctionData, http } from 'viem'
import { Erc20Abi } from '@cowprotocol/abis'

import { mainnet } from 'viem/chains'

import { CowShedHooks } from '@cowprotocol/cow-sdk'
import { BaseTransaction, useCowShedSignature } from './useCowShedSignature'
import { CoWHookDappActions, HookDappContext, initCoWHookDapp } from '@cowprotocol/hook-dapp-lib'
import { BigNumber, type Signer } from 'ethers'

import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useHandleTokenAllowance } from './useHandleTokenAllowance'

export function TransferHookApp({ context }: HookDappProps) {
  const hookToEdit = context.hookToEdit
  const isPreHook = context.isPreHook
  const account = context?.account
  const tokenAddress = context?.orderParams?.buyTokenAddress as Address | undefined
  const amount = context?.orderParams?.buyAmount ? BigInt(context.orderParams.buyAmount) / BigInt(2) : undefined

  const toAddress = '0x21F3d1B62f6F23fC8b1B6920a3b62915790A85D5'

  const target = tokenAddress

  const [_context, _setContext] = useState<HookDappContext>()
  const [web3Provider, setWeb3Provider] = useState<Web3Provider>()
  const [actions, setActions] = useState<CoWHookDappActions>()
  const [signer, setSigner] = useState<Signer>()

  useEffect(() => {
    const { actions, provider } = initCoWHookDapp({
      onContext: _setContext as (args: HookDappContext) => void,
    })

    setActions(actions)

    const web3Provider = new Web3Provider(provider)
    setWeb3Provider(web3Provider)
    setSigner(web3Provider.getSigner())
  }, [])

  const publicClient = useMemo(() => {
    if (!context?.chainId) return
    return createPublicClient({
      chain: mainnet,
      transport: http('https://eth.llamarpc.com'),
    })
  }, [context?.chainId])

  const jsonRpcProvider = useMemo(() => {
    if (!context?.chainId) return
    return new JsonRpcProvider('https://eth.llamarpc.com')
  }, [context?.chainId])

  const callData = useMemo(() => {
    if (!tokenAddress || !amount || !signer) return
    return encodeFunctionData({
      abi: Erc20Abi,
      functionName: 'transferFrom',
      args: [account, toAddress, amount],
    })
  }, [tokenAddress, amount, account])

  const gasLimit = '100000'

  const cowShed = useMemo(() => {
    if (!context?.chainId) return
    return new CowShedHooks(context.chainId)
  }, [context?.chainId])

  const cowShedProxy = useMemo(() => {
    if (!context?.account || !cowShed) return
    return cowShed.proxyOf(context.account)
  }, [context?.account, cowShed]) as Address | undefined

  const cowShedSignature = useCowShedSignature({
    cowShed,
    signer,
    context,
  })

  const handleTokenAllowance = useHandleTokenAllowance({
    spender: cowShedProxy,
    context,
    web3Provider,
    publicClient,
    jsonRpcProvider,
    signer,
  })

  const onButtonClick = useCallback(async () => {
    if (!cowShed || !target || !callData || !gasLimit || !amount) return

    const hookTx: BaseTransaction = {
      to: target,
      value: BigInt(0),
      callData,
    }

    const permitTx = await handleTokenAllowance(BigNumber.from(amount), tokenAddress)

    if (!permitTx) return

    const permitTxAdjusted = {
      to: permitTx.target,
      value: BigInt(0),
      callData: permitTx.callData,
    }

    const txs = [permitTxAdjusted, hookTx]

    const cowShedCall = await cowShedSignature(txs)
    if (!cowShedCall) throw new Error('Error signing hooks')

    const hook = {
      target: cowShed.getFactoryAddress(),
      callData: cowShedCall,
      gasLimit,
    }

    if (hookToEdit) {
      context.editHook({ hook, uuid: hookToEdit.uuid })
      return
    }

    context.addHook({ hook })
  }, [target, callData, gasLimit, context])

  const buttonProps = useMemo(() => {
    if (!context.account) return { message: 'Connect wallet', disabled: true }
    if (!context.orderParams) return { message: 'Missing order params', disabled: true }
    return { message: 'Add Post-hook', disabled: false }
  }, [hookToEdit, context.account, isPreHook])

  return (
    <Wrapper>
      <span>This hook will transfer half of the buyAmount to {toAddress}.</span>
      <ButtonPrimary onClick={onButtonClick} disabled={buttonProps.disabled}>
        {buttonProps.message}
      </ButtonPrimary>
    </Wrapper>
  )
}
