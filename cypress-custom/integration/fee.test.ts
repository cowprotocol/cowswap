import { SupportedChainId as ChainId } from '../../src/custom/constants/chains'
import { WETH9 as WETH } from '@uniswap/sdk-core'
import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { FeeQuoteParams, FeeInformation } from '../../src/custom/priceApi/price'
import { parseUnits } from 'ethers/lib/utils'

const DAI = '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735'
const FOUR_HOURS = 3600 * 4 * 1000
const DEFAULT_SELL_TOKEN = WETH[ChainId.RINKEBY]

const getFeeQuery = ({ sellToken, buyToken, amount, kind }: Omit<FeeQuoteParams, 'chainId'>) =>
  `https://protocol-rinkeby.dev.gnosisdev.com/api/v1/fee?sellToken=${sellToken}&buyToken=${buyToken}&amount=${amount}&kind=${kind}`

function _assertFeeData(fee: FeeInformation | string): void {
  if (typeof fee === 'string') {
    fee = JSON.parse(fee)
  }
  expect(fee).to.have.property('amount')
  expect(fee).to.have.property('expirationDate')
}

/* Fee not currently being saved in local so commenting this out
 * for now - may be re-implemented in the future so keeping

function _getLocalStorage(): Cypress.Chainable<Storage> {
  return cy.window().then(window => window.localStorage)
}

function _getChainFeeStorage(
  networkKey: string,
  token?: string
): Cypress.Chainable<{ [t: string]: FeeInformationObject }> {
  return (
    _getLocalStorage()
      .its(FEE_QUOTES_LOCAL_STORAGE_KEY)
      // To properly return this we need .should and an expectation
      .should(feeQuotesStorage => {
        expect(JSON.parse(feeQuotesStorage)).to.have.property(networkKey)
        token && expect(JSON.parse(feeQuotesStorage)[RINKEBY]).to.have.property(token)
      })
      .then(fee => JSON.parse(fee)[networkKey])
  )
}

function _assertFeeFetched(token: string): Cypress.Chainable {
  return _getChainFeeStorage(RINKEBY, token).then(feeQuoteData => {
    expect(feeQuoteData).to.exist
    expect(feeQuoteData).to.have.property(token)

    // THEN: The quote has the expected information
    const fee = feeQuoteData[token].fee
    _assertFeeData(fee)
  })
} */

describe('Fee endpoint', () => {
  it('Returns the expected info', () => {
    const FEE_QUERY = getFeeQuery({
      sellToken: DEFAULT_SELL_TOKEN.address,
      buyToken: DAI,
      amount: parseUnits('0.1', DEFAULT_SELL_TOKEN.decimals).toString(),
      kind: OrderKind.SELL,
    })

    // GIVEN: -
    // WHEN: Call fee API
    cy.request(FEE_QUERY)
      .its('body')
      // THEN: The API response has the expected data
      .should(_assertFeeData)
  })
})

describe('Fee: Complex fetch and persist fee', () => {
  const INPUT_AMOUNT = '0.1'
  const FEE_QUERY = getFeeQuery({
    sellToken: DEFAULT_SELL_TOKEN.address,
    buyToken: DAI,
    amount: parseUnits(INPUT_AMOUNT, DEFAULT_SELL_TOKEN.decimals).toString(),
    kind: OrderKind.SELL,
  })

  // Needs to run first to pass because of Cypress async issues between tests
  it('Re-fetched when it expires', () => {
    // GIVEN: input token Fee expiration is always 6 hours from now
    const SIX_HOURS = FOUR_HOURS * 1.5
    const LATER_TIME = new Date(Date.now() + SIX_HOURS).toISOString()
    const LATER_FEE = {
      expirationDate: LATER_TIME,
      amount: '0',
    }

    // only override Date functions (default is to override all time based functions)
    cy.stubResponse({ url: FEE_QUERY, alias: 'feeRequest', body: LATER_FEE })

    // GIVEN: user visits app, selects 0.1 WETH as sell, DAI as buy
    // and goes AFK
    cy.visit('/swap')
    cy.swapSelectOutput(DAI)
    cy.swapEnterInputAmount(DEFAULT_SELL_TOKEN.address, INPUT_AMOUNT)

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
          expect(body.expirationDate).to.equal(LATER_TIME)
          // THEN: the mocked later date is indeed less than the new fee (read: the fee is valid)
          expect(new Date(body.expirationDate)).to.be.greaterThan(mockedTime)
        })
    })
  })
})

describe('Fee: simple checks it exists', () => {
  const INPUT_AMOUNT = '0.1'
  const FEE_QUERY = getFeeQuery({
    sellToken: DEFAULT_SELL_TOKEN.address,
    buyToken: DAI,
    amount: parseUnits(INPUT_AMOUNT, DEFAULT_SELL_TOKEN.decimals).toString(),
    kind: OrderKind.SELL,
  })
  const FEE_RESP = {
    // 1 min in future
    expirationDate: new Date(Date.now() + 60000).toISOString(),
    amount: parseUnits('0.05', DEFAULT_SELL_TOKEN.decimals).toString(),
  }

  it('Fetch fee when selecting both tokens', () => {
    // Stub responses from fee endpoint
    cy.stubResponse({
      url: FEE_QUERY,
      alias: 'feeRequest',
      body: FEE_RESP,
    })
    // GIVEN: A user loads the swap page
    // WHEN: Select DAI token as output and sells 0.1 WETH
    cy.visit('/swap')
    cy.swapSelectOutput(DAI)
    cy.swapEnterInputAmount(DEFAULT_SELL_TOKEN.address, INPUT_AMOUNT)

    // THEN: The fee for selling WETH for DAI is fetched from api endpoint
    cy.wait('@feeRequest').its('response.body').should(_assertFeeData)
  })
})

describe('Swap: Considering fee', () => {
  beforeEach(() => {
    // GIVEN: an initial selection of WETH-DAI
    cy.visit('/swap')
  })

  it("Uses Uniswap price, if there's no tip", () => {
    // GIVEN: Swap WETH-DAI
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
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount is smaller than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He cannot trade
  })

  it('User pays minimumFee for small trades', () => {
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount is bigger than minimumFee, but trade is still small
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus minimal-trade
  })

  it('User pays more than minimumFee for big trades', () => {
    // GIVEN: Swap WETH-DAI
    //
    // GIVEN: amount * "fee factor" is bigger than minimumFee
    //
    // WHEN: Users input amount
    //
    // THEN: He gets Uniswap price minus amount * "fee factor"
  })
})
