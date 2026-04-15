import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  getCurrentChainIdFromUrl,
  isBarnBackendEnv,
} from '@cowprotocol/common-utils'
import { TradingSdk } from '@cowprotocol/cow-sdk'

import { orderBookApi } from '../cowSdk'

const chainId = getCurrentChainIdFromUrl()

export const tradingSdk = new TradingSdk(
  {
    chainId,
    appCode: DEFAULT_APP_CODE,
    env: isBarnBackendEnv ? 'staging' : 'prod',
    settlementContractOverride: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  },
  {
    orderBookApi,
  },
)
