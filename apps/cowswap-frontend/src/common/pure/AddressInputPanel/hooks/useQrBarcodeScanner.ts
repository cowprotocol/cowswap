import { RefObject, useEffect, useState } from 'react'

/**
 * BarcodeDetector is a browser API not yet included in TypeScript's DOM lib.
 * Spec: https://wicg.github.io/shape-detection-api/#barcode-detection-api
 */
interface BarcodeDetectorResult {
  rawValue: string
}

interface IBarcodeDetector {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>
}

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => IBarcodeDetector
  }
}

/**
 * Runs a requestAnimationFrame loop using BarcodeDetector to scan for QR codes.
 * Sets isSupported=false if BarcodeDetector is absent from the browser.
 */
export function useQrBarcodeScanner(
  isOpen: boolean,
  stream: MediaStream | null,
  videoRef: RefObject<HTMLVideoElement | null>,
  onScan: (value: string) => void,
): boolean {
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (!isOpen || !stream) return

    if (!window.BarcodeDetector) {
      setIsSupported(false)
      return
    }

    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    let frameId: number

    const scan = async (): Promise<void> => {
      const video = videoRef.current
      if (!video || video.readyState < 2) {
        frameId = requestAnimationFrame(scan)
        return
      }
      try {
        const barcodes = await detector.detect(video)
        if (barcodes.length > 0) {
          onScan(barcodes[0].rawValue)
          stream.getTracks().forEach((t) => t.stop())
          return
        }
      } catch (e) {
        console.error(e)
      }
      frameId = requestAnimationFrame(scan)
    }

    frameId = requestAnimationFrame(scan)

    return () => cancelAnimationFrame(frameId)
  }, [isOpen, stream, videoRef, onScan])

  return isSupported
}
