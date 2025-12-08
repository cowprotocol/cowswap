import { useMemo } from 'react'

import { HookDappType, HookDappWalletCompatibility } from '@cowprotocol/hook-dapp-lib'
import { Command } from '@cowprotocol/types'
import { HelpTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

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
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HookDappDetails({ dapp, onSelect, walletType }: HookDappDetailsProps) {
  const { i18n } = useLingui()
  const tags = useMemo(() => {
    const { version, website, type, conditions } = dapp
    const walletCompatibility = conditions?.walletCompatibility || []

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const getWalletCompatibilityTooltip = () => {
      const supportedWallets = {
        [HookDappWalletCompatibility.SMART_CONTRACT]: t`smart contracts (e.g. Safe)`,
        [HookDappWalletCompatibility.EOA]: t`EOA wallets`,
      }

      if (walletCompatibility.length === 0) {
        return t`No wallet compatibility information available.`
      }

      const supportedTypes = walletCompatibility.map((type) => supportedWallets[type]).filter(Boolean)
      const joinedSupportedTypes = supportedTypes.join(` ` + t`and` + ` `)
      const compatibleWith = supportedTypes.length > 1 ? t`both ${joinedSupportedTypes}` : supportedTypes[0]

      return t`This hook is compatible with ${compatibleWith}.`
    }

    const isInternal = type === HookDappType.INTERNAL
    const typeLabel = isInternal ? t`Native` : t`External`

    return [
      { label: t`Hook version`, value: version },
      { label: t`Website`, link: website },
      {
        label: t`Type`,
        value: typeLabel,
        tooltip: isInternal
          ? t`${typeLabel} hooks are integrated code and part of the CoW Swap codebase.`
          : t`${typeLabel} hooks are externally hosted code which needs to be independently verified by the user.`,
      },
      {
        label: t`Wallet support`,
        value: walletCompatibility.length > 0 ? walletCompatibility.join(', ') : t`N/A`,
        tooltip: getWalletCompatibilityTooltip(),
      },
    ]
  }, [dapp])

  return (
    <styled.Wrapper>
      <HookDetailHeader dapp={dapp} onSelect={onSelect} walletType={walletType} />
      <styled.Body>
        <p>{dapp?.description ? i18n._(dapp.description) : ''}</p>
      </styled.Body>
      {dapp.version && (
        <styled.Tags>
          <h3>
            <Trans>Information</Trans>
          </h3>
          <table>
            <tbody>
              {tags
                .filter(({ value, link }) => value || link)
                .map(({ label, value, link, tooltip }) => (
                  <tr key={label as string}>
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
