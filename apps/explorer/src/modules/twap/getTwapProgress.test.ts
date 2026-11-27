import { getTwapProgress } from './getTwapProgress'

it('calculates TWAP progress from the planned and executed sell amounts', () => {
  expect(getTwapProgress(1n, 2n)).toBe(50)
  expect(getTwapProgress(0n, 0n)).toBe(0)
  expect(getTwapProgress(3n, 2n)).toBe(100)
})
