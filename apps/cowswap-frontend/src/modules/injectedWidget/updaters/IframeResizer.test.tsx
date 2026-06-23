import { useAtomValue } from 'jotai'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { WidgetMethodsEmit, widgetIframeTransport } from '@cowprotocol/widget-lib'

import { act, render } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { IframeResizer } from './IframeResizer'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('@cowprotocol/common-utils', () => ({
  isIframe: jest.fn(),
  isInjectedWidget: jest.fn(),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(() => ({})),
}))

jest.mock('@cowprotocol/iframe-transport', () => ({
  ...jest.requireActual('@cowprotocol/iframe-transport'),
  getParentOrigin: jest.fn(() => 'https://parent.example'),
}))

const MOCK_PARENT_ORIGIN = 'https://parent.example'

const useAtomValueMock = useAtomValue as jest.MockedFunction<typeof useAtomValue>
const isIframeMock = isIframe as jest.MockedFunction<typeof isIframe>
const isInjectedWidgetMock = isInjectedWidget as jest.MockedFunction<typeof isInjectedWidget>
const useInjectedWidgetParamsMock = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>

const postMessageToWindowSpy = jest.spyOn(widgetIframeTransport, 'postMessageToWindow')

const resizeObserverObserveMock = jest.fn()
const resizeObserverDisconnectMock = jest.fn()
const resizeObserverUnobserveMock = jest.fn()
const mutationObserverObserveMock = jest.fn()
const mutationObserverDisconnectMock = jest.fn()

const originalResizeObserver = global.ResizeObserver
const originalMutationObserver = global.MutationObserver

let triggerResizeObserver: (() => void) | null = null
let triggerMutationObserver: (() => void) | null = null
let rootElement: HTMLDivElement | null = null

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    triggerResizeObserver = () => callback([], this as unknown as ResizeObserver)
  }

  observe = resizeObserverObserveMock
  disconnect = resizeObserverDisconnectMock
  unobserve = resizeObserverUnobserveMock
}

class MockMutationObserver {
  constructor(callback: MutationCallback) {
    triggerMutationObserver = () => callback([], this as unknown as MutationObserver)
  }

  observe = mutationObserverObserveMock
  disconnect = mutationObserverDisconnectMock
  takeRecords(): MutationRecord[] {
    return []
  }
}

