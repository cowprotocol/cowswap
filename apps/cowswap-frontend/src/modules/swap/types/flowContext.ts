import type { Erc20, Weth } from '@cowprotocol/abis'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { Command } from '@cowprotocol/types'
import type { GnosisSafeInfo } from '@cowprotocol/wallet'
import type { Web3Provider } from '@ethersproject/providers'
import type { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import type { AppDispatch } from 'legacy/state'
import type { QuoteInformationObject } from 'legacy/state/price/reducer'
import type TradeGp from 'legacy/state/swap/TradeGp'

import type { useGetCachedPermit } from 'modules/permit'
import type { TradeConfirmActions } from 'modules/trade'

import type { AppDataInfo, TypedAppDataHooks, UploadAppDataParams } from '../../appData'

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
}

export interface BaseFlowContextSource {
  chainId: SupportedChainId
  account: string | undefined
  sellTokenContract: Erc20 | null
  provider: Web3Provider | undefined
  trade: TradeGp | undefined
  appData: AppDataInfo | null
  wethContract: Weth | null
  inputAmountWithSlippage: CurrencyAmount<Currency> | undefined
  gnosisSafeInfo: GnosisSafeInfo | undefined
  recipient: string | null
  recipientAddressOrName: string | null
  deadline: number
  ensRecipientAddress: string | null
  allowsOffchainSigning: boolean
  flowType: FlowType
  closeModals: Command
  uploadAppData: (update: UploadAppDataParams) => void
  dispatch: AppDispatch
  allowedSlippage: Percent
  tradeConfirmActions: TradeConfirmActions
  getCachedPermit: ReturnType<typeof useGetCachedPermit>
  quote: QuoteInformationObject | undefined
  typedHooks: TypedAppDataHooks | undefined
}
