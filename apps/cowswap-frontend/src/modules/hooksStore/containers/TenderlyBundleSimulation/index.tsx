import { atom, useAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { ButtonOutlined, Loader } from '@cowprotocol/ui'

import { ErrorText, ErrorWrapper, LoaderWrapper } from './styled'

import { useHooks } from 'modules/hooksStore/hooks/useHooks'
import { useOrderParams } from 'modules/hooksStore/hooks/useOrderParams'
import { useTokenContract } from 'common/hooks/useContract'
import { useTenderlyBundleSimulate } from 'modules/tenderlyDevNet/hooks/useTenderlyBundleSimulate'
import { CowHook, HookDappOrderParams } from 'modules/hooksStore/types/hooks'
import { useHasEnoughSettlementBalance } from 'modules/tenderlyDevNet/hooks/useHasEnoughSettlementBalance'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useIncreaseSettlementBalance } from 'modules/tenderlyDevNet/hooks/useIncreaseSettlementBalance'
import { TenderlyBundleSimulationResponse } from 'modules/tenderlyDevNet/types'

function isSimulationSuccessful(res: TenderlyBundleSimulationResponse) {
  return res.every(({ status }) => status)
}

function getSimulationErrorMessage(res: TenderlyBundleSimulationResponse) {
  const firstFailedTransaction = res.find(({ status }) => !status)
  if (!firstFailedTransaction) return 'Unknown error'
  const lastTrace = firstFailedTransaction.trace[firstFailedTransaction.trace.length - 1]
  return lastTrace.error
}

const tenderlySimulationSuccessAtom = atom<Record<string, boolean | undefined>>({})
const tenderlySimulationErrorsAtom = atom<Record<string, string | undefined>>({})

export function BundleTenderlySimulate() {
  const { chainId } = useWalletInfo()
  const hooksData = useHooks()
  const orderParams = useOrderParams()
  const sellToken = useTokenContract(orderParams?.sellTokenAddress)
  const buyToken = useTokenContract(orderParams?.buyTokenAddress)
  const preHooks = hooksData?.preHooks.map(({ hook }) => hook)
  const postHooks = hooksData?.postHooks.map(({ hook }) => hook)
  const getHasEnoughBalance = useHasEnoughSettlementBalance()
  const increaseBalance = useIncreaseSettlementBalance()

  // update this later
  const hooksId = useMemo(
    () => getSimulationId({ preHooks, postHooks, orderParams }),
    [preHooks, postHooks, orderParams],
  )
  // const [simulationLinks, setSimulationLink] = useAtom(tenderlySimulationLinksAtom)
  // const simulationLink = simulationLinks[hooksId]

  const [simulationsSuccess, setSimulationsSuccess] = useAtom(tenderlySimulationSuccessAtom)
  const simulationSuccess = simulationsSuccess[hooksId]

  const [simulationErrors, setSimulationError] = useAtom(tenderlySimulationErrorsAtom)
  const simulationError = simulationErrors[hooksId]

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const simulate = useTenderlyBundleSimulate()

  const onSimulate = useCallback(async () => {
    if (!sellToken || !buyToken || !orderParams) return
    setIsLoading(true)

    try {
      const hasEnoughBalance = await getHasEnoughBalance({
        balance: orderParams.buyAmount,
        tokenAddress: orderParams.buyTokenAddress,
        chainId,
      })
      if (!hasEnoughBalance) {
        const x = await increaseBalance({
          tokenAddress: orderParams.buyTokenAddress,
          chainId,
        })
      }
      const response = await simulate({
        preHooks,
        postHooks,
        orderParams,
        tokenSell: sellToken,
        tokenBuy: buyToken,
      })

      if (!response) return

      if (isSimulationSuccessful(response)) {
        setSimulationsSuccess({ [hooksId]: true })
        setSimulationError({ [hooksId]: undefined })
      } else {
        setSimulationError({ [hooksId]: getSimulationErrorMessage(response) })
      }
    } catch (error: any) {
      setSimulationError({ [hooksId]: errorToString(error) })
    } finally {
      setIsLoading(false)
    }
  }, [
    simulate,
    preHooks,
    postHooks,
    sellToken,
    buyToken,
    orderParams,
    hooksId,
    chainId,
    getHasEnoughBalance,
    increaseBalance,
  ])

  if (isLoading) {
    return (
      <LoaderWrapper>
        <Loader />
      </LoaderWrapper>
    )
  }

  if (simulationError) {
    return (
      <ErrorWrapper>
        <ErrorText>{simulationError}</ErrorText>
        <ButtonOutlined onClick={onSimulate}>Retry</ButtonOutlined>
      </ErrorWrapper>
    )
  }

  if (simulationSuccess) {
    return <ButtonOutlined disabled>Success</ButtonOutlined>
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
