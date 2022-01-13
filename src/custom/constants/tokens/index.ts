import { ChainId } from '@uniswap/sdk'
import { WETH9 } from '@uniswap/sdk-core'
import { DAI_RINKEBY, USDC_RINKEBY, USDT_RINKEBY, WBTC_RINKEBY } from 'utils/rinkeby/constants'
import { DAI, USDC, USDT, WBTC } from 'constants/tokens'
import { USDC_XDAI, /*USDT_XDAI,*/ WBTC_XDAI, WETH_XDAI, WXDAI } from 'utils/xdai/constants'
import wxDaiLogo from 'assets/images/wxdai.png'

export * from './tokensMod'

function getTrustImage(mainnetAddress: string): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${mainnetAddress}/logo.png`
}

const WETH_ADDRESS_MAINNET = WETH9[ChainId.MAINNET].address

export const ADDRESS_IMAGE_OVERRIDE = {
  // Rinkeby
  [DAI_RINKEBY.address]: getTrustImage(DAI.address),
  [USDC_RINKEBY.address]: getTrustImage(USDC.address),
  [USDT_RINKEBY.address]: getTrustImage(USDT.address),
  [WBTC_RINKEBY.address]: getTrustImage(WBTC.address),
  [WETH9[ChainId.RINKEBY].address]: getTrustImage(WETH_ADDRESS_MAINNET),

  // xDai
  [USDC_XDAI.address]: getTrustImage(USDC.address),
  // [USDT_XDAI.address]: getTrustImage(USDT.address),
  [WBTC_XDAI.address]: getTrustImage(WBTC.address),
  [WXDAI.address]: wxDaiLogo,
  [WETH_XDAI.address]: getTrustImage(WETH_ADDRESS_MAINNET),
}
