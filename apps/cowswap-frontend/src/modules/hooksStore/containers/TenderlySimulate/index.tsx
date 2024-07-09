import { useCallback, useEffect, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { CowHook } from '@cowprotocol/types'
import { ButtonOutlined, ExternalLink, LinkIcon, Loader } from '@cowprotocol/ui'

import { ErrorText, ErrorWrapper, ExternalLinkContent, LoaderWrapper } from './styled'

import { getSimulationLink } from '../../const'
import { useTenderlySimulate } from '../../hooks/useTenderlySimulate'
import { SimulationError, TenderlySimulation } from '../../types/TenderlySimulation'

interface TenderlySimulateProps {
  hook: CowHook
}

function isSimulationSuccessful(res: TenderlySimulation | SimulationError): res is TenderlySimulation {
  return !!(res as TenderlySimulation).simulation
}

export function TenderlySimulate({ hook }: TenderlySimulateProps) {
  const [simulationLink, setSimulationLink] = useState<string | null>(null)
  const [simulationError, setSimulationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const simulate = useTenderlySimulate()

  const onSimulate = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await simulate(hook)

      if (isSimulationSuccessful(response)) {
        const link = getSimulationLink(response.simulation.id)

        setSimulationLink(link)
      } else {
        setSimulationError(response.error.message)
      }
    } catch (error: any) {
      setSimulationError(errorToString(error))
    } finally {
      setIsLoading(false)
    }
  }, [simulate, hook])

  useEffect(() => {
    setSimulationLink(null)
    setSimulationError(null)
  }, [hook])

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

  if (simulationLink) {
    return (
      <ExternalLink href={simulationLink}>
        <ExternalLinkContent>
          <span>Simulation report</span> <LinkIcon />
        </ExternalLinkContent>
      </ExternalLink>
    )
  }

  return <ButtonOutlined onClick={onSimulate}>Simulate</ButtonOutlined>
}
