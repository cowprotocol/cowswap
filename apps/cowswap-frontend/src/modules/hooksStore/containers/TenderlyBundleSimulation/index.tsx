import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { ButtonOutlined, Loader } from '@cowprotocol/ui'

import { ErrorText, ErrorWrapper, LoaderWrapper } from './styled'

import { SimulationError } from '../../types/TenderlySimulation'
import {
  BundleTenderlySimulationResult,
  useTenderlyBundleSimulate,
} from 'modules/hooksStore/hooks/useTenderlyBundleSimulate'
import { useHooks } from 'modules/hooksStore/hooks/useHooks'

function isSimulationSuccessful(
  res: BundleTenderlySimulationResult | SimulationError,
): res is BundleTenderlySimulationResult {
  return !!(res as BundleTenderlySimulationResult).simulation_results
}

const tenderlySimulationSuccessAtom = atom<Record<string, boolean | undefined>>({})
const tenderlySimulationErrorsAtom = atom<Record<string, string | undefined>>({})

export function BundleTenderlySimulate() {
  const { postHooks, preHooks } = useHooks()

  const hooks = [...preHooks, ...postHooks].map(({ hook }) => hook)

  const hooksId = hooks
    .map((hook) => [(hook.target, hook.callData, hook.gasLimit)])
    .flat()
    .join(':')
  // const [simulationLinks, setSimulationLink] = useAtom(tenderlySimulationLinksAtom)
  // const simulationLink = simulationLinks[hooksId]

  const [simulationsSuccess, setSimulationsSuccess] = useAtom(tenderlySimulationSuccessAtom)
  const simulationSuccess = simulationsSuccess[hooksId]

  const [simulationErrors, setSimulationError] = useAtom(tenderlySimulationErrorsAtom)
  const simulationError = simulationErrors[hooksId]

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const simulate = useTenderlyBundleSimulate()

  const onSimulate = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await simulate(hooks)

      if (isSimulationSuccessful(response)) {
        // const link = getSimulationLink(response.simulation.id)

        // setSimulationLink({ [hooksId]: link })
        setSimulationsSuccess({ [hooksId]: true })
        setSimulationError({ [hooksId]: undefined })
      } else {
        setSimulationError({ [hooksId]: response.error.message })
      }
    } catch (error: any) {
      setSimulationError({ [hooksId]: errorToString(error) })
    } finally {
      setIsLoading(false)
    }
  }, [simulate, hooks, hooksId])

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

  return <ButtonOutlined onClick={onSimulate}>Simulate</ButtonOutlined>
}
