import { withWaitAndSaveNextBatch } from './withWaitAndSaveNextBatch'

describe('withWaitAndSaveNextBatch', () => {
  const order: { id: string; waitAndSaveNextBatch?: number } = { id: '0xorder' }

  it('stamps a finite batch time onto the order', () => {
    expect(withWaitAndSaveNextBatch(order, 1_700_000_200)).toEqual({
      id: '0xorder',
      waitAndSaveNextBatch: 1_700_000_200,
    })
  })

  it('leaves the order unchanged when Wait & Save did not produce a schedule', () => {
    expect(withWaitAndSaveNextBatch(order, undefined)).toBe(order)
    expect(withWaitAndSaveNextBatch(order, Number.NaN)).toBe(order)
  })
})
