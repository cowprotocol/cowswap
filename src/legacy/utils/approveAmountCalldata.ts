import type { Erc20Interface } from '@cowprotocol/abis'
import { Interface } from '@ethersproject/abi'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { toHex } from '@uniswap/v3-sdk'

const ERC20_INTERFACE = new Interface([
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]) as Erc20Interface

export default function approveAmountCalldata(
  amount: CurrencyAmount<Currency>,
  spender: string
): { to: string; data: string; value: '0x0' } {
  if (!amount.currency.isToken) throw new Error('Must call with an amount of token')
  const approveData = ERC20_INTERFACE.encodeFunctionData('approve', [spender, toHex(amount.quotient)])
  return {
    to: amount.currency.address,
    data: approveData,
    value: '0x0',
  }
}
