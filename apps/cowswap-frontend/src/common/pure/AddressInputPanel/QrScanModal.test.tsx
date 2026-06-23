import React from 'react'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen } from '@testing-library/react'

import { useQrBarcodeScanner } from './hooks/useQrBarcodeScanner'
import { useQrCameraStream } from './hooks/useQrCameraStream'
import { QrScanModal } from './QrScanModal.modal'

jest.mock('./hooks/useQrCameraStream')
jest.mock('./hooks/useQrBarcodeScanner')
jest.mock('./QrCameraView.pure', () => ({
  QrCameraView: ({ onSwitchCamera }: { onSwitchCamera(): void }) => (
    <div data-testid="qr-camera-view">
      <button onClick={onSwitchCamera}>Switch camera</button>
    </div>
  ),
}))
jest.mock('common/pure/Modal', () => ({
  CowModal: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="cow-modal">{children}</div> : null,
}))
jest.mock('common/pure/NewModal', () => ({
  NewModal: ({ children, onDismiss }: { children: React.ReactNode; onDismiss(): void }) => (
    <div>
      <button data-testid="dismiss-btn" onClick={onDismiss}>
        Close
      </button>
      {children}
    </div>
  ),
}))

const mockUseQrCameraStream = useQrCameraStream as jest.MockedFunction<typeof useQrCameraStream>
const mockUseQrBarcodeScanner = useQrBarcodeScanner as jest.MockedFunction<typeof useQrBarcodeScanner>

i18n.load('en-US', {})
i18n.activate('en-US')

function makeMockStream(): MediaStream {
  return {
    getTracks: () => [{ stop: jest.fn() } as unknown as MediaStreamTrack],
  } as unknown as MediaStream
}

function setupSupported(stream: MediaStream | null = makeMockStream()): void {
  mockUseQrCameraStream.mockReturnValue({ stream, isSupported: true, permissionDenied: false })
  mockUseQrBarcodeScanner.mockReturnValue(true)
}

function setupUnsupported(reason: 'camera' | 'scanner'): void {
  mockUseQrCameraStream.mockReturnValue({ stream: null, isSupported: reason !== 'camera', permissionDenied: false })
  mockUseQrBarcodeScanner.mockReturnValue(reason !== 'scanner')
}

function renderModal(props: Partial<React.ComponentProps<typeof QrScanModal>> = {}): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <QrScanModal isOpen={true} onDismiss={jest.fn()} onScan={jest.fn()} {...props} />
    </I18nProvider>,
  )
}

describe('QrScanModal', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('visibility', () => {
    it('renders modal content when isOpen=true', () => {
      setupSupported()
      renderModal({ isOpen: true })
      expect(screen.getByTestId('cow-modal')).toBeTruthy()
    })

    it('renders nothing when isOpen=false', () => {
      setupSupported()
      renderModal({ isOpen: false })
      expect(screen.queryByTestId('cow-modal')).toBeNull()
    })
  })

  describe('supported state', () => {
    it('shows QrCameraView when camera and scanner are supported', () => {
      setupSupported()
      renderModal()
      expect(screen.getByTestId('qr-camera-view')).toBeTruthy()
    })

    it('shows unsupported message when camera access is denied', () => {
      setupUnsupported('camera')
      renderModal()
      expect(screen.getByText(/not supported in this browser/i)).toBeTruthy()
      expect(screen.queryByTestId('qr-camera-view')).toBeNull()
    })

    it('shows unsupported message when BarcodeDetector is unavailable', () => {
      setupUnsupported('scanner')
      renderModal()
      expect(screen.getByText(/not supported in this browser/i)).toBeTruthy()
      expect(screen.queryByTestId('qr-camera-view')).toBeNull()
    })
  })

  describe('dismiss', () => {
    it('calls onDismiss when modal is dismissed', () => {
      setupSupported()
      const onDismiss = jest.fn()
      renderModal({ onDismiss })
      fireEvent.click(screen.getByTestId('dismiss-btn'))
      expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    it('stops stream tracks on dismiss', () => {
      const mockStop = jest.fn()
      const stream = {
        getTracks: () => [{ stop: mockStop } as unknown as MediaStreamTrack],
      } as unknown as MediaStream
      setupSupported(stream)

      const onDismiss = jest.fn()
      renderModal({ onDismiss })
      fireEvent.click(screen.getByTestId('dismiss-btn'))

      expect(mockStop).toHaveBeenCalled()
    })
  })

  describe('camera switch', () => {
    it('renders the switch camera button inside QrCameraView', () => {
      setupSupported()
      renderModal()
      expect(screen.getByText('Switch camera')).toBeTruthy()
    })
  })
})
