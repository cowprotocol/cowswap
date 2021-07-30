import { ChainId } from '@uniswap/sdk'
import { WETH9 } from '@uniswap/sdk-core'
import { DAI_RINKEBY, USDC_RINKEBY, USDT_RINKEBY, WBTC_RINKEBY } from 'utils/rinkeby/constants'
import { DAI, USDC, USDT, WBTC } from 'constants/tokens'
import { USDC_XDAI, USDT_XDAI, WBTC_XDAI, WXDAI } from 'utils/xdai/constants'

export * from './tokensMod'

function getTrustImage(mainnetAddress: string): string {
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${mainnetAddress}/logo.png`
}

export const ADDRESS_IMAGE_OVERRIDE = {
  // Rinkeby
  [DAI_RINKEBY.address]: getTrustImage(DAI.address),
  [USDC_RINKEBY.address]: getTrustImage(USDC.address),
  [USDT_RINKEBY.address]: getTrustImage(USDT.address),
  [WBTC_RINKEBY.address]: getTrustImage(WBTC.address),
  [WETH9[ChainId.RINKEBY].address]: getTrustImage(WETH9[ChainId.MAINNET].address),

  // xDai
  [USDC_XDAI.address]: getTrustImage(USDC.address),
  [USDT_XDAI.address]: getTrustImage(USDT.address),
  [WBTC_XDAI.address]: getTrustImage(WBTC.address),
  [WXDAI.address]:
    'https://raw.githubusercontent.com/1Hive/default-token-list/master/src/assets/xdai/0xe91d153e0b41518a2ce8dd3d7944fa863463a97d/logo.png',
}
