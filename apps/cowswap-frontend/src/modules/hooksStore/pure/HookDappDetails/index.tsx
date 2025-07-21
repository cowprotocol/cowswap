import { useMemo } from 'react'

import { HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { Command } from '@cowprotocol/types'
import { HelpTooltip } from '@cowprotocol/ui'

import * as styled from './styled'

import { HookDapp } from '../../types/hooks'
import { HookDetailHeader } from '../HookDetailHeader'

interface HookDappDetailsProps {
  dapp: HookDapp
  onSelect: Command
  walletType: HookDappWalletCompatibility
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function HookDappDetails({ dapp, onSelect, walletType }: HookDappDetailsProps) {
  const tags = useMemo(() => {
    const { version, website, type, conditions } = dapp
    const walletCompatibility = conditions?.walletCompatibility || []

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getWalletCompatibilityTooltip = () => {
      const supportedWallets = {
        [HookDappWalletCompatibility.SMART_CONTRACT]: 'smart contracts (e.g. Safe)',
        [HookDappWalletCompatibility.EOA]: 'EOA wallets',
      }

      if (walletCompatibility.length === 0) {
        return 'No wallet compatibility information available.'
      }

      const supportedTypes = walletCompatibility.map((type) => supportedWallets[type]).filter(Boolean)

      return `This hook is compatible with ${
        supportedTypes.length > 1 ? `both ${supportedTypes.join(' and ')}` : supportedTypes[0]
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
        value: walletCompatibility.length > 0 ? walletCompatibility.join(', ') : 'N/A',
        tooltip:
          walletCompatibility.length > 0
            ? getWalletCompatibilityTooltip()
            : 'No wallet compatibility information available.',
      },
    ]
  }, [dapp])

  return (
    <styled.Wrapper>
      <HookDetailHeader dapp={dapp} onSelect={onSelect} walletType={walletType} />
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
