import { assert, DEFAULT_PRECISION } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'

import { TEN_BIG_NUMBER } from 'const'

export interface TheGraphApi {
  getPrice(params: GetPriceParams): Promise<BigNumber | null>
  getPrices(params: GetPricesParams): Promise<GetPricesResult>
}

export interface GetPriceParams {
  networkId: number
  tokenId: number
  inWei?: boolean
}

export interface GetPricesParams {
  networkId: number
  tokenIds: number[]
  inWei?: boolean
}

interface GetPricesResult {
  [tokenId: number]: BigNumber | null
}

interface PriceEntry {
  priceInOwlNumerator: string
  priceInOwlDenominator: string
  token: {
    decimals?: number
  }
}

interface PricesResponse {
  data: {
    [tokenKey: string]: PriceEntry[]
  }
}

interface GqlError {
  errors: {
    locations: {
      line: number
      column: number
    }[]
    message: string
  }[]
}

type GqlResult = PricesResponse | GqlError

const isGqlError = (gqlResult: GqlResult): gqlResult is GqlError => 'errors' in gqlResult

export interface PriceEstimatorEndpoint {
  networkId: number
  url: string
}

export type TheGraphApiImplParams = PriceEstimatorEndpoint[]

export class TheGraphApiImpl {
  private urlByNetwork: { [networkId: number]: string } = {}

  public constructor(params: TheGraphApiImplParams) {
    this.urlByNetwork = params.reduce((acc, endpoint) => {
      acc[endpoint.networkId] = endpoint.url
      return acc
    }, {})
  }

  public async getPrice({ tokenId, ...params }: GetPriceParams): Promise<BigNumber | null> {
    // syntactic sugar
    const prices = this.getPrices({ ...params, tokenIds: [tokenId] })
    return prices[tokenId]
  }

  /**
   * Fetches prices for token based on TokenIds, in relation to OWL.
   * Price is returned in units by default. To return in WEI, set `inWei` to true.
   */
  public async getPrices({ networkId, tokenIds, inWei = false }: GetPricesParams): Promise<GetPricesResult> {
    const tokens = tokenIds.map((tokenId) => this.buildPartialPriceQuery(tokenId)).join('\n')
    const queryString = `{${tokens}}`

    try {
      const response = await this.query<PricesResponse>(networkId, queryString)

      return this.parsePricesResponse(response, inWei)
    } catch (e) {
      console.error(e)
      throw new Error(`Failed to query prices: ${e.message}`)
    }
  }

  private async query<T>(networkId: number, queryString: string): Promise<T> {
    const url = this.urlByNetwork[networkId]
    assert(url, `TheGraph instance is not available for network id ${networkId}`)

    const data = {
      query: queryString,
    }

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Request failed: [${response.status}] ${response.body}`)
    }

    const gqlResult = await response.json()

    if (isGqlError(gqlResult)) {
      throw new Error(`Query failed: ${gqlResult.errors[0].message}`)
    }

    return gqlResult
  }

  private buildPartialPriceQuery(tokenId: number): string {
    return `Token${tokenId}: prices(
  first: 1, 
  orderBy: batchId, 
  orderDirection: desc, 
  where: {token: "${tokenId}"}
) {
  priceInOwlNumerator
  priceInOwlDenominator
  token {
    decimals
  }
}`
  }

  private parsePricesResponse({ data }: PricesResponse, inWei: boolean): GetPricesResult {
    return Object.keys(data).reduce((acc, tokenKey) => {
      // not possible to have a key with only integers, thus `Token` prefix was added
      const tokenId = +tokenKey.replace('Token', '')

      // When there's no data for a token, return is null
      acc[tokenId] = data[tokenKey].length > 0 ? this.calculatePrice(data[tokenKey][0], inWei) : null
      return acc
    }, {})
  }

  private calculatePrice(priceEntry: PriceEntry, inWei: boolean): BigNumber {
    const {
      priceInOwlNumerator,
      priceInOwlDenominator,
      token: { decimals = DEFAULT_PRECISION },
    } = priceEntry

    const numerator = new BigNumber(priceInOwlNumerator)
    const denominator = new BigNumber(priceInOwlDenominator)

    const price = numerator.dividedBy(denominator)

    return inWei ? price.multipliedBy(TEN_BIG_NUMBER.exponentiatedBy(decimals)) : price
  }
}
