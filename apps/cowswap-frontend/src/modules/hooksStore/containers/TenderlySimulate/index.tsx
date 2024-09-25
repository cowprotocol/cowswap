import { ExternalLink, LinkIcon } from '@cowprotocol/ui'

import { useHookSimulationLink } from 'modules/tenderly/state/simulationLink'

import { ExternalLinkContent } from './styled'

import { CowHook } from '../../types/hooks'

interface TenderlySimulateProps {
  hook: CowHook
}

export function TenderlySimulate({ hook }: TenderlySimulateProps) {
  const simulationLink = useHookSimulationLink(hook)

  if (simulationLink) {
    return (
      <ExternalLink href={simulationLink}>
        <ExternalLinkContent>
          <span>Simulation report</span> <LinkIcon />
        </ExternalLinkContent>
      </ExternalLink>
    )
  }

  return <></>
}
