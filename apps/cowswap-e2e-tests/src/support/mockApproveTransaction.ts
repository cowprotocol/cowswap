import { encodeAbiParameters } from 'viem'

/** `approve(address,uint256)` selector — what the preflight `eth_call` this mock also stubs is checking won't revert. */
export const APPROVE_SELECTOR = '0x095ea7b3'
/** ABI-encoded `true` — the only thing a `bool`-returning `eth_call` needs to report success. */
export const APPROVE_CALL_SUCCESS_RESULT = encodeAbiParameters([{ type: 'bool' }], [true])
