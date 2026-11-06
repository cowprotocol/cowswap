import { getListboxPosition } from './listboxPosition'

const VIEWPORT = { width: 1000, height: 800 }
const TRIGGER = { top: 100, bottom: 140, left: 200, width: 120 }

describe('getListboxPosition', () => {
  it('places the listbox below the trigger, at least as wide as it', () => {
    expect(getListboxPosition(TRIGGER, { width: 100, height: 200 }, VIEWPORT)).toEqual({
      top: 144,
      left: 200,
      minWidth: 120,
      maxHeight: 200,
    })
  })

  it('places the listbox above the trigger when it does not fit below', () => {
    const trigger = { ...TRIGGER, top: 700, bottom: 740 }

    expect(getListboxPosition(trigger, { width: 100, height: 200 }, VIEWPORT)).toMatchObject({
      top: 496,
      maxHeight: 200,
    })
  })

  it('cuts the listbox to the space below when that side has more room', () => {
    const trigger = { ...TRIGGER, top: 300, bottom: 340 }

    expect(getListboxPosition(trigger, { width: 100, height: 600 }, VIEWPORT)).toMatchObject({
      top: 344,
      maxHeight: 448,
    })
  })

  it('cuts the listbox to the space above when that side has more room', () => {
    const trigger = { ...TRIGGER, top: 500, bottom: 540 }

    expect(getListboxPosition(trigger, { width: 100, height: 600 }, VIEWPORT)).toMatchObject({
      top: 8,
      maxHeight: 488,
    })
  })

  it('keeps the listbox inside the right edge of the viewport', () => {
    const trigger = { ...TRIGGER, left: 900, width: 80 }

    expect(getListboxPosition(trigger, { width: 200, height: 200 }, VIEWPORT).left).toBe(792)
  })
})
