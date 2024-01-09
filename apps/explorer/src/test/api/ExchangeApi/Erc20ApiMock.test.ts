import BALANCES from '../../data/erc20Balances'
import ALLOWANCES from '../../data/erc20Allowances'
import { Erc20Api } from 'api/erc20/Erc20Api'
import { Erc20ApiMock } from 'api/erc20/Erc20ApiMock'
import { TxOptionalParams } from 'types'
import {
  USER_1,
  TOKEN_1,
  USER_2,
  TOKEN_6,
  CONTRACT,
  TOKEN_8,
  RECEIPT,
  USER_3,
  TOKEN_3,
  unregisteredTokens,
  FEE_TOKEN,
} from '../../data'
import { ZERO, ALLOWANCE_MAX_VALUE } from 'const'
import BN from 'bn.js'
import { clone } from '../../testHelpers'

const NETWORK_ID = 0

let instance: Erc20Api = new Erc20ApiMock({ balances: BALANCES, allowances: ALLOWANCES, tokens: unregisteredTokens })

describe('Basic view functions', () => {
  describe('balanceOf', () => {
    it('returns balance', async () => {
      const token1Balance = BALANCES[USER_1][TOKEN_1]
      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_1, networkId: NETWORK_ID })).toBe(
        token1Balance,
      )
    })

    it('returns 0 when not found', async () => {
      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_2, networkId: NETWORK_ID })).toBe(ZERO)
    })
  })

  describe('allowance', () => {
    it('returns allowance', async () => {
      const allowance = ALLOWANCES[USER_1][TOKEN_6][CONTRACT]
      expect(
        await instance.allowance({
          tokenAddress: TOKEN_6,
          userAddress: USER_1,
          spenderAddress: CONTRACT,
          networkId: NETWORK_ID,
        }),
      ).toBe(allowance)
    })

    it('user without allowance set returns 0', async () => {
      expect(
        await instance.allowance({
          tokenAddress: TOKEN_1,
          userAddress: USER_2,
          spenderAddress: CONTRACT,
          networkId: NETWORK_ID,
        }),
      ).toBe(ZERO)
    })

    it('token without allowance set returns 0', async () => {
      expect(
        await instance.allowance({
          tokenAddress: TOKEN_8,
          userAddress: USER_1,
          spenderAddress: CONTRACT,
          networkId: NETWORK_ID,
        }),
      ).toBe(ZERO)
    })

    it('spender allowance 0 returns 0', async () => {
      expect(
        await instance.allowance({
          tokenAddress: TOKEN_1,
          userAddress: USER_1,
          spenderAddress: CONTRACT,
          networkId: NETWORK_ID,
        }),
      ).toBe(ZERO)
    })
  })

  describe('totalSupply', () => {
    it('returns totalSupply', async () => {
      expect(await instance.totalSupply({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })).toBe(ALLOWANCE_MAX_VALUE)
    })
  })

  describe('name', () => {
    it('returns name', async () => {
      expect(await instance.name({ tokenAddress: FEE_TOKEN, networkId: NETWORK_ID })).toBe('Fee token')
    })

    it('returns name32bytes', async () => {
      expect(
        await instance.name32Bytes({
          tokenAddress: '0xF1290473E210b2108A85237fbCd7b6eb42Cc654F',
          networkId: NETWORK_ID,
        }),
      ).toBe('0x4865646765547261646500000000000000000000000000000000000000000000')
    })

    it("throws when there's no name 32bytes", async () => {
      try {
        await instance.name32Bytes({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/token does not implement 'name32Bytes'/)
      }
    })
    it("throws when there's no name", async () => {
      try {
        await instance.name({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/token does not implement 'name'/)
      }
    })
  })

  describe('symbol', () => {
    it('returns symbol', async () => {
      expect(await instance.symbol({ tokenAddress: FEE_TOKEN, networkId: NETWORK_ID })).toBe('FEET')
    })

    it('returns symbol32bytes', async () => {
      expect(
        await instance.symbol32Bytes({
          tokenAddress: '0xF1290473E210b2108A85237fbCd7b6eb42Cc654F',
          networkId: NETWORK_ID,
        }),
      ).toBe('0x4845444700000000000000000000000000000000000000000000000000000000')
    })

    it("throws when there's no symbol 32bytes", async () => {
      try {
        await instance.symbol32Bytes({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/token does not implement 'symbol32Bytes'/)
      }
    })

    it("throws when there's no symbol", async () => {
      try {
        await instance.symbol({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/token does not implement 'symbol'/)
      }
    })
  })

  describe('decimals', () => {
    it('returns decimals', async () => {
      expect(await instance.decimals({ tokenAddress: FEE_TOKEN, networkId: NETWORK_ID })).toBe(18)
    })
    it("throws when there's no decimals", async () => {
      try {
        await instance.decimals({ tokenAddress: TOKEN_1, networkId: NETWORK_ID })
        fail('Should not reach')
      } catch (e) {
        expect(e.message).toMatch(/token does not implement 'decimals'/)
      }
    })
  })
})

describe('Write functions', () => {
  const mockFunction = jest.fn()
  const txOptionalParams: TxOptionalParams = {
    onSentTransaction: mockFunction,
  }
  function resetInstance(): void {
    instance = new Erc20ApiMock({ balances: clone(BALANCES), allowances: clone(ALLOWANCES) })
  }

  beforeEach(mockFunction.mockClear)
  beforeEach(resetInstance)

  describe('approve', () => {
    const amount = new BN('5289375492345723')
    it('allowance is set', async () => {
      const result = await instance.approve({
        userAddress: USER_1,
        tokenAddress: TOKEN_1,
        spenderAddress: USER_2,
        amount,
        txOptionalParams,
        networkId: NETWORK_ID,
      })

      expect(
        await instance.allowance({
          tokenAddress: TOKEN_1,
          userAddress: USER_1,
          spenderAddress: USER_2,
          networkId: NETWORK_ID,
        }),
      ).toBe(amount)
      expect(result).toBe(RECEIPT)
    })

    it('calls optional callback', async () => {
      await instance.approve({
        userAddress: USER_1,
        tokenAddress: TOKEN_1,
        spenderAddress: USER_2,
        amount,
        txOptionalParams,
        networkId: NETWORK_ID,
      })
      expect(mockFunction.mock.calls.length).toBe(1)
    })
  })

  describe('transfer', () => {
    const amount = new BN('987542934752394')
    it('transfers', async () => {
      const contractBalance = await instance.balanceOf({
        tokenAddress: TOKEN_1,
        userAddress: CONTRACT,
        networkId: NETWORK_ID,
      })
      const userBalance = await instance.balanceOf({
        tokenAddress: TOKEN_1,
        userAddress: USER_2,
        networkId: NETWORK_ID,
      })

      const result = await instance.transfer({
        userAddress: CONTRACT,
        tokenAddress: TOKEN_1,
        toAddress: USER_2,
        amount,
        networkId: NETWORK_ID,
      })

      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: CONTRACT, networkId: NETWORK_ID })).toEqual(
        contractBalance.sub(amount),
      )
      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_2, networkId: NETWORK_ID })).toEqual(
        userBalance.add(amount),
      )
      expect(result).toBe(RECEIPT)
    })

    it('does not transfer when balance is insufficient', async () => {
      // TODO: after hours, couldn't figure out a way to check for the AssertionError using expect().toThrow()
      await instance
        .transfer({ userAddress: USER_2, tokenAddress: TOKEN_1, toAddress: CONTRACT, amount, networkId: NETWORK_ID })
        .then(() => fail('Should not succeed'))
        .catch((e) => {
          expect(e.message).toMatch(/^The user doesn't have enough balance$/)
        })
    })

    it('calls optional callback', async () => {
      await instance.transfer({
        userAddress: CONTRACT,
        tokenAddress: TOKEN_1,
        toAddress: USER_2,
        amount,
        txOptionalParams,
        networkId: NETWORK_ID,
      })
      expect(mockFunction.mock.calls.length).toBe(1)
    })
  })
  describe('transferFrom', () => {
    const amount = new BN('78565893578')

    it('transfers and allowance is deduced', async () => {
      const expectedUser1Balance = (
        await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_1, networkId: NETWORK_ID })
      ).sub(amount)
      const expectedUser2Balance = (
        await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_2, networkId: NETWORK_ID })
      ).add(amount)

      await instance.approve({
        userAddress: USER_1,
        tokenAddress: TOKEN_1,
        spenderAddress: USER_3,
        amount,
        networkId: NETWORK_ID,
      })

      const result = await instance.transferFrom({
        userAddress: USER_3,
        tokenAddress: TOKEN_1,
        fromAddress: USER_1,
        toAddress: USER_2,
        amount,
        networkId: NETWORK_ID,
      })

      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_1, networkId: NETWORK_ID })).toEqual(
        expectedUser1Balance,
      )
      expect(await instance.balanceOf({ tokenAddress: TOKEN_1, userAddress: USER_2, networkId: NETWORK_ID })).toEqual(
        expectedUser2Balance,
      )
      expect(
        (
          await instance.allowance({
            tokenAddress: TOKEN_1,
            userAddress: USER_1,
            spenderAddress: USER_3,
            networkId: NETWORK_ID,
          })
        ).toString(),
      ).toEqual(ZERO.toString())
      expect(result).toBe(RECEIPT)
    })

    it('does not transfer when balance is insufficient', async () => {
      await instance.approve({
        userAddress: USER_2,
        tokenAddress: TOKEN_3,
        spenderAddress: USER_3,
        amount,
        networkId: NETWORK_ID,
      })

      await instance
        .transferFrom({
          userAddress: USER_3,
          tokenAddress: TOKEN_3,
          fromAddress: USER_2,
          toAddress: USER_1,
          amount,
          networkId: NETWORK_ID,
        })
        .then(() => {
          fail('Should not succeed')
        })
        .catch((e) => {
          expect(e.message).toMatch(/^The user doesn't have enough balance$/)
        })
    })

    it('does not transfer when allowance is insufficient', async () => {
      await instance
        .transferFrom({
          userAddress: USER_3,
          tokenAddress: TOKEN_3,
          fromAddress: USER_1,
          toAddress: USER_2,
          amount,
          networkId: NETWORK_ID,
        })
        .then(() => {
          fail('Should not succeed')
        })
        .catch((e) => {
          expect(e.message).toMatch(/^Not allowed to perform this transfer$/)
        })
    })

    it('calls optional callback', async () => {
      await instance.approve({
        userAddress: USER_1,
        tokenAddress: TOKEN_1,
        spenderAddress: USER_3,
        amount,
        networkId: NETWORK_ID,
      })
      await instance.transferFrom({
        userAddress: USER_3,
        tokenAddress: TOKEN_1,
        fromAddress: USER_1,
        toAddress: USER_2,
        amount,
        txOptionalParams,
        networkId: NETWORK_ID,
      })
      expect(mockFunction.mock.calls.length).toBe(1)
    })
  })
})
