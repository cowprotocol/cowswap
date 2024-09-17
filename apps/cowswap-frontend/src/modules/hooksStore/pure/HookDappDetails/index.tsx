import { useMemo } from 'react'

import { Command } from '@cowprotocol/types'
import { HelpTooltip } from '@cowprotocol/ui'

import * as styled from './styled'

import { HookDapp, HookDappType, HookDappWalletCompatibility } from '../../types/hooks'
import { HookDetailHeader } from '../HookDetailHeader'

interface HookDappDetailsProps {
  dapp: HookDapp
  onSelect: Command
}

export function HookDappDetails({ dapp, onSelect }: HookDappDetailsProps) {
  const tags = useMemo(() => {
    const { version, website, type, walletCompatibility } = dapp

    const getWalletCompatibilityTooltip = () => {
      const isSmartContract = walletCompatibility.includes(HookDappWalletCompatibility.SMART_CONTRACT)
      const isEOA = walletCompatibility.includes(HookDappWalletCompatibility.EOA)

      return `This hook is compatible with ${
        isSmartContract && isEOA
          ? 'both smart contracts (e.g. Gnosis Safe) and EOA wallets'
          : isSmartContract
            ? 'smart contracts (e.g. Gnosis Safe)'
            : 'EOA wallets'
      }.`
    }

    const isInternal = type === HookDappType.INTERNAL
    const typeLabel = isInternal ? 'Native' : 'External'

    return [
      { label: 'Hook version', value: version },
      { label: 'Website', link: website },
      {
        label: 'Type',
        value: typeLabel,
        tooltip: `${typeLabel} hooks are ${
          isInternal
            ? 'integrated code and part of the CoW Swap codebase'
            : 'externally hosted code which needs to be independently verified by the user'
        }.`,
      },
      {
        label: 'Wallet support',
        value: walletCompatibility.join(', '),
        tooltip: getWalletCompatibilityTooltip(),
      },
    ]
  }, [dapp])

  return (
    <styled.Wrapper>
      <HookDetailHeader dapp={dapp} onSelect={onSelect} />
      <styled.Body>
        <p>{dapp.description}</p>
      </styled.Body>
      {dapp.version && (
        <styled.Tags>
          <h3>Information</h3>
          <table>
            <tbody>
              {tags
                .filter(({ value, link }) => value || link)
                .map(({ label, value, link, tooltip }) => (
                  <tr key={label}>
                    <td>
                      {label}
                      {tooltip && <HelpTooltip wrapInContainer text={tooltip} />}
                    </td>
                    <td>
                      {link ? (
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {value || link}
                        </a>
                      ) : (
                        value
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
