import { DEFAULT_APP_CODE, getRpcProvider } from '@cowprotocol/common-const'
import { getCurrentChainIdFromUrl, isBarnBackendEnv } from '@cowprotocol/common-utils'
import { TradingSdk } from '@cowprotocol/cow-sdk'

const chainId = getCurrentChainIdFromUrl()

export const tradingSdk = new TradingSdk({
  chainId,
  appCode: DEFAULT_APP_CODE,
  signer: getRpcProvider(chainId)!.getSigner(),
  env: isBarnBackendEnv ? 'staging' : 'prod',
})
