import { getFeeToken } from './getFeeToken' // Adjust the import path as necessary

import { ordersMock } from '../pure/OrdersTableContainer/orders.mock'

const BASE_ORDER = ordersMock[3]

describe('getFeeToken', () => {
  it("should return inputToken when that's the fee token", () => {
    const input = BASE_ORDER
    const expectedOutput = BASE_ORDER.inputToken

    const result = getFeeToken(input)

    expect(result).toEqual(expectedOutput)
  })

  it("should return outputToken when that's the fee token", () => {
    const input = {
      ...BASE_ORDER,
      executionData: { ...BASE_ORDER.executionData, executedFeeToken: BASE_ORDER.outputToken.address },
    }
    const expectedOutput = BASE_ORDER.outputToken

    const result = getFeeToken(input)

    expect(result).toEqual(expectedOutput)
  })

  it('should return inputToken when there is no fee token', () => {
    const input = { ...BASE_ORDER, executionData: { ...BASE_ORDER.executionData, executedFeeToken: null } }
    const expectedOutput = BASE_ORDER.inputToken

    const result = getFeeToken(input)

    expect(result).toEqual(expectedOutput)
  })
})
