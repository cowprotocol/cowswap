import { Interface } from '@ethersproject/abi'
// lightweight ABI
// contains only Trade event and allowanceManager method
import GP_V2_SETTLEMENT from './GPv2Settlement.json'

export const GP_V2_SETTLEMENT_INTERFACE = new Interface(GP_V2_SETTLEMENT)
