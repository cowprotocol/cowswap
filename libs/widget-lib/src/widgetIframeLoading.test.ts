/**
 * @jest-environment jsdom
 */

import { widgetIframeLoading } from './widgetIframeLoading'

const ERROR_CLASS = 'cow-widget-loading-error'
const WIDGET_ORIGIN = 'https://swap.cow.fi'

type LoadingState = ReturnType<typeof widgetIframeLoading>

const activeStates: LoadingState[] = []

describe('widgetIframeLoading error UI styling', () => {
  beforeEach(() => {
    // The iframe `error` handler logs intentionally; keep test output pristine.
    jest.spyOn(console, 'error').mockImplementation(() => void 0)
  })

  afterEach(() => {
    activeStates.splice(0).forEach((state) => state.cancelWidgetLoading())
    document.body.innerHTML = ''
    document.head.querySelectorAll(`style[data-${ERROR_CLASS}]`).forEach((el) => el.remove())
    jest.restoreAllMocks()
  })

  it('renders the error container with its class', () => {
    const { container, iframe } = setup()

    failIframe(iframe)

    const errorEl = container.querySelector<HTMLElement>(`.${ERROR_CLASS}`)
    expect(errorEl).not.toBeNull()
  })

  it('injects the default error styles for the container and its children', () => {
    const { iframe } = setup()

    failIframe(iframe)

    const style = document.head.querySelector(`style[data-${ERROR_CLASS}]`)
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain(`.${ERROR_CLASS}`)
    expect(style?.textContent).toContain(`.${ERROR_CLASS} button`)
    expect(style?.textContent).toContain(`.${ERROR_CLASS} p`)
  })

  it('injects the default error styles at most once across repeated failures', () => {
    const first = setup()
    failIframe(first.iframe)

    const second = setup()
    failIframe(second.iframe)

    expect(document.head.querySelectorAll(`style[data-${ERROR_CLASS}]`).length).toBeLessThanOrEqual(1)
  })
})

function setup(): { container: HTMLElement; iframe: HTMLIFrameElement; state: LoadingState } {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const iframe = document.createElement('iframe')
  iframe.src = `${WIDGET_ORIGIN}/`
  container.appendChild(iframe)

  const state = widgetIframeLoading(
    container,
    iframe,
    () => void 0,
    () => void 0,
  )
  activeStates.push(state)

  return { container, iframe, state }
}

function failIframe(iframe: HTMLIFrameElement): void {
  iframe.dispatchEvent(new Event('error'))
}
