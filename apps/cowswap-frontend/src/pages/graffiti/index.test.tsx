import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSolanaAccount, useWalletInfo } from '@cowprotocol/wallet'

import { fireEvent, render as baseRender, screen, waitFor } from '@testing-library/react'

import { fetchCanvasPng, getInfo, subscribeDiffs } from './graffiti.service'
import { setCanvasSize } from './raster.utils'
import { useTokenBalance } from './useTokenBalance'

import { LinguiWrapper } from '../../../LinguiJestProvider'

import GraffitiPage from './index'

const mockSwitchNetwork = jest.fn().mockResolvedValue(undefined)

jest.mock('@cowprotocol/wallet', () => ({
  useOpenWalletConnectionModal: () => jest.fn(),
  useSolanaAccount: jest.fn(),
  useSolanaWalletProvider: () => undefined,
  useSwitchNetwork: () => mockSwitchNetwork,
  useWalletInfo: jest.fn(),
}))

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: null }),
}))

// The application barrel re-exports the whole app shell, which jest cannot
// tree-shake; the page only needs the full-bleed hook from it.
jest.mock('modules/application', () => ({
  useFullBleedPage: () => undefined,
}))

jest.mock('./useTokenBalance', () => ({
  useTokenBalance: jest.fn(),
}))

jest.mock('./graffiti.service', () => ({
  ...jest.requireActual('./graffiti.service'),
  getInfo: jest.fn(),
  fetchCanvasPng: jest.fn(),
  getAllCellsSince: jest.fn().mockResolvedValue({ seq: 0, cells: [] }),
  postClientError: jest.fn(),
  subscribeDiffs: jest.fn(),
}))

/** The page is translated, so every render needs the i18n provider. */
const render = (ui: Parameters<typeof baseRender>[0]): ReturnType<typeof baseRender> =>
  baseRender(ui, { wrapper: LinguiWrapper })

const WIDTH = 640
const HEIGHT = 320
const ACCOUNT = '4JtDcUjdGXc93ahvvzH8tfXpyLQGeHqvdbG2wHz47s5B'

const INFO = {
  width: WIDTH,
  height: HEIGHT,
  maxBoxWidth: 256,
  maxBoxHeight: 128,
  mint: null,
  treasury: null,
  network: 'devnet',
}

const useSolanaAccountMock = jest.mocked(useSolanaAccount)
const useWalletInfoMock = jest.mocked(useWalletInfo)
const getInfoMock = jest.mocked(getInfo)
const fetchCanvasPngMock = jest.mocked(fetchCanvasPng)
const subscribeDiffsMock = jest.mocked(subscribeDiffs)
const useTokenBalanceMock = jest.mocked(useTokenBalance)

function onChain(chainId: SupportedChainId, account: string | null = null): void {
  useWalletInfoMock.mockReturnValue({ chainId } as ReturnType<typeof useWalletInfo>)
  useSolanaAccountMock.mockReturnValue(account)
}

async function renderLoadedWall(account: string | null = ACCOUNT): Promise<void> {
  onChain(SupportedChainId.SOLANA, account)
  render(<GraffitiPage />)
  // Frame placement happens once the snapshot has loaded.
  await screen.findByText(account ? /START DRAWING/ : /CONNECT SOLANA WALLET/)
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  })
  window.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
})

beforeEach(() => {
  setCanvasSize(WIDTH, HEIGHT)
  useTokenBalanceMock.mockReturnValue(null)
  getInfoMock.mockResolvedValue(INFO)
  fetchCanvasPngMock.mockResolvedValue(new Uint8ClampedArray(WIDTH * HEIGHT * 4))
  subscribeDiffsMock.mockClear()
  subscribeDiffsMock.mockReturnValue(jest.fn())
  mockSwitchNetwork.mockClear()
})

describe('network gate', () => {
  it('asks to switch to Solana while the wallet is on an EVM chain', () => {
    onChain(SupportedChainId.MAINNET)
    render(<GraffitiPage />)

    expect(screen.getByText(/Switch to Solana/)).toBeTruthy()
    expect(screen.queryByText(/START DRAWING/)).toBeNull()
  })

  it('switches network when asked', () => {
    onChain(SupportedChainId.MAINNET)
    render(<GraffitiPage />)

    fireEvent.click(screen.getByText(/Switch to Solana/))

    expect(mockSwitchNetwork).toHaveBeenCalledWith(SupportedChainId.SOLANA)
  })
})

