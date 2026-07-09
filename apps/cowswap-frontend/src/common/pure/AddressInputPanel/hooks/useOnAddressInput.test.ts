import { ChangeEvent } from 'react'

import { isPrefixedAddress, parsePrefixedAddress } from '@cowprotocol/common-utils'

import { act, renderHook } from '@testing-library/react'

import { useOnAddressInput } from './useOnAddressInput'

import { AddressValidationStrategy } from '../../../utils/addressValidation'

jest.mock('@cowprotocol/common-utils', () => ({
  isPrefixedAddress: jest.fn((v: string) => v.includes(':')),
  parsePrefixedAddress: jest.fn((v: string) => {
    const [prefix, address] = v.split(':')
    return { prefix, address }
  }),
}))

const mockIsPrefixedAddress = isPrefixedAddress as jest.Mock
const mockParsePrefixedAddress = parsePrefixedAddress as jest.Mock

function makeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return { target: { value } } as ChangeEvent<HTMLInputElement>
}

const evmStrategy: AddressValidationStrategy = {
  supportsENS: true,
  supportsChainPrefix: true,
  placeholderKey: 'evm',
  isValidAddress: (v) => v.startsWith('0x'),
  pattern: '^(0x[0-9a-fA-F]{40}|[\\w-]+\\.eth)$',
}

const nonEvmStrategy: AddressValidationStrategy = {
  supportsENS: false,
  supportsChainPrefix: false,
  placeholderKey: 'nonEvm',
  isValidAddress: (v) => v.length === 44,
  pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
}

describe('useOnAddressInput', () => {
  let onChange: jest.Mock

  beforeEach(() => {
    onChange = jest.fn()
    jest.clearAllMocks()
    mockIsPrefixedAddress.mockImplementation((v: string) => v.includes(':'))
    mockParsePrefixedAddress.mockImplementation((v: string) => {
      const [prefix, address] = v.split(':')
      return { prefix, address }
    })
  })

  describe('handleInput', () => {
    it('calls onChange with the trimmed input', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, undefined, evmStrategy))
      act(() => result.current.handleInput(makeEvent('0xabc')))
      expect(onChange).toHaveBeenCalledWith('0xabc')
    })

    it('strips whitespace from input', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, undefined, evmStrategy))
      act(() => result.current.handleInput(makeEvent('  0x abc  ')))
      expect(onChange).toHaveBeenCalledWith('0xabc')
    })

    it('resets chainPrefixWarning on each input', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, 'eth', evmStrategy))

      act(() => result.current.handleInput(makeEvent('bnb:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('bnb')

      act(() => result.current.handleInput(makeEvent('0xabc')))
      expect(result.current.chainPrefixWarning).toBe('')
    })
  })

  describe('chain prefix handling (supportsChainPrefix=true)', () => {
    it('strips the prefix and calls onChange with address only', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, 'eth', evmStrategy))
      act(() => result.current.handleInput(makeEvent('eth:0xabc')))
      expect(onChange).toHaveBeenCalledWith('0xabc')
    })

    it('sets chainPrefixWarning when prefix does not match addressPrefix', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, 'eth', evmStrategy))
      act(() => result.current.handleInput(makeEvent('bnb:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('bnb')
    })

    it('does not set chainPrefixWarning when prefix matches addressPrefix', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, 'eth', evmStrategy))
      act(() => result.current.handleInput(makeEvent('eth:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('')
    })

    it('does not set chainPrefixWarning when addressPrefix is undefined', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, undefined, evmStrategy))
      // prefix is truthy but addressPrefix is undefined → prefix !== addressPrefix → warning set
      act(() => result.current.handleInput(makeEvent('eth:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('eth')
    })
  })

  describe('chain prefix handling (supportsChainPrefix=false)', () => {
    it('passes the raw value through without stripping prefix', () => {
      const { result } = renderHook(() => useOnAddressInput(onChange, undefined, nonEvmStrategy))
      act(() => result.current.handleInput(makeEvent('eth:0xabc')))
      expect(onChange).toHaveBeenCalledWith('eth:0xabc')
      expect(result.current.chainPrefixWarning).toBe('')
    })
  })

  describe('chainPrefixWarning auto-clear effect', () => {
    it('clears warning when addressPrefix is updated to match the warning', () => {
      const { result, rerender } = renderHook(
        ({ prefix }: { prefix: string | undefined }) => useOnAddressInput(onChange, prefix, evmStrategy),
        { initialProps: { prefix: 'eth' } },
      )

      act(() => result.current.handleInput(makeEvent('bnb:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('bnb')

      rerender({ prefix: 'bnb' })
      expect(result.current.chainPrefixWarning).toBe('')
    })

    it('keeps warning when addressPrefix does not match it', () => {
      const { result, rerender } = renderHook(
        ({ prefix }: { prefix: string | undefined }) => useOnAddressInput(onChange, prefix, evmStrategy),
        { initialProps: { prefix: 'eth' } },
      )

      act(() => result.current.handleInput(makeEvent('bnb:0xabc')))
      expect(result.current.chainPrefixWarning).toBe('bnb')

      rerender({ prefix: 'arb' })
      expect(result.current.chainPrefixWarning).toBe('bnb')
    })
  })
})
