import { useConfig, useWalletClient } from 'wagmi'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import type { CowShedHooks } from '@cowprotocol/sdk-cow-shed'
import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { RecoverSigningStep, useRecoverFundsFromProxy } from './useRecoverFundsFromProxy'

import { recoverFundsFromProxy, RecoverFundsFromProxyParams } from '../services/recoverFundsFromProxy.service'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('wagmi', () => ({
  useWalletClient: jest.fn(),
  useConfig: jest.fn(),
}))

jest.mock('../services/recoverFundsFromProxy.service', () => ({
  recoverFundsFromProxy: jest.fn(),
}))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const PROXY = '0x2222222222222222222222222222222222222222'
const TOKEN = '0x4444444444444444444444444444444444444444'
const TX_HASH = '0x5555555555555555555555555555555555555555555555555555555555555555'
const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletClientMock = useWalletClient as jest.MockedFunction<typeof useWalletClient>
const useConfigMock = useConfig as jest.MockedFunction<typeof useConfig>
const recoverFundsFromProxyMock = recoverFundsFromProxy as jest.MockedFunction<typeof recoverFundsFromProxy>

interface PendingRecovery {
  getParams: () => RecoverFundsFromProxyParams | undefined
  resolve: (txHash: string) => void
  reject: (error: Error) => void
}

function mockPendingRecovery(): PendingRecovery {
  let params: RecoverFundsFromProxyParams | undefined
  let resolve: (txHash: string) => void = () => undefined
  let reject: (error: Error) => void = () => undefined

  recoverFundsFromProxyMock.mockImplementation((serviceParams) => {
    params = serviceParams
    return new Promise<string>((res, rej) => {
      resolve = res
      reject = rej
    })
  })

  return {
    getParams: () => params,
    resolve: (txHash) => resolve(txHash),
    reject: (error) => reject(error),
  }
}

function renderReadyHook(): ReturnType<typeof renderHook<ReturnType<typeof useRecoverFundsFromProxy>, unknown>> {
  useWalletClientMock.mockReturnValue({
    data: { account: { address: ACCOUNT } },
  } as unknown as ReturnType<typeof useWalletClient>)

  const cowShedHooks = {
    proxyOf: jest.fn(() => PROXY),
    getFactoryAddress: jest.fn(() => '0x3333333333333333333333333333333333333333'),
  } as unknown as CowShedHooks
  const tokenBalance = { quotient: { toString: () => '1000' } } as unknown as CurrencyAmount<Currency>

  return renderHook(() =>
    useRecoverFundsFromProxy({
      cowShedHooks,
      selectedTokenAddress: TOKEN,
      tokenBalance,
      isNativeToken: false,
    }),
  )
}

describe('useRecoverFundsFromProxy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useWalletInfoMock.mockReturnValue({
      account: ACCOUNT,
      chainId: SupportedChainId.MAINNET,
    } as ReturnType<typeof useWalletInfo>)
    useWalletClientMock.mockReturnValue({ data: undefined } as ReturnType<typeof useWalletClient>)
    useConfigMock.mockReturnValue({} as ReturnType<typeof useConfig>)
  })

  it('uses the selected proxy SDK', () => {
    const proxyOf = jest.fn(() => PROXY)
    const cowShedHooks = {
      proxyOf,
      getFactoryAddress: jest.fn(() => '0x3333333333333333333333333333333333333333'),
    } as unknown as CowShedHooks

    const { result } = renderHook(() =>
      useRecoverFundsFromProxy({
        cowShedHooks,
        selectedTokenAddress: undefined,
        tokenBalance: null,
        isNativeToken: false,
      }),
    )

    expect(proxyOf).toHaveBeenCalledWith(ACCOUNT)
    expect(result.current.proxyAddress).toBe(PROXY)
  })

  it('does not call proxyOf for a non-EVM chain', () => {
    useWalletInfoMock.mockReturnValue({
      account: ACCOUNT,
      chainId: SupportedChainId.SOLANA,
    } as ReturnType<typeof useWalletInfo>)
    const proxyOf = jest.fn(() => PROXY)
    const cowShedHooks = {
      proxyOf,
      getFactoryAddress: jest.fn(() => '0x3333333333333333333333333333333333333333'),
    } as unknown as CowShedHooks

    const { result } = renderHook(() =>
      useRecoverFundsFromProxy({
        cowShedHooks,
        selectedTokenAddress: undefined,
        tokenBalance: null,
        isNativeToken: false,
      }),
    )

    expect(proxyOf).not.toHaveBeenCalled()
    expect(result.current.proxyAddress).toBeUndefined()
  })

  it('keeps each signing step until the wallet rejects, then resets it', async () => {
    const recovery = mockPendingRecovery()
    const { result } = renderReadyHook()

    let callbackPromise: Promise<string | undefined> = Promise.resolve(undefined)
    act(() => {
      callbackPromise = result.current.callback()
    })

    expect(result.current.txSigningStep).toBe(RecoverSigningStep.SIGN_RECOVER_FUNDS)

    act(() => {
      recovery.getParams()?.onBeforeTransactionSign?.()
    })

    expect(result.current.txSigningStep).toBe(RecoverSigningStep.SIGN_TRANSACTION)

    await act(async () => {
      recovery.reject(new Error('User rejected the request.'))
      await expect(callbackPromise).rejects.toThrow('User rejected the request.')
    })

    expect(result.current.txSigningStep).toBeNull()
  })

  it('resets the signing step after the transaction is sent', async () => {
    const recovery = mockPendingRecovery()
    const { result } = renderReadyHook()

    let callbackPromise: Promise<string | undefined> = Promise.resolve(undefined)
    act(() => {
      callbackPromise = result.current.callback()
    })

    await act(async () => {
      recovery.getParams()?.onBeforeTransactionSign?.()
      recovery.resolve(TX_HASH)
      await expect(callbackPromise).resolves.toBe(TX_HASH)
    })

    expect(result.current.txSigningStep).toBeNull()
  })
})
