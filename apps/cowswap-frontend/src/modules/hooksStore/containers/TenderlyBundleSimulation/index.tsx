import { atom, useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { ButtonOutlined, Loader } from '@cowprotocol/ui'

import { ErrorText, ErrorWrapper, LoaderWrapper } from './styled'

import { useHooks } from 'modules/hooksStore/hooks/useHooks'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'
import { useTokenContract } from 'common/hooks/useContract'
import { useTenderlyBundleSimulate } from 'modules/tenderly/hooks/useTenderlyBundleSimulate'
import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

const tenderlySimulationSuccessAtom = atom<Record<string, boolean | undefined>>({})

export function BundleTenderlySimulate() {
  const { chainId, account } = useWalletInfo()
  const hooksData = useHooks()
  const orderParams = useOrderParams()
  const sellToken = useTokenContract(orderParams?.sellTokenAddress)
  const buyToken = useTokenContract(orderParams?.buyTokenAddress)
  const preHooks = hooksData?.preHooks.map(({ hook }) => hook)
  const postHooks = hooksData?.postHooks.map(({ hook }) => hook)

  // update this later
  const hooksId = useMemo(
    () => getSimulationId({ preHooks, postHooks, orderParams }),
    [preHooks, postHooks, orderParams],
  )

  const [simulationsSuccess, setSimulationsSuccess] = useAtom(tenderlySimulationSuccessAtom)
  const simulationSuccess = simulationsSuccess[hooksId]

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const simulate = useTenderlyBundleSimulate()

  const onSimulate = useCallback(async () => {
    if (!sellToken || !buyToken || !orderParams || !account) return
    setIsLoading(true)

    try {
      const simulateSuccess = await simulate({
        preHooks,
        postHooks,
        orderParams,
        tokenSell: sellToken,
        tokenBuy: buyToken,
        chainId,
        account,
      })

      setSimulationsSuccess({ [hooksId]: simulateSuccess })
    } catch (error: any) {
      setSimulationsSuccess({ [hooksId]: false })
    } finally {
      setIsLoading(false)
    }
  }, [simulate, preHooks, postHooks, sellToken, buyToken, orderParams, hooksId, chainId, account])

  if (isLoading) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    )
  }

  if (simulationSuccess) {
    return <ButtonOutlined disabled>Success</ButtonOutlined>
  }

  if (!simulationSuccess && simulationSuccess !== undefined) {
    return (
      <ErrorWrapper>
        <ErrorText>Error</ErrorText>
        <ButtonOutlined onClick={onSimulate}>Retry</ButtonOutlined>
      </ErrorWrapper>
    )
  }

  return (
    <ButtonOutlined onClick={onSimulate} disabled={!sellToken || !buyToken || !orderParams}>
      Simulate
    </ButtonOutlined>
  )
}

function getSimulationId({
  preHooks,
  postHooks,
  orderParams,
}: {
  preHooks: CowHook[]
  postHooks: CowHook[]
  orderParams: HookDappOrderParams | null
}) {
  if (!orderParams) return ''
  const preHooksPart = preHooks.map(({ target, callData, gasLimit }) => `${target}:${callData}:${gasLimit}`).join(':')
  const orderPart = `${orderParams.sellTokenAddress}:${orderParams.buyTokenAddress}:${orderParams.sellAmount}:${orderParams.buyAmount}`
  const postHooksPart = postHooks.map(({ target, callData, gasLimit }) => `${target}:${callData}:${gasLimit}`).join(':')
  return `${preHooksPart}-${orderPart}-${postHooksPart}`
}
