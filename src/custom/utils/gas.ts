import { TransactionResponse } from '@ethersproject/providers'
import { GASNOW_PRICE_ENDPOINT } from 'constants/index'
import { Overrides } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

interface PriceEstimate {
  rapid: number
  fast: number
  slow: number
  standard: number
  timestamp?: number
}

export async function getGasPriceEstimate(): Promise<PriceEstimate | void> {
  try {
    const json = await fetch(GASNOW_PRICE_ENDPOINT)
    const estimate = await json.json()

    if (estimate.code === 200) {
      return estimate.data
    }
  } catch (err) {
    console.log(`Gas estimation fetch failed`, err)
    return
  }
}

export async function applyCustomGasPrice(fn: (options: Overrides) => TransactionResponse | Promise<any>) {
  const options: Overrides = {}
  const gasPriceData = await getGasPriceEstimate()

  if (gasPriceData) {
    options.maxFeePerGas = parseUnits(String(gasPriceData?.rapid), 'wei')
  }

  return fn(options)
}