describe('wall screen', () => {
  it('loads the wall and shows the landing panel', async () => {
    await renderLoadedWall()

    expect(screen.getByText('GRAFFITI WALL')).toBeTruthy()
    expect(screen.getByText(`${WIDTH}×${HEIGHT} · 1 GRASS per pixel · devnet`)).toBeTruthy()
  })

  it('subscribes to live diffs and unsubscribes on unmount', async () => {
    const unsubscribe = jest.fn()

    subscribeDiffsMock.mockReturnValue(unsubscribe)
    onChain(SupportedChainId.SOLANA, ACCOUNT)
    const { unmount } = render(<GraffitiPage />)

    await screen.findByText(/START DRAWING/)
    expect(subscribeDiffsMock).toHaveBeenCalledTimes(1)

    unmount()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('reports a snapshot that cannot be loaded', async () => {
    fetchCanvasPngMock.mockRejectedValue(new Error('HTTP 502'))
    onChain(SupportedChainId.SOLANA)
    render(<GraffitiPage />)

    expect(await screen.findByText('HTTP 502')).toBeTruthy()
  })

  it('still shows the network when only the snapshot fails', async () => {
    fetchCanvasPngMock.mockRejectedValue(new Error('HTTP 502'))
    onChain(SupportedChainId.SOLANA)
    render(<GraffitiPage />)

    expect(await screen.findByText(/devnet/)).toBeTruthy()
  })

  it('survives the wall info being unavailable', async () => {
    getInfoMock.mockRejectedValue(new Error('down'))
    onChain(SupportedChainId.SOLANA, ACCOUNT)
    render(<GraffitiPage />)

    expect(await screen.findByText(/START DRAWING/)).toBeTruthy()
  })
})

describe('drawing session', () => {
  it('walks start → place → confirm → cancel', async () => {
    await renderLoadedWall(ACCOUNT)

    fireEvent.click(screen.getByText(/START DRAWING/))
    expect(screen.queryByText(/START DRAWING/)).toBeNull()
    expect(screen.getByText(/drag the frame to position it/)).toBeTruthy()

    fireEvent.click(await screen.findByText('✓ draw here'))
    expect(screen.queryByText('✓ draw here')).toBeNull()
    expect(screen.getByText(/frame locked/)).toBeTruthy()

    fireEvent.click(screen.getByText('✕ cancel'))
    expect(screen.getByText(/START DRAWING/)).toBeTruthy()
  })

  it('confirms the frame when Enter is pressed', async () => {
    await renderLoadedWall(ACCOUNT)

    fireEvent.click(screen.getByText(/START DRAWING/))
    await screen.findByText('✓ draw here')

    fireEvent.keyDown(window, { key: 'Enter' })

    expect(screen.queryByText('✓ draw here')).toBeNull()
    expect(screen.getByText(/frame locked/)).toBeTruthy()
  })

  it('leaves Enter to the label field while typing', async () => {
    await renderLoadedWall(ACCOUNT)

    fireEvent.click(screen.getByText(/START DRAWING/))
    await screen.findByText('✓ draw here')
    fireEvent.click(screen.getByText('T text'))

    fireEvent.keyDown(screen.getByPlaceholderText('type text…'), { key: 'Enter' })

    expect(screen.getByText('✓ draw here')).toBeTruthy()
  })

  it('ignores Enter before the session starts', async () => {
    await renderLoadedWall(ACCOUNT)

    fireEvent.keyDown(window, { key: 'Enter' })

    expect(screen.getByText(/START DRAWING/)).toBeTruthy()
  })

  it('offers rotate while the frame is movable', async () => {
    await renderLoadedWall(ACCOUNT)

    fireEvent.click(screen.getByText(/START DRAWING/))

    expect(await screen.findByText('⟳ rotate')).toBeTruthy()
    fireEvent.click(screen.getByText('⟳ rotate'))
    expect(screen.getByText('⟳ rotate')).toBeTruthy()
  })

  it('asks a disconnected visitor to connect before painting', async () => {
    await renderLoadedWall(null)

    expect(screen.getByText('CONNECT WALLET TO PAINT')).toBeTruthy()
  })

  it('offers the wallet rather than the frame while disconnected', async () => {
    await renderLoadedWall(null)

    expect(screen.getByText('CONNECT SOLANA WALLET')).toBeTruthy()
    expect(screen.queryByText(/START DRAWING/)).toBeNull()
  })

  it('will not start a session a wallet with no tokens cannot finish', async () => {
    useTokenBalanceMock.mockReturnValue(0)
    onChain(SupportedChainId.SOLANA, ACCOUNT)
    render(<GraffitiPage />)

    const button = (await screen.findByText('NO GRASS IN YOUR WALLET')) as HTMLButtonElement

    expect(button.disabled).toBe(true)
    expect(screen.queryByText(/START DRAWING/)).toBeNull()
    expect(screen.getByText(/Every pixel burns 1 GRASS/)).toBeTruthy()
  })

  it('does not let a connected wallet paint an empty draft', async () => {
    await renderLoadedWall(ACCOUNT)

    const button = screen.getByText('DRAW SOMETHING ✏') as HTMLButtonElement

    expect(button.disabled).toBe(true)
  })

  it('shows the wallet balance chip only inside a session', async () => {
    await renderLoadedWall(ACCOUNT)

    expect(screen.queryByText(/GRASS left/)).toBeNull()

    fireEvent.click(screen.getByText(/START DRAWING/))

    expect(await screen.findByText(/GRASS left/)).toBeTruthy()
  })

  it('shows what the wallet holds on the landing panel, outside any session', async () => {
    useTokenBalanceMock.mockReturnValue(1234)

    await renderLoadedWall(ACCOUNT)

    expect(screen.getByText('1234 GRASS in your wallet')).toBeTruthy()
  })
})

describe('tools', () => {
  it('hides and restores the sidebar', async () => {
    await renderLoadedWall()

    fireEvent.click(screen.getByText('hide tools'))
    expect(screen.queryByText('hide tools')).toBeNull()

    fireEvent.click(screen.getByText(/tools$/))
    expect(screen.getByText('hide tools')).toBeTruthy()
  })

  it('shows the label field only for the text tool', async () => {
    await renderLoadedWall()

    expect(screen.queryByPlaceholderText('type text…')).toBeNull()

    fireEvent.click(screen.getByText('T text'))
    expect(screen.getByPlaceholderText('type text…')).toBeTruthy()

    fireEvent.click(screen.getByText('✏ draw'))
    expect(screen.queryByPlaceholderText('type text…')).toBeNull()
  })

  it('selects a palette colour', async () => {
    await renderLoadedWall()

    fireEvent.click(screen.getByLabelText('color #ff2ea6'))

    expect(screen.getByText('#FF2EA6')).toBeTruthy()
  })

  it('changes the brush size', async () => {
    await renderLoadedWall()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '12' } })

    expect(screen.getByText('Brush · 12px')).toBeTruthy()
  })
})

