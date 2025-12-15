import { AccountType } from '@cowprotocol/types'

import { render } from '@testing-library/react'

import { BridgingEnabledUpdater } from './BridgingEnabledUpdater'

import { Routes } from '../constants/routes'

jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useSetIsBridgingEnabled: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useWalletInfo: jest.fn(),
  useAccountType: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  ...jest.requireActual('modules/trade'),
  useTradeTypeInfo: jest.fn(),
}))

const { useSetIsBridgingEnabled } = require('@cowprotocol/common-hooks')
const mockUseSetIsBridgingEnabled = useSetIsBridgingEnabled as jest.MockedFunction<typeof useSetIsBridgingEnabled>
const { useWalletInfo, useAccountType } = require('@cowprotocol/wallet')

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseAccountType = useAccountType as jest.MockedFunction<typeof useAccountType>
const { useTradeTypeInfo } = require('modules/trade')
const mockUseTradeTypeInfo = useTradeTypeInfo as jest.MockedFunction<typeof useTradeTypeInfo>

describe('BridgingEnabledUpdater', () => {
  const setIsBridgingEnabled = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSetIsBridgingEnabled.mockReturnValue(setIsBridgingEnabled)
    mockUseWalletInfo.mockReturnValue({ account: '0x123' })
    mockUseAccountType.mockReturnValue(AccountType.EOA)
    mockUseTradeTypeInfo.mockReturnValue({ route: Routes.SWAP })
  })

  it('disables bridging for smart contract wallets', () => {
    mockUseAccountType.mockReturnValue(AccountType.SMART_CONTRACT)

    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabled).toHaveBeenCalledWith(false)
  })

  it('enables bridging on swap route when the wallet is compatible', () => {
    render(<BridgingEnabledUpdater />)

    expect(setIsBridgingEnabled).toHaveBeenCalledWith(true)
  })
})
