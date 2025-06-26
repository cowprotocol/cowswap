import safeLogo from '@cowprotocol/assets/cow-swap/safe-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import styled from 'styled-components/macro'

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SafeTxFields(props: SafeTxFieldsProps) {
  const { chainId, safeAddress, safeTxHash, nonce, confirmationsRequired, confirmations } = props
  const safeTransaction = { safe: safeAddress, safeTxHash }

  const safeLogoImg = <SafeIcon src={safeLogo} alt="Safe logo" />

  return (
    <>
      <Field>
        <FieldLabel label="Safe transaction" tooltip="The hash for this Safe transaction." prefix={safeLogoImg} />
        <div>
          <span>{safeTxHash.slice(0, 8)}</span> {' - '}
          <SafeWalletLink chainId={chainId} safeTransaction={safeTransaction} />
        </div>
      </Field>

      <Field>
        <FieldLabel
          label="Safe nonce"
          tooltip='Safe contracts have a so-called "nonce." This is to ensure that each transaction can be executed only once so no replay attacks are possible.'
          prefix={safeLogoImg}
        />
        <span>{nonce}</span>
      </Field>

      <Field>
        <FieldLabel
          label="Safe confirmed signatures"
          tooltip="The number of signers who have confirmed this transaction versus the number of signer confirmations needed."
          prefix={safeLogoImg}
        />
        <span>
          {confirmations} / {confirmationsRequired}
        </span>
      </Field>
    </>
  )
}
