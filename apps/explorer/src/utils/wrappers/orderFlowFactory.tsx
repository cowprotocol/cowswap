import React from 'react'

import { decodeAbiParameters, parseAbiParameters } from 'viem'

const ABI_PARAMS = parseAbiParameters([
  'address sellToken',
  'address buyToken',
  'address receiver',
  'address owner',
  'uint256 buyAmount',
  'bytes32 appData',
  'uint256 feeAmount',
  'uint32 validTo',
  'bool partiallyFillable',
  'int64 quoteId',
])

export function OrderFlowFactoryComponent({ data }: { data: string }): React.ReactElement | null {
  let decoded: ReturnType<typeof decodeAbiParameters<typeof ABI_PARAMS>>

  try {
    decoded = decodeAbiParameters(ABI_PARAMS, data as `0x${string}`)
  } catch {
    return null
  }

  const [sellToken, buyToken, receiver, owner, buyAmount, appData, feeAmount, validTo, partiallyFillable, quoteId] =
    decoded

  const rows: [string, React.ReactNode][] = [
    ['Sell Token', <code>{sellToken}</code>],
    ['Buy Token', <code>{buyToken}</code>],
    ['Receiver', <code>{receiver}</code>],
    ['Owner', <code>{owner}</code>],
    ['Buy Amount', buyAmount.toString()],
    ['App Data', <code>{appData}</code>],
    ['Fee Amount', feeAmount.toString()],
    ['Valid To', new Date(Number(validTo) * 1000).toUTCString()],
    ['Partially Fillable', String(partiallyFillable)],
    ['Quote ID', quoteId.toString()],
  ]

  return (
    <table>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td>
              <i>{label}</i>
            </td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
