import { settleTwapOrder } from './settleTwapOrder'
import { useTwapOrderCreationContext } from '../hooks/useTwapOrderCreationContext'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { COW } from 'legacy/constants/tokens'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TWAPOrder } from '../types'
import { WETH_GOERLI } from 'legacy/utils/goerli/constants'
import { renderHook } from '@testing-library/react-hooks'
import { useUpdateAtom } from 'jotai/utils'
import { walletInfoAtom } from 'modules/wallet/api/state'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'
import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTokenContract } from 'legacy/hooks/useContract'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { useEffect } from 'react'

jest.mock('modules/wallet/web3-react/hooks/useSafeAppsSdk')
jest.mock('modules/advancedOrders/hooks/useComposableCowContract')
jest.mock('common/hooks/useNeedsApproval')
jest.mock('legacy/hooks/useContract')
jest.mock('common/hooks/useTradeSpenderAddress')

const chainId = SupportedChainId.GOERLI

const order: TWAPOrder = {
  sellAmount: CurrencyAmount.fromRawAmount(COW[chainId], 100_000_000),
  buyAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, 5_000),
  receiver: '0xca063a2ab07491ee991dcecb456d1265f842b568',
  numOfParts: 5,
  startTime: 1497076708,
  timeInterval: 350,
  span: 0,
}
const useSafeAppsSdkMock = useSafeAppsSdk as jest.MockedFunction<typeof useSafeAppsSdk>
const useComposableCowContractMock = useComposableCowContract as jest.MockedFunction<typeof useComposableCowContract>
const useNeedsApprovalMock = useNeedsApproval as jest.MockedFunction<typeof useNeedsApproval>
const useTokenContractMock = useTokenContract as jest.MockedFunction<typeof useTokenContract>
const useTradeSpenderAddressMock = useTradeSpenderAddress as jest.MockedFunction<typeof useTradeSpenderAddress>

describe('settleTwapOrder - integration test', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1497076708000)

    useSafeAppsSdkMock.mockReturnValue({ txs: { send: () => Promise.resolve({ safeTxHash: '0x00b' }) } } as any)
    useComposableCowContractMock.mockReturnValue({
      interface: { encodeFunctionData: () => '0xCREATE_COW_TX_DATA' },
    } as any)
    useNeedsApprovalMock.mockReturnValue(true)
    useTokenContractMock.mockReturnValue({ interface: { encodeFunctionData: () => '0xAPPROVE_TX_DATA' } } as any)
    useTradeSpenderAddressMock.mockReturnValue('0xes8p7e9n3dbedr4e7caf8451050d1948be717679')
  })

  it('Should send a bundle of transactions to Safe with a TWAP order creation', async () => {
    const { result } = renderHook(() => {
      const updateWalletInfo = useUpdateAtom(walletInfoAtom)

      useEffect(() => {
        updateWalletInfo({ chainId })
      }, [updateWalletInfo])

      const context = useTwapOrderCreationContext(order.sellAmount)

      if (!context) return null

      return settleTwapOrder(order, context)
    })

    expect(await result.current).toEqual({ safeTxHash: '0x00b' })
  })
})
