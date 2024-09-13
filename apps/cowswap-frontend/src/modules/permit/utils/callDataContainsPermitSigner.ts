import { PERMIT_SIGNER } from '@cowprotocol/permit-utils'

export function callDataContainsPermitSigner(fullAppData: string | undefined): boolean {
  if (!fullAppData) {
    return false
  }

  const signerAddressWithoutPrefix = PERMIT_SIGNER.address.slice(2).toLowerCase()

  return fullAppData.toLowerCase().includes(signerAddressWithoutPrefix)
}
