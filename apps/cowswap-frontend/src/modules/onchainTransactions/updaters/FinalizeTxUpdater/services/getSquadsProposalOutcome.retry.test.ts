/**
 * Isolated from the main suite because it re-registers the SDK module to make the first dynamic import
 * fail, which needs its own module registry.
 */
import type { Connection } from '@solana/web3.js'

const connection = {
  getTransaction: jest.fn(async () => null),
  getMultipleAccountsInfo: jest.fn(async () => []),
  getAccountInfo: jest.fn(async () => null),
} as unknown as Connection

describe('getSquadsProposalOutcome sdk loading', () => {
  // The chunk 404s for any tab still open across a deployment. Holding the rejected promise would
  // leave proposal tracking dead for the rest of the session, so every later poll would report
  // "unresolved" and the order would sit through its own rejection.
  it('retries the import after a failure instead of caching the rejection', async () => {
    let attempts = 0

    jest.resetModules()
    jest.doMock('@sqds/multisig', () => {
      attempts += 1

      if (attempts === 1) throw new Error('Failed to fetch dynamically imported module')

      return { PROGRAM_ID: {}, getProposalPda: jest.fn(), accounts: { vaultTransactionDiscriminator: [] } }
    })

    const { getSquadsProposalOutcome } = await import('./getSquadsProposalOutcome')

    await expect(getSquadsProposalOutcome(connection, 'first-poll')).rejects.toThrow(
      'Failed to fetch dynamically imported module',
    )

    await expect(getSquadsProposalOutcome(connection, 'second-poll')).resolves.toBe('unresolved')
    expect(attempts).toBe(2)
  })
})
