import { FEE_TOKEN } from './basic'

export default {
  // OWL proxy, rinkeby https://github.com/gnosis/owl-token
  '0xa7d1c04faf998f9161fc9f800a99a809b84cfc9d': {
    name: 'OWL token',
    symbol: 'OWL',
    decimals: 18,
  },
  '0xF1290473E210b2108A85237fbCd7b6eb42Cc654F': {
    name32Bytes: '0x4865646765547261646500000000000000000000000000000000000000000000',
    symbol32Bytes: '0x4845444700000000000000000000000000000000000000000000000000000000',
  },
  [FEE_TOKEN]: { name: 'Fee token', symbol: 'FEET', decimals: 18 },
}
