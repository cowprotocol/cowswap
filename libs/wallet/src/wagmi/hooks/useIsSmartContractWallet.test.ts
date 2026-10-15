import { AccountType } from '@cowprotocol/types'

import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import { useConnectionType } from './useConnectionType'
import { useIsSmartContractWallet } from './useIsSmartContractWallet'
import { useIsSafeWallet } from './useWalletMetadata'

import { ConnectionType } from '../../api/types'

jest.mock('wagmi', () => ({
  useConnection: jest.fn(() => ({ chainId: 1 })),
  usePublicClient: jest.fn(),
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('../../api/hooks', () => ({
  useWalletInfo: jest.fn(() => ({ account: '0x1234567890123456789012345678901234567890' })),
}))

jest.mock('./useConnectionType', () => ({
  useConnectionType: jest.fn(),
}))

jest.mock('./useWalletMetadata', () => ({
  useIsSafeWallet: jest.fn(),
}))

const mockUseSWR = useSWR as jest.Mock
const mockUseConnectionType = useConnectionType as jest.MockedFunction<typeof useConnectionType>
const mockUseIsSafeWallet = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>

function mockAccountType(accountType: AccountType | undefined): void {
  mockUseSWR.mockReturnValue({ data: accountType })
}

describe('useIsSmartContractWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseConnectionType.mockReturnValue(ConnectionType.INJECTED)
    mockUseIsSafeWallet.mockReturnValue(false)
  })

  it('returns false for an EOA', () => {
    mockAccountType(AccountType.EOA)

    const { result } = renderHook(() => useIsSmartContractWallet())

    expect(result.current).toBe(false)
  })

  it('returns true for an account with contract code', () => {
    mockAccountType(AccountType.SMART_CONTRACT)

    const { result } = renderHook(() => useIsSmartContractWallet())

    expect(result.current).toBe(true)
  })

  it.each([AccountType.EOA, AccountType.EIP7702EOA, undefined])(
    'returns true for Base Account when the account type is %s',
    (accountType) => {
      mockAccountType(accountType)
      mockUseConnectionType.mockReturnValue(ConnectionType.BASE_ACCOUNT)

      const { result } = renderHook(() => useIsSmartContractWallet())

      expect(result.current).toBe(true)
    },
  )
})
