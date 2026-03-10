import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK: Record<SupportedChainId, string> =
  mapAddressToSupportedNetworks('0x22af3D38E50ddedeb7C47f36faB321eC3Bb72A76')