describe('IframeResizer', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    triggerResizeObserver = null
    triggerMutationObserver = null
    rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)
    document.documentElement.style.removeProperty('overflow')

    useAtomValueMock.mockReturnValue(false as never)
    useInjectedWidgetParamsMock.mockReturnValue({} as never)
    isIframeMock.mockReturnValue(true)
    isInjectedWidgetMock.mockReturnValue(true)

    setContentSize({ bodyOffsetWidth: 400, rootScrollHeight: 520, rootOffsetHeight: 500 })
    setResizeObserver(MockResizeObserver)
    setMutationObserver(MockMutationObserver)
  })

  afterEach(() => {
    rootElement?.remove()
    rootElement = null
    document.documentElement.style.removeProperty('overflow')
  })

  afterAll(() => {
    setResizeObserver(originalResizeObserver)
    setMutationObserver(originalMutationObserver)
  })

  it('uses ResizeObserver and window resize events to emit updated heights', () => {
    const { unmount } = render(<IframeResizer />)

    expect(postMessageToWindowSpy).toHaveBeenCalledWith(
      window.parent,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      {
        height: 500,
      },
      MOCK_PARENT_ORIGIN,
    )
    expect(resizeObserverObserveMock).toHaveBeenCalledWith(rootElement)
    expect(resizeObserverObserveMock).toHaveBeenCalledWith(document.body)
    expect(mutationObserverObserveMock).not.toHaveBeenCalled()

    setContentSize({ bodyOffsetWidth: 400, rootScrollHeight: 640, rootOffsetHeight: 610 })

    act(() => {
      triggerResizeObserver?.()
    })

    expect(postMessageToWindowSpy).toHaveBeenLastCalledWith(
      window.parent,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      {
        height: 610,
      },
      MOCK_PARENT_ORIGIN,
    )

    setContentSize({ bodyOffsetWidth: 400, rootScrollHeight: 680, rootOffsetHeight: 700 })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(postMessageToWindowSpy).toHaveBeenLastCalledWith(
      window.parent,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      {
        height: 700,
      },
      MOCK_PARENT_ORIGIN,
    )

    unmount()

    expect(resizeObserverDisconnectMock).toHaveBeenCalled()
  })

  it('ignores viewport-only height changes that would otherwise cause a resize loop', () => {
    render(<IframeResizer />)

    expect(postMessageToWindowSpy).toHaveBeenCalledTimes(1)

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(postMessageToWindowSpy).toHaveBeenCalledTimes(1)
  })

  it('uses the rendered root height when scrollHeight over-reports content size', () => {
    setContentSize({ bodyOffsetWidth: 400, rootScrollHeight: 700, rootOffsetHeight: 640 })

    render(<IframeResizer />)

    expect(postMessageToWindowSpy).toHaveBeenCalledWith(
      window.parent,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      {
        height: 640,
      },
      MOCK_PARENT_ORIGIN,
    )
  })

  it('falls back to MutationObserver when ResizeObserver is unavailable', () => {
    setResizeObserver(undefined)

    render(<IframeResizer />)

    expect(mutationObserverObserveMock).toHaveBeenCalledWith(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    setContentSize({ bodyOffsetWidth: 400, rootScrollHeight: 580, rootOffsetHeight: 560 })

    act(() => {
      triggerMutationObserver?.()
    })

    expect(postMessageToWindowSpy).toHaveBeenLastCalledWith(
      window.parent,
      WidgetMethodsEmit.UPDATE_HEIGHT,
      {
        height: 560,
      },
      MOCK_PARENT_ORIGIN,
    )
  })

  it('emits full-height updates while a modal is open', () => {
    useAtomValueMock.mockReturnValue(true as never)
    setContentSize({
      rootScrollHeight: 520,
      rootOffsetHeight: 500,
    })

    render(<IframeResizer />)

    expect(postMessageToWindowSpy).toHaveBeenCalledWith(
      window.parent,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      void 0,
      MOCK_PARENT_ORIGIN,
    )

    setContentSize({
      rootScrollHeight: 560,
      rootOffsetHeight: 540,
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(postMessageToWindowSpy).toHaveBeenLastCalledWith(
      window.parent,
      WidgetMethodsEmit.SET_FULL_HEIGHT,
      void 0,
      MOCK_PARENT_ORIGIN,
    )
  })

  it('hides document overflow when disableScrollbars is enabled and restores it on unmount', () => {
    useInjectedWidgetParamsMock.mockReturnValue({ disableScrollbars: true } as never)

    const { unmount } = render(<IframeResizer />)

    expect(document.documentElement.style.overflow).toBe('hidden')

    unmount()

    expect(document.documentElement.style.overflow).toBe('')
  })

  it('restores document overflow when disableScrollbars is disabled', () => {
    useInjectedWidgetParamsMock.mockReturnValue({ disableScrollbars: true } as never)

    const { rerender } = render(<IframeResizer />)

    expect(document.documentElement.style.overflow).toBe('hidden')

    useInjectedWidgetParamsMock.mockReturnValue({ disableScrollbars: false } as never)
    rerender(<IframeResizer />)

    expect(document.documentElement.style.overflow).toBe('')
  })
})

function setContentSize({
  bodyOffsetWidth,
  rootScrollHeight,
  rootOffsetHeight,
}: {
  bodyOffsetWidth: number
  rootScrollHeight: number
  rootOffsetHeight: number
}): void {
  Object.defineProperty(document.body, 'offsetWidth', {
    configurable: true,
    value: bodyOffsetWidth,
  })

  const root = getRootElement()

  Object.defineProperty(root, 'scrollHeight', {
    configurable: true,
    value: rootScrollHeight,
  })

  Object.defineProperty(root, 'offsetHeight', {
    configurable: true,
    value: rootOffsetHeight,
  })

  Object.defineProperty(root, 'clientHeight', {
    configurable: true,
    value: rootOffsetHeight,
  })

  root.getBoundingClientRect = jest.fn(() => ({
    bottom: rootOffsetHeight,
    height: rootOffsetHeight,
    left: 0,
    right: 0,
    toJSON: () => undefined,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  }))
}

function getRootElement(): HTMLDivElement {
  if (!rootElement) {
    throw new Error('Root element is not initialized')
  }

  return rootElement
}

function setResizeObserver(value: typeof ResizeObserver | undefined): void {
  Object.defineProperty(global, 'ResizeObserver', {
    configurable: true,
    value,
    writable: true,
  })
}

function setMutationObserver(value: typeof MutationObserver | undefined): void {
  Object.defineProperty(global, 'MutationObserver', {
    configurable: true,
    value,
    writable: true,
  })
}
