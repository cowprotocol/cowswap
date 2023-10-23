import { SupportedChainId, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { TokenWithLogo } from './types'
import { WETH9 } from '@uniswap/sdk-core'
import { cowprotocolTokenLogoUrl } from './cowprotocolTokenLogoUrl'

// See https://github.com/cowprotocol/contracts/commit/821b5a8da213297b0f7f1d8b17c893c5627020af#diff-12bbbe13cd5cf42d639e34a39d8795021ba40d3ee1e1a8282df652eb161a11d6R13
export const NATIVE_CURRENCY_BUY_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

const weth9Mainnet = WETH9[SupportedChainId.MAINNET]
export const WETH_MAINNET = new TokenWithLogo(
  cowprotocolTokenLogoUrl(weth9Mainnet.address.toLowerCase(), SupportedChainId.MAINNET),
  weth9Mainnet.chainId,
  weth9Mainnet.address,
  weth9Mainnet.decimals,
  weth9Mainnet.symbol,
  weth9Mainnet.name
)
// xDAI tokens
export const WXDAI = new TokenWithLogo(
  undefined,
  ChainId.GNOSIS_CHAIN,
  '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  18,
  'WXDAI',
  'Wrapped XDAI'
)
export const WETH_GOERLI = new TokenWithLogo(
  WETH_MAINNET.logoURI,
  ChainId.GOERLI,
  '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
  18,
  'WETH',
  'Wrapped Görli Ether'
)
export const WRAPPED_NATIVE_CURRENCY: Record<SupportedChainId, TokenWithLogo> = {
  [SupportedChainId.MAINNET]: WETH_MAINNET,
  [SupportedChainId.GNOSIS_CHAIN]: WXDAI,
  [SupportedChainId.GOERLI]: WETH_GOERLI,
}

export const NATIVE_CURRENCY_BUY_TOKEN: { [chainId in ChainId]: TokenWithLogo } = {
  [ChainId.MAINNET]: new TokenWithLogo(undefined, ChainId.MAINNET, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GOERLI]: new TokenWithLogo(undefined, ChainId.GOERLI, NATIVE_CURRENCY_BUY_ADDRESS, 18, 'ETH', 'Ether'),
  [ChainId.GNOSIS_CHAIN]: new TokenWithLogo(
    undefined,
    ChainId.GNOSIS_CHAIN,
    NATIVE_CURRENCY_BUY_ADDRESS,
    18,
    'xDAI',
    'xDAI'
  ),
}
