import { getActiveIndexForKey } from './listboxKeyboard'

const LABELS = ['All networks', 'BNB', 'Base', 'Ethereum']

describe('getActiveIndexForKey', () => {
  it('steps with the arrows and stops at the ends', () => {
    expect(getActiveIndexForKey('ArrowDown', 1, LABELS)).toBe(2)
    expect(getActiveIndexForKey('ArrowDown', 3, LABELS)).toBe(3)
    expect(getActiveIndexForKey('ArrowUp', 1, LABELS)).toBe(0)
    expect(getActiveIndexForKey('ArrowUp', 0, LABELS)).toBe(0)
  })

  it('jumps to the first and the last option', () => {
    expect(getActiveIndexForKey('Home', 2, LABELS)).toBe(0)
    expect(getActiveIndexForKey('End', 0, LABELS)).toBe(3)
  })

  it('jumps to the next label starting with a typed character, wrapping around', () => {
    expect(getActiveIndexForKey('b', 0, LABELS)).toBe(1)
    expect(getActiveIndexForKey('B', 1, LABELS)).toBe(2)
    expect(getActiveIndexForKey('b', 2, LABELS)).toBe(1)
  })

  it('ignores other keys and characters no label starts with', () => {
    expect(getActiveIndexForKey('Shift', 0, LABELS)).toBeNull()
    expect(getActiveIndexForKey(' ', 0, LABELS)).toBeNull()
    expect(getActiveIndexForKey('z', 0, LABELS)).toBeNull()
  })
})
