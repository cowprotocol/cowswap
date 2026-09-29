import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

import {
  acquireBodyScrollbarLock,
  BODY_NO_SCROLL_CLASS,
  releaseBodyScrollbarLock,
  resetBodyScrollbarLockForTests,
} from './bodyScrollbarLock'

jest.mock('@cowprotocol/common-utils', () => ({
  addBodyClass: jest.fn(),
  removeBodyClass: jest.fn(),
}))

const addBodyClassMock = addBodyClass as jest.MockedFunction<typeof addBodyClass>
const removeBodyClassMock = removeBodyClass as jest.MockedFunction<typeof removeBodyClass>

describe('bodyScrollbarLock', () => {
  beforeEach(() => {
    resetBodyScrollbarLockForTests()
    addBodyClassMock.mockClear()
    removeBodyClassMock.mockClear()
  })

  it('adds noScroll on the first acquire and removes it on the last release', () => {
    acquireBodyScrollbarLock()
    expect(addBodyClassMock).toHaveBeenCalledTimes(1)
    expect(addBodyClassMock).toHaveBeenCalledWith(BODY_NO_SCROLL_CLASS)

    acquireBodyScrollbarLock()
    expect(addBodyClassMock).toHaveBeenCalledTimes(1)

    releaseBodyScrollbarLock()
    expect(removeBodyClassMock).not.toHaveBeenCalled()

    releaseBodyScrollbarLock()
    expect(removeBodyClassMock).toHaveBeenCalledTimes(1)
    expect(removeBodyClassMock).toHaveBeenCalledWith(BODY_NO_SCROLL_CLASS)
  })

  it('ignores a release when nothing is locked', () => {
    releaseBodyScrollbarLock()
    expect(removeBodyClassMock).not.toHaveBeenCalled()
  })
})
