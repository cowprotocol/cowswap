import { atom, useAtom } from 'jotai'
import { useCallback, useState } from 'react'

import { errorToString } from '@cowprotocol/common-utils'
import { ButtonOutlined, ExternalLink, LinkIcon, Loader } from '@cowprotocol/ui'

import { ErrorText, ErrorWrapper, ExternalLinkContent, LoaderWrapper } from './styled'

import { getSimulationLink } from '../../const'
import { useTenderlySimulate } from '../../hooks/useTenderlySimulate'
import { CowHook } from '../../types/hooks'
import { SimulationError, TenderlySimulation } from '../../types/TenderlySimulation'

interface TenderlySimulateProps {
  hook: CowHook
}

function isSimulationSuccessful(res: TenderlySimulation | SimulationError): res is TenderlySimulation {
  return !!(res as TenderlySimulation).simulation
}

const tenderlySimulationLinksAtom = atom<Record<string, string | undefined>>({})
const tenderlySimulationErrorsAtom = atom<Record<string, string | undefined>>({})

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function TenderlySimulate({ hook }: TenderlySimulateProps) {
  const hookId = [hook.target, hook.callData, hook.gasLimit].join(':')
  const [simulationLinks, setSimulationLink] = useAtom(tenderlySimulationLinksAtom)
  const simulationLink = simulationLinks[hookId]

  const [simulationErrors, setSimulationError] = useAtom(tenderlySimulationErrorsAtom)
  const simulationError = simulationErrors[hookId]

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const simulate = useTenderlySimulate()

  const onSimulate = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await simulate(hook)

      if (isSimulationSuccessful(response)) {
        const link = getSimulationLink(response.simulation.id)

        setSimulationLink({ [hookId]: link })
        setSimulationError({ [hookId]: undefined })
      } else {
        setSimulationError({ [hookId]: response.error.message })
      }
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setSimulationError({ [hookId]: errorToString(error) })
    } finally {
      setIsLoading(false)
    }
  }, [simulate, hook, hookId, setSimulationError, setSimulationLink])

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
