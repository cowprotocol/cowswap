import { Command } from '@cowprotocol/types'
import { HookDappType } from '@cowprotocol/types'
import { HelpTooltip } from '@cowprotocol/ui'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'
import { HookDetailHeader } from '../HookDetailHeader'

interface HookDappDetailsProps {
  dapp: HookDapp
  onSelect: Command
}

export function HookDappDetails({ dapp, onSelect }: HookDappDetailsProps) {
  const { description, version, website, type } = dapp

  const tags = [
    {
      label: 'Hook version',
      value: version,
    },
    {
      label: 'Website',
      link: website,
    },
    {
      label: 'Type',
      value: type === HookDappType.INTERNAL ? 'Native' : 'External',
      tooltip:
        type === HookDappType.INTERNAL
          ? 'Native hooks are integrated code and part of the CoW Swap codebase.'
          : 'External hooks load an iframe and are externally hosted code which needs to be independently verified by the user.',
    },
  ]

  return (
    <styled.Wrapper>
      <HookDetailHeader dapp={dapp} onSelect={onSelect} />
      <styled.Body>
        <p>{description}</p>
      </styled.Body>
      {version && (
        <styled.Tags>
          <h3>Information</h3>
          <table>
            <tbody>
              {tags
                .filter((tag) => tag.value || tag.link)
                .map((tag) => (
                  <tr key={tag.label}>
                    <td>
                      {tag.label}
                      {tag.tooltip && <HelpTooltip wrapInContainer text={tag.tooltip} />}
                    </td>
                    <td>
                      {tag.link ? (
                        <a href={tag.link} target="_blank" rel="noopener noreferrer">
                          {tag.value || tag.link}
                        </a>
                      ) : (
                        tag.value
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </styled.Tags>
      )}
    </styled.Wrapper>
  )
}