describe('fullscreen', () => {
  function stubFullscreen(): void {
    let element: Element | null = null

    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => element })
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: function requestFullscreen(this: Element): Promise<void> {
        element = this
        document.dispatchEvent(new Event('fullscreenchange'))

        return Promise.resolve()
      },
    })
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true,
      value: (): Promise<void> => {
        element = null
        document.dispatchEvent(new Event('fullscreenchange'))

        return Promise.resolve()
      },
    })
  }

  it('offers a way back to the landing panel, which a touch screen has no ESC for', async () => {
    stubFullscreen()
    await renderLoadedWall(ACCOUNT)

    fireEvent.click(screen.getByText('⛶ view wall'))
    expect(screen.queryByText(/START DRAWING/)).toBeNull()

    fireEvent.click(screen.getByText('← menu'))
    expect(screen.getByText(/START DRAWING/)).toBeTruthy()
  })

  it('keeps the exit out of the clean wall view until it is fullscreen', async () => {
    stubFullscreen()
    await renderLoadedWall(ACCOUNT)

    expect(screen.queryByText('← menu')).toBeNull()
  })
})

describe('canvas input', () => {
  it('has a canvas that reacts to pointer events without throwing', async () => {
    await renderLoadedWall(ACCOUNT)
    const canvas = document.querySelector('canvas')

    expect(canvas).not.toBeNull()

    if (!canvas) return

    canvas.setPointerCapture = jest.fn()
    canvas.releasePointerCapture = jest.fn()

    fireEvent.click(screen.getByText(/START DRAWING/))
    await waitFor(() => expect(screen.getByText('✓ draw here')).toBeTruthy())
    fireEvent.click(screen.getByText('✓ draw here'))

    fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 50, clientY: 50, button: 0 })
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 90, clientY: 60 })
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 90, clientY: 60 })

    expect(screen.getByText('✕ cancel')).toBeTruthy()
  })
})
