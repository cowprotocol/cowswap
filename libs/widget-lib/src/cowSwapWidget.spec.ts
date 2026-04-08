/**
 * @jest-environment jsdom
 */

import { createCowSwapWidget } from './cowSwapWidget'
import { WidgetMethodsEmit } from './types'
import { widgetIframeTransport } from './widgetIframeTransport'

describe('createCowSwapWidget', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('updates iframe width and default height when params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        width: '100%',
        height: '640px',
        iframeStyle: { backgroundColor: 'red', borderRadius: '1.6rem' },
      },
    })

    const iframe = getIframe(container)

    expect(iframe.width).toBe('100%')
    expect(iframe.height).toBe('640px')
    expect(iframe.style.height).toBe('')
    expect(iframe.style.backgroundColor).toBe('red')
    expect(iframe.style.borderRadius).toBe('1.6rem')

    handler.updateParams({
      appCode: 'widget-test',
      width: '320px',
      height: '432px',
      iframeStyle: { backgroundColor: 'transparent', borderRadius: '0' },
    })

    expect(iframe.width).toBe('320px')
    expect(iframe.height).toBe('432px')
    expect(iframe.style.height).toBe('432px')
    expect(iframe.style.backgroundColor).toBe('transparent')
    expect(iframe.style.borderRadius).toBe('0')
  })

  it('applies iframeStyle to the iframe', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        iframeStyle: { backgroundColor: 'blue', margin: '12px', border: '2px solid green' },
      },
    })

    const iframe = getIframe(container)

    expect(iframe.style.backgroundColor).toBe('blue')
    expect(iframe.style.margin).toBe('12px')
    expect(iframe.style.border).toBe('2px solid green')
  })

  it('uses the latest height config for resize events after params change', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const handler = createCowSwapWidget(container, {
      params: {
        appCode: 'widget-test',
        height: '640px',
      },
    })

    const iframe = getIframe(container)

    emitWidgetEvent(WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(iframe.style.height).toBe('400px')

    handler.updateParams({
      appCode: 'widget-test',
      height: '432px',
      maxHeight: 350,
    })

    emitWidgetEvent(WidgetMethodsEmit.UPDATE_HEIGHT, { height: 400 })
    expect(iframe.style.height).toBe('350px')

    emitWidgetEvent(WidgetMethodsEmit.SET_FULL_HEIGHT, { isUpToSmall: true })
    expect(iframe.style.height).toBe('432px')

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 900,
    })

    emitWidgetEvent(WidgetMethodsEmit.SET_FULL_HEIGHT, { isUpToSmall: false })
    expect(iframe.style.height).toBe('350px')
  })
})

function getIframe(container: HTMLElement): HTMLIFrameElement {
  const iframe = container.querySelector('iframe')

  if (!iframe) {
    throw new Error('Expected iframe to be created')
  }

  return iframe
}

function emitWidgetEvent(method: WidgetMethodsEmit, payload: object): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        key: widgetIframeTransport.key,
        method,
        ...payload,
      },
    }),
  )
}
