import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@cowprotocol/currency'

import { renderHook } from '@testing-library/react'
import useSWR, { SWRResponse } from 'swr'

import { useTokenRestriction } from './useTokenRestriction'

import { TokenRestriction } from '../api/fetchTokenRestriction'

jest.mock('swr', () => ({ __esModule: true, default: jest.fn() }))

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>

const TOKEN = new Token(SupportedChainId.MAINNET, '0x1234567890123456789012345678901234567890', 18, 'AMCx')
const NOT_RESTRICTED: TokenRestriction = { restricted: false }

function mockSwr(data: TokenRestriction | undefined, error: unknown): void {
  mockUseSWR.mockReturnValue({ data, error } as SWRResponse)
}

function render(): TokenRestriction | undefined {
  return renderHook(() => useTokenRestriction(TOKEN, 'de', true)).result.current
}

describe('useTokenRestriction', () => {
  it('returns the BFF answer', () => {
    mockSwr(NOT_RESTRICTED, undefined)

    expect(render()).toBe(NOT_RESTRICTED)
  })

  it('drops the previous answer when a revalidation failed', () => {
    mockSwr(NOT_RESTRICTED, new Error('503'))

    expect(render()).toBeUndefined()
  })
})
