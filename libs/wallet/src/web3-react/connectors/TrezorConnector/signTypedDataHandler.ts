import type { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'

import { getHwAccount } from '../../../api/utils/getHwAccount'

import type transformTypedData from '@trezor/connect-plugin-ethereum'
import type { TrezorConnect } from '@trezor/connect-web'

export async function signTypedDataHandler(
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: Record<string, any>,
  primaryType: string,
  trezorConnect: TrezorConnect,
  _transformTypedData: typeof transformTypedData
): Promise<string> {
  const eip712Data = {
    domain,
    types,
    message,
    primaryType,
  } as Parameters<typeof _transformTypedData>[0]

  const { domain_separator_hash, message_hash } = _transformTypedData(eip712Data, true)

  if (!message_hash) throw new Error('Trezor sign typed data no message hash: ' + JSON.stringify(eip712Data))

  const result = await trezorConnect.ethereumSignTypedData({
    path: getHwAccount().path,
    data: eip712Data,
    metamask_v4_compat: true,
    // These are optional, but required for T1 compatibility
    domain_separator_hash,
    message_hash,
  })

  if (!result.success) throw new Error(result.payload.error)

  const { signature } = result.payload

  return signature
}
