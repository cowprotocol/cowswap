import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const DEFAULT_PARTNER_FEE_RECIPIENT_PER_NETWORK: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks('0x22af3D38E50ddedeb7C47f36faB321eC3Bb72A76'),
  [SupportedChainId.LENS]: '0xC8c13a5796bb494e04b4e97a77Ad1670a02107ca',
}
