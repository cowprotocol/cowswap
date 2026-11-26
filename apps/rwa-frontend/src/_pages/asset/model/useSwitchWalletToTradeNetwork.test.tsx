import { useConnection, useSwitchChain } from 'wagmi'

import { renderHook, type RenderHookResult } from '@testing-library/react'

import { useSwitchWalletToTradeNetwork } from './useSwitchWalletToTradeNetwork'

jest.mock('wagmi', () => ({ useConnection: jest.fn(), useSwitchChain: jest.fn() }))

const ETHEREUM = 1
const PLASMA = 9745

const switchChain = jest.fn()

interface SwitchProps {
  ticker: string
  tradeChainId: number | undefined
}

function renderSwitch(ticker: string, tradeChainId: number | undefined): RenderHookResult<void, SwitchProps> {
  return renderHook(({ ticker, tradeChainId }: SwitchProps) => useSwitchWalletToTradeNetwork(ticker, tradeChainId), {
    initialProps: { ticker, tradeChainId },
  })
}

function setConnection(connection: { status: string; chainId?: number }): void {
  jest.mocked(useConnection).mockReturnValue(connection as ReturnType<typeof useConnection>)
}

beforeEach(() => {
  switchChain.mockReset()
  jest.mocked(useSwitchChain).mockReturnValue({ mutate: switchChain } as unknown as ReturnType<typeof useSwitchChain>)
})

describe('useSwitchWalletToTradeNetwork', () => {
  it('asks a wallet on another network to switch to the trade network', () => {
    setConnection({ status: 'connected', chainId: PLASMA })

    renderSwitch('NVDA', ETHEREUM)

    expect(switchChain).toHaveBeenCalledWith({ chainId: ETHEREUM })
  })

  it('does not ask a wallet already on the trade network', () => {
    setConnection({ status: 'connected', chainId: ETHEREUM })

    renderSwitch('NVDA', ETHEREUM)

    expect(switchChain).not.toHaveBeenCalled()
  })

  it('waits for the wallet to reconnect', () => {
    setConnection({ status: 'reconnecting' })
    const { rerender } = renderSwitch('NVDA', ETHEREUM)

    expect(switchChain).not.toHaveBeenCalled()

    setConnection({ status: 'connected', chainId: PLASMA })
    rerender({ ticker: 'NVDA', tradeChainId: ETHEREUM })

    expect(switchChain).toHaveBeenCalledTimes(1)
  })

  it('asks once per asset page, so a rejected or later wallet switch is left to the user', () => {
    setConnection({ status: 'connected', chainId: ETHEREUM })
    const { rerender } = renderSwitch('NVDA', ETHEREUM)

    setConnection({ status: 'connected', chainId: PLASMA })
    rerender({ ticker: 'NVDA', tradeChainId: ETHEREUM })

    expect(switchChain).not.toHaveBeenCalled()

    rerender({ ticker: 'TSLA', tradeChainId: ETHEREUM })

    expect(switchChain).toHaveBeenCalledWith({ chainId: ETHEREUM })
  })
})
