import { GetQuoteResponse } from '@cowprotocol/contracts'

import { parseUnits } from 'ethers/lib/utils'

const COW = '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59'
const USDC = '0xbe72E441BF55620febc26715db68d3494213D8Cb'
const FOUR_HOURS = 3600 * 4 * 1000
const DEFAULT_SELL_TOKEN = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' // WETH
const DEFAULT_APP_DATA = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const FEE_QUERY = `https://barn.api.cow.fi/sepolia/api/v1/quote`

const baseParams = {
  from: ZERO_ADDRESS,
  receiver: ZERO_ADDRESS,
  validTo: Math.ceil(Date.now() / 1000 + 500),
  appData: DEFAULT_APP_DATA,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  partiallyFillable: false,
}

const mockQuoteResponse = {
  quote: {
    // arb props here..
    sellToken: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
    buyToken: '0xbe72E441BF55620febc26715db68d3494213D8Cb',
    receiver: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    sellAmount: '1234567890',
    buyAmount: '1234567890',
    validTo: 0,
    appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
    feeAmount: '1234567890',
    kind: 'buy',
    partiallyFillable: true,
    sellTokenBalance: 'erc20',
    buyTokenBalance: 'erc20',
  },
  from: ZERO_ADDRESS,
}

function _assertFeeData(fee: GetQuoteResponse): void {
  if (typeof fee === 'string') {
    fee = JSON.parse(fee)
  }
  expect(fee).to.have.property('quote')
  expect(fee).to.have.property('expiration')
  expect(fee.quote).to.have.property('feeAmount')
}

describe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    const params = {
      sellToken: DEFAULT_SELL_TOKEN,
      buyToken: USDC,
      sellAmountBeforeFee: parseUnits('0.1', 18).toString(),
      kind: 'sell',
      fromDecimals: 18,
      toDecimals: 6,
      // BASE PARAMS
      ...baseParams,
    }

    // GIVEN: -
    // WHEN: Call fee API
    cy.request({
      method: 'POST',
      url: FEE_QUERY,
      body: params,
      log: true,
    })
      .its('body')
      // THEN: The API response has the expected data
      .should(_assertFeeData)
  })
})

// TODO: disable this test because it's not working - needs to be fixed
describe.skip('Fee: Complex fetch and persist fee', () => {
  const INPUT_AMOUNT = '0.1'

  // Needs to run first to pass because of Cypress async issues between tests
  it('Re-fetched when it expires', () => {
    // GIVEN: input token Fee expiration is always 6 hours from now
    const SIX_HOURS = FOUR_HOURS * 1.5
    const LATER_TIME = new Date(Date.now() + SIX_HOURS).toISOString()
    const LATER_FEE = {
      ...mockQuoteResponse,
      expiration: LATER_TIME,
    }

    // only override Date functions (default is to override all time based functions)
    cy.stubResponse({ method: 'POST', url: FEE_QUERY, alias: 'feeRequest', body: LATER_FEE })

    // GIVEN: user visits app, selects 0.1 WETH as sell, COW as buy
    // and goes AFK
    cy.visit('/#/11155111/swap')
    cy.swapSelectOutput(COW)
    cy.swapEnterInputAmount(DEFAULT_SELL_TOKEN, INPUT_AMOUNT)

    // set the Cypress clock to now (default is UNIX 0)
    cy.clock(Date.now(), ['Date'])

    // WHEN: The user comes back 4h later (so the fee quote is expired) (after a long sandwich eating sesh, dude was hungry)
    cy.tick(FOUR_HOURS).then(($clock) => {
      // THEN: a new fee request is made AHEAD of current (advanced) time
      cy.wait('@feeRequest')
        .its('response.body')
        .then(($body) => {
          const body = JSON.parse($body)
          // @ts-expect-error - cypress untyped method
          const mockedTime = new Date($clock.details().now)

          // THEN: fee time is properly stubbed and
          expect(body.expiration).to.equal(LATER_TIME)
          // THEN: the mocked later date is indeed less than the new fee (read: the fee is valid)
          expect(new Date(body.expiration)).to.be.greaterThan(mockedTime)
        })
    })
  })
})

// TODO: disable this test because it's not working - needs to be fixed
describe.skip('Fee: simple checks it exists', () => {
  const INPUT_AMOUNT = '0.1'
  const QUOTE_RESP = {
    ...mockQuoteResponse,
    // 1 min in future
    expiration: new Date(Date.now() + 60000).toISOString(),
  }

  it('Fetch fee when selecting both tokens', () => {
    // Stub responses from fee endpoint
    cy.stubResponse({
      method: 'POST',
      url: FEE_QUERY,
      alias: 'feeRequest',
      body: QUOTE_RESP,
    })
    // GIVEN: A user loads the swap page
    // WHEN: Select COW token as output and sells 0.1 WETH
    cy.visit('/#/11155111/swap')
    cy.swapSelectOutput(COW)
    cy.swapEnterInputAmount(DEFAULT_SELL_TOKEN, INPUT_AMOUNT)

    // THEN: The fee for selling WETH for COW is fetched from api endpoint
    cy.wait('@feeRequest').its('response.body').should(_assertFeeData)
  })
})

describe('Swap: Considering fee', () => {
  beforeEach(() => {
    // GIVEN: an initial selection of WETH-COW
    cy.visit('/#/11155111/swap')
  })

  it("Uses Uniswap price, if there's no tip", () => {
    // GIVEN: Swap WETH-COW
    // TODO: Create command for easy setting up a case (setup current selection)
    //
    // GIVEN: No fee
    // TODO: Create action for intercepting the API call
    //
    // WHEN: Users input amount
    //
    // THEN: He gets uniswap price
  })

  it("User can't trade when amount is smaller than minimumFee", () => {
    // GIVEN: Swap WETH-COW
    //
    // GIVEN: amount is smaller than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He cannot trade
  })

  it('User pays minimumFee for small trades', () => {
    // GIVEN: Swap WETH-COW
    //
    // GIVEN: amount is bigger than minimumFee, but trade is still small
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus minimal-trade
  })

  it('User pays more than minimumFee for big trades', () => {
    // GIVEN: Swap WETH-COW
    //
    // GIVEN: amount * "fee factor" is bigger than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus amount * "fee factor"
  })
})
