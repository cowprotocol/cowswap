import { handleSolanaSendError } from './handleSolanaSendError'

describe('handleSolanaSendError', () => {
  const closeModals = jest.fn()
  const openErrorModal = jest.fn()

  beforeEach(() => {
    closeModals.mockReset()
    openErrorModal.mockReset()
  })

  it('closes the modals silently on a wallet rejection — a rejection is not a failure', () => {
    const result = handleSolanaSendError(
      { code: 4001, message: 'User rejected the request' },
      { useModals: true, closeModals, openErrorModal },
    )

    expect(result).toBeNull()
    expect(closeModals).toHaveBeenCalled()
    expect(openErrorModal).not.toHaveBeenCalled()
  })

  // The raw simulation dump ("Transaction results in an account (0) with insufficient funds for
  // rent. Logs: [...]") is what the user used to see — it names no action they can take.
  it('replaces an insufficient-SOL simulation failure with an actionable message', () => {
    handleSolanaSendError(
      {
        message:
          'Simulation failed. Message: Transaction simulation failed: Transaction results in an account (0) with insufficient funds for rent. Logs: [].',
      },
      { useModals: true, closeModals, openErrorModal },
    )

    expect(openErrorModal).toHaveBeenCalledWith(
      "You don't have enough SOL to cover the network fee and account rent. Reduce the amount or add more SOL to your wallet.",
    )
  })

  it('shows other errors as-is', () => {
    handleSolanaSendError({ message: 'Blockhash not found' }, { useModals: true, closeModals, openErrorModal })

    expect(openErrorModal).toHaveBeenCalledWith('Blockhash not found')
  })

  it('rethrows when the caller opted out of modals', () => {
    expect(() => handleSolanaSendError(new Error('boom'), { useModals: false })).toThrow('boom')
  })
})
