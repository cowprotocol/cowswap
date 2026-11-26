import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useConnection, useSwitchChain } from 'wagmi'

import { act, renderHook, type RenderHookResult } from '@testing-library/react'

import { useSwitchWalletToTradeNetwork } from './useSwitchWalletToTradeNetwork'

jest.mock('wagmi', () => ({ useConnection: jest.fn(), useSwitchChain: jest.fn() }))

const ETHEREUM = 1
const PLASMA = 9745
const BASE = 8453

const switchChain = jest.fn()

interface SwitchProps {
  ticker: string
  tradeChainId: number | undefined
}

async function flushEffects(): Promise<void> {
  await act(async () => undefined)
}

function renderSwitch(
  ticker: string,
  tradeChainId: number | undefined,
  queryClient = new QueryClient(),
): RenderHookResult<void, SwitchProps> {
  const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return renderHook(({ ticker, tradeChainId }: SwitchProps) => useSwitchWalletToTradeNetwork(ticker, tradeChainId), {
    initialProps: { ticker, tradeChainId },
    wrapper,
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
  it('asks a wallet on another network to switch to the trade network', async () => {
    setConnection({ status: 'connected', chainId: PLASMA })

    renderSwitch('NVDA', ETHEREUM)
    await flushEffects()

    expect(switchChain).toHaveBeenCalledWith({ chainId: ETHEREUM })
  })

  it('does not ask a wallet already on the trade network', async () => {
    setConnection({ status: 'connected', chainId: ETHEREUM })

    renderSwitch('NVDA', ETHEREUM)
    await flushEffects()

    expect(switchChain).not.toHaveBeenCalled()
  })

  it('leaves the wallet to a switch another effect of the page already asked for', async () => {
    setConnection({ status: 'connected', chainId: PLASMA })
    const queryClient = new QueryClient()

    renderSwitch('NVDA', ETHEREUM, queryClient)
    void queryClient
      .getMutationCache()
      .build(queryClient, { mutationKey: ['switchChain'], mutationFn: () => new Promise(() => undefined) })
      .execute({ chainId: BASE })
    await flushEffects()

    expect(switchChain).not.toHaveBeenCalled()
  })

  it('waits for the wallet to reconnect', async () => {
    setConnection({ status: 'reconnecting' })
    const { rerender } = renderSwitch('NVDA', ETHEREUM)
    await flushEffects()

    expect(switchChain).not.toHaveBeenCalled()

    setConnection({ status: 'connected', chainId: PLASMA })
    rerender({ ticker: 'NVDA', tradeChainId: ETHEREUM })
    await flushEffects()

    expect(switchChain).toHaveBeenCalledTimes(1)
  })

  it('asks once per asset page, so a rejected or later wallet switch is left to the user', async () => {
    setConnection({ status: 'connected', chainId: ETHEREUM })
    const { rerender } = renderSwitch('NVDA', ETHEREUM)
    await flushEffects()

    setConnection({ status: 'connected', chainId: PLASMA })
    rerender({ ticker: 'NVDA', tradeChainId: ETHEREUM })
    await flushEffects()

    expect(switchChain).not.toHaveBeenCalled()

    rerender({ ticker: 'TSLA', tradeChainId: ETHEREUM })
    await flushEffects()

    expect(switchChain).toHaveBeenCalledWith({ chainId: ETHEREUM })
  })
})
