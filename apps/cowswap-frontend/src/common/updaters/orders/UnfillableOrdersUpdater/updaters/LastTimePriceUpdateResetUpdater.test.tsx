import { useAtom } from 'jotai'

import { renderHook } from '@testing-library/react'
import ms from 'ms.macro'

import { LastTimePriceUpdateResetUpdater } from './LastTimePriceUpdateResetUpdater'

// Mock dependencies
jest.mock('jotai', () => ({
  useAtom: jest.fn(),
  atom: jest.fn(),
}))

jest.mock('jotai/utils', () => ({
  atomWithStorage: jest.fn(() => Symbol('orderLastTimePriceUpdateAtom')),
}))

jest.mock('@cowprotocol/core', () => ({
  getJotaiMergerStorage: jest.fn(),
}))

const mockedUseAtom = useAtom as jest.MockedFunction<typeof useAtom>

const ONE_DAY_MS = ms`1d`

describe('LastTimePriceUpdateResetUpdater', () => {
  const mockSetOrderLastTimePriceUpdate = jest.fn()
  let consoleDebugSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
  })

  afterEach(() => {
    consoleDebugSpy.mockRestore()
    jest.restoreAllMocks()
  })

  it('should not cleanup when all records are valid and recent', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const recentRecords = {
      'order-1': currentTime - 1000, // 1 second ago
      'order-2': currentTime - 3600000, // 1 hour ago
      'order-3': currentTime - ONE_DAY_MS + 1000, // Just under 1 day ago
    }

    mockedUseAtom.mockReturnValue([recentRecords, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).not.toHaveBeenCalled()
    expect(consoleDebugSpy).not.toHaveBeenCalled()
  })

  it('should remove expired records older than 1 day', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const mixedRecords = {
      'order-1': currentTime - 1000, // Recent
      'order-2': currentTime - ONE_DAY_MS - 1000, // Expired (just over 1 day)
      'order-3': currentTime - ONE_DAY_MS * 2, // Expired (2 days)
    }

    mockedUseAtom.mockReturnValue([mixedRecords, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).toHaveBeenCalledWith({
      'order-1': currentTime - 1000,
    })
    expect(consoleDebugSpy).toHaveBeenCalledWith('[LastTimePriceUpdateResetUpdater] removed 2 records.')
  })

  it('should remove invalid non-number records', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const recordsWithInvalidValues = {
      'order-1': currentTime - 1000,
      'order-2': 'invalid',
      'order-3': null,
      'order-4': undefined,
      'order-5': {},
    }

    mockedUseAtom.mockReturnValue([recordsWithInvalidValues, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).toHaveBeenCalledWith({
      'order-1': currentTime - 1000,
    })
    expect(consoleDebugSpy).toHaveBeenCalledWith('[LastTimePriceUpdateResetUpdater] removed 4 records.')
  })

  it('should handle mixed scenario with expired and invalid records', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const mixedRecords = {
      'order-1': currentTime - 1000, // Valid and recent
      'order-2': currentTime - ONE_DAY_MS - 1000, // Expired
      'order-3': 'invalid', // Invalid type
      'order-4': currentTime - 100, // Valid and recent
      'order-5': currentTime - ONE_DAY_MS * 5, // Expired (5 days)
    }

    mockedUseAtom.mockReturnValue([mixedRecords, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).toHaveBeenCalledWith({
      'order-1': currentTime - 1000,
      'order-4': currentTime - 100,
    })
    expect(consoleDebugSpy).toHaveBeenCalledWith('[LastTimePriceUpdateResetUpdater] removed 3 records.')
  })

  it('should handle empty initial state', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    mockedUseAtom.mockReturnValue([{}, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).not.toHaveBeenCalled()
    expect(consoleDebugSpy).not.toHaveBeenCalled()
  })

  it('should remove records at exactly 1 day threshold', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const recordsAtThreshold = {
      'order-1': currentTime - ONE_DAY_MS, // Exactly 1 day ago (should be removed)
      'order-2': currentTime - ONE_DAY_MS + 1, // Just under 1 day (should be kept)
    }

    mockedUseAtom.mockReturnValue([recordsAtThreshold, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).toHaveBeenCalledWith({
      'order-2': currentTime - ONE_DAY_MS + 1,
    })
    expect(consoleDebugSpy).toHaveBeenCalledWith('[LastTimePriceUpdateResetUpdater] removed 1 records.')
  })

  it('should remove all records when all are expired', () => {
    const currentTime = 1000000000
    jest.spyOn(Date, 'now').mockReturnValue(currentTime)

    const allExpiredRecords = {
      'order-1': currentTime - ONE_DAY_MS * 2,
      'order-2': currentTime - ONE_DAY_MS * 3,
      'order-3': currentTime - ONE_DAY_MS * 10,
    }

    mockedUseAtom.mockReturnValue([allExpiredRecords, mockSetOrderLastTimePriceUpdate] as never)

    renderHook(() => LastTimePriceUpdateResetUpdater())

    expect(mockSetOrderLastTimePriceUpdate).toHaveBeenCalledWith({})
    expect(consoleDebugSpy).toHaveBeenCalledWith('[LastTimePriceUpdateResetUpdater] removed 3 records.')
  })
})
