import { SupportedChainId } from '@cowprotocol/cow-sdk'

const composableCowAddress = '0xF487887DA5a4b4e3eC114FDAd97dc0F785d72738'
export const COMPOSABLE_COW_ADDRESS: Record<SupportedChainId, string> = {
  1: composableCowAddress,
  100: composableCowAddress,
  5: composableCowAddress,
}

const extensibleHandlerAddress = '0x4e305935b14627eA57CBDbCfF57e81fd9F240403'
export const SAFE_EXTENSIBLE_HANDLER_ADDRESS: Record<SupportedChainId, string> = {
  1: extensibleHandlerAddress,
  100: extensibleHandlerAddress,
  5: extensibleHandlerAddress,
}

const currentBlockFactoryAddress = '0x0899c7DC280363d263Cc954506134F249CceC4a5'
export const CURRENT_BLOCK_FACTORY_ADDRESS: Record<SupportedChainId, string> = {
  1: currentBlockFactoryAddress,
  100: currentBlockFactoryAddress,
  5: currentBlockFactoryAddress,
}
