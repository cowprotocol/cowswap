import { SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

import safeLogo from 'modules/wallet/api/assets/safe-logo.svg'

import { SafeWalletLink } from 'common/pure/SafeWalletLink'

import { FieldLabel } from '../FieldLabel'
import { Field } from '../styled'

const SafeIcon = styled.img`
  margin-right: 5px;
`

export interface SafeTxFieldsProps {
  chainId: SupportedChainId
  safeAddress: string
  safeTxHash: string
  nonce: number
  confirmations: number
  confirmationsRequired: number
}

export function SafeTxFields(props: SafeTxFieldsProps) {
  const { chainId, safeAddress, safeTxHash, nonce, confirmationsRequired, confirmations } = props
  const safeTransaction = { safe: safeAddress, safeTxHash }

  const safeLogoImg = <SafeIcon src={safeLogo} alt="Safe logo" />

  return (
    <>
      <Field>
        <FieldLabel label="Safe transaction" tooltip="TODO: set tooltip" prefix={safeLogoImg} />
        <div>
          <span>{safeTxHash.slice(0, 8)}</span> {' - '}
          <SafeWalletLink chainId={chainId} safeTransaction={safeTransaction} />
        </div>
      </Field>

      <Field>
        <FieldLabel label="Safe nonce" tooltip="TODO: set tooltip" prefix={safeLogoImg} />
        <span>{nonce}</span>
      </Field>

      <Field>
        <FieldLabel label="Safe confirmed signatures" tooltip="TODO: set tooltip" prefix={safeLogoImg} />
        <span>
          {confirmations} / {confirmationsRequired}
        </span>
      </Field>
    </>
  )
}
