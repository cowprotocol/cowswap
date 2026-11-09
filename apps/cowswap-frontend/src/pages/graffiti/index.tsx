// Graffiti Wall — collaborative pixel canvas where every painted cell burns
// one PIXEL (SPL) token. See docs/graffiti/SPEC.md.
//
// Self-contained page module: react + the app's existing Solana wallet
// infrastructure (@cowprotocol/wallet wraps Reown/appkit) + perfect-freehand.
// Kept free of redux/styled-components/app-context dependencies on purpose.

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

import { useOpenWalletConnectionModal, useSolanaAccount, useSolanaWalletProvider, useSwitchNetwork, useWalletInfo } from '@cowprotocol/wallet'

import { isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { getChainInfo } from '@cowprotocol/common-const'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { createBurnCheckedInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

import { Buffer } from 'buffer'

import {
  API_BASE,
  CanvasInfo,
  DrawResponse,
  fetchCanvasPng,
  getCellsSince,
  getInfo,
  postClientError,
  postDraw,
  subscribeDiffs,
} from './api'
import { CANVAS, setCanvasSize, Cell, colorToHex, hexToColor, Point, rasterizeStroke, rasterizeText } from './raster'

/* ------------------------------------------------------------------ */
/* Constants & style                                                   */
/* ------------------------------------------------------------------ */

const PIXELS_LENGTH = CANVAS.w * CANVAS.h * 4

const PALETTE = [
  '#00ffa3',
  '#00d0ff',
  '#ff2ea6',
  '#ffe600',
  '#ff5c00',
  '#a855f7',
  '#ffffff',
  '#111118',
  '#7f8c8d',
  '#2ecc71',
  '#2980ff',
  '#c0392b',
]

const DEFAULT_COLOR = '#00ffa3'
const MIN_BRUSH = 1
const MAX_BRUSH = 40

/** SPL Memo program (v2) — carries the graffiti:v1 replay-protection memo. */
const SPL_MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

type PaintPhase = 'idle' | 'quoting' | 'awaiting wallet' | 'confirming' | 'painting' | 'done' | 'error'

const PHASE_LABEL: Record<PaintPhase, string> = {
  idle: '',
  quoting: 'Counting cells…',
  'awaiting wallet': 'Approve the burn in your wallet…',
  confirming: 'Confirming burn on Solana…',
  painting: 'Painting the wall…',
  done: 'Painted! 🔥',
  error: 'Failed',
}

const neonShadow = '0 0 12px rgba(0,255,163,0.55)'

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    width: '100%',
    height: 'calc(100vh - 170px)',
    minHeight: 480,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    background: 'radial-gradient(1200px 700px at 70% -10%, #131324 0%, #0a0a12 55%, #060609 100%)',
    color: '#e8e8f0',
    fontFamily: "'IBM Plex Mono', 'Fira Mono', ui-monospace, monospace",
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 16px',
    borderBottom: '1px solid #1d1d2e',
    background: 'rgba(10,10,18,0.85)',
    backdropFilter: 'blur(6px)',
    flexWrap: 'wrap',
  },
  logo: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#00ffa3',
    textShadow: '0 0 14px rgba(0,255,163,0.8)',
    whiteSpace: 'nowrap',
  },
  tag: {
    fontSize: 11,
    color: '#8a8aa3',
    letterSpacing: 1,
  },
  main: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
    marginTop: 14,
  },
  canvasWrap: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
    cursor: 'crosshair',
    touchAction: 'none',
  },
  sidebar: {
    width: 264,
    padding: 16,
    borderLeft: '1px solid #1d1d2e',
    background: 'rgba(12,12,20,0.92)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    overflowY: 'auto',
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8a8aa3',
    margin: 0,
  },
  swatches: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 6,
  },
  swatch: {
    width: '100%',
    aspectRatio: '1',
    borderRadius: 6,
    border: '2px solid transparent',
    cursor: 'pointer',
    padding: 0,
  },
  button: {
    borderRadius: 8,
    border: '1px solid #2a2a40',
    background: '#15152400',
    color: '#e8e8f0',
    padding: '8px 12px',
    fontFamily: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  },
  panel: {
    borderRadius: 14,
    border: '1px solid #2a2a40',
    background: '#151524',
    padding: 28,
  },
  primaryButton: {
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #00ffa3, #00d0ff)',
    color: '#061310',
    fontWeight: 700,
    padding: '12px 14px',
    fontFamily: 'inherit',
    fontSize: 14,
    letterSpacing: 1,
    cursor: 'pointer',
    boxShadow: neonShadow,
    width: '100%',
  },
  costBox: {
    border: '1px solid #2a2a40',
    borderRadius: 10,
    padding: '10px 12px',
    background: '#10101c',
  },
  costValue: {
    fontSize: 26,
    fontWeight: 700,
    color: '#00ffa3',
    textShadow: neonShadow,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '6px 16px',
    borderTop: '1px solid #1d1d2e',
    background: 'rgba(10,10,18,0.9)',
    fontSize: 12,
    color: '#8a8aa3',
    minHeight: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  canvas: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  },
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function GraffitiPage(): ReactNode {
  // --- wallet (app's existing Solana infra: Reown appkit via @cowprotocol/wallet)
  const solanaAccount = useSolanaAccount()
  const provider = useSolanaWalletProvider()
  const openWalletModal = useOpenWalletConnectionModal()
  const { connection } = useAppKitConnection()

  const connected = Boolean(solanaAccount)

  // Reown's react open() omits 'namespace' in its typing, but the base client
  // honors it — without this the modal opens on the EVM wallet list.
  const openSolanaWalletModal = useCallback(() => {
    ;(openWalletModal as (opts?: { namespace?: string }) => void)({ namespace: 'solana' })
  }, [openWalletModal])

  // --- network gate: painting needs the Solana network (devnet in this fork)
  const { chainId } = useWalletInfo()
  const switchNetwork = useSwitchNetwork()
  const [switching, setSwitching] = useState(false)
  const onSolana = isSolanaChain(chainId)
  const switchToSolana = useCallback(async () => {
    setSwitching(true)
    try {
      await switchNetwork(SupportedChainId.SOLANA)
    } catch (e) {
      console.error('network switch failed', e)
    } finally {
      setSwitching(false)
    }
  }, [switchNetwork])

  // --- layout state: hideable tools, responsive for phones
  const [narrowInitial] = useState(() => typeof window !== 'undefined' && window.innerWidth < 780)
  const [toolsVisible, setToolsVisible] = useState(!narrowInitial)
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 780)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 780px)')
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches)
    setNarrow(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // --- wall state
  const [info, setInfo] = useState<CanvasInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [seq, setSeq] = useState(0)

  // --- MOOOXELS balance of the connected wallet
  const [balance, setBalance] = useState<number | null>(null)
  useEffect(() => {
    if (!solanaAccount || !connection || !info?.mint) return
    let cancelled = false
    const read = async () => {
      try {
        const res = await connection.getParsedTokenAccountsByOwner(new PublicKey(solanaAccount), { mint: new PublicKey(info.mint) })
        if (cancelled) return
        let total = 0
        for (const { account } of res.value) {
          const amt = (account.data as { parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } } }).parsed?.info?.tokenAmount?.uiAmount
          if (amt) total += amt
        }
        setBalance(total)
      } catch {
        // best-effort
      }
    }
    void read()
    const t = setInterval(read, 15000)
    return () => { cancelled = true; clearInterval(t) }
  }, [connection, info?.mint, solanaAccount])

  const [wsStatus, setWsStatus] = useState<'connected' | 'reconnecting'>('reconnecting')
  const [paintersOnline, setPaintersOnline] = useState<number | null>(null)

  // --- local view state
  const [color, setColor] = useState<string>(DEFAULT_COLOR)
  const [brushSize, setBrushSize] = useState<number>(3)
  const [label, setLabel] = useState('')
  const [tool, setTool] = useState<'draw' | 'pan' | 'erase' | 'text'>('draw')
  const [liveCost, setLiveCost] = useState(0)
  // Multi-stroke draft: cellIndex (y*CANVAS.w+x) → color int. Strokes
  // accumulate; the whole draft is committed with ONE burn on Paint.
  const [draft, setDraft] = useState<Map<number, number>>(new Map())
  const draftRef = useRef<Map<number, number>>(new Map())
  draftRef.current = draft
  // ---- first free 256×128 spot for the limit guide rectangle
  const freeSpotRef = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const off = offscreenRef.current
    if (!off || freeSpotRef.current) return
    const ctx = off.getContext('2d')
    if (!ctx) return
    const img = ctx.getImageData(0, 0, CANVAS.w, CANVAS.h).data
    const painted = (x: number, y: number) => {
      const i = (y * CANVAS.w + x) * 4
      return img[i] !== 0 || img[i + 1] !== 0 || img[i + 2] !== 0
    }
    outer: for (let y = 8; y + 128 < CANVAS.h; y += 32) {
      for (let x = 8; x + 256 < CANVAS.w; x += 32) {
        let free = true
        for (let sy = 0; sy <= 128 && free; sy += 16)
          for (let sx = 0; sx <= 256 && free; sx += 16)
            if (painted(x + sx, y + sy)) free = false
        if (free) {
          freeSpotRef.current = { x, y }
          break outer
        }
      }
    }
    if (!freeSpotRef.current) freeSpotRef.current = { x: (CANVAS.w - 256) / 2, y: (CANVAS.h - 128) / 2 }
    setPlot((p) => p ?? { ...freeSpotRef.current!, vertical: false })
  }, [loaded])

  // Zoom the view onto the plot so the frame is big enough to grab —
  // called when the frame becomes movable (initial placement or full undo).

  // draft bounding box vs backend limit (256×128)
  const draftBox = (() => {
    if (draft.size === 0) return null
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    draft.forEach((_c, idx) => {
      const x = idx % CANVAS.w
      const y = Math.floor(idx / CANVAS.w)
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    })
    return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 }
  })()
  const boxTooBig = !!draftBox && (draftBox.w > 256 || draftBox.h > 128)
  const draftBoxRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null)
  draftBoxRef.current = draftBox
  // The fixed 256×128 drawing plot: auto-placed at the first free spot,
  // draggable (by its border) while the draft is empty, locked once you paint.
  const [plot, setPlot] = useState<{ x: number; y: number; vertical?: boolean } | null>(null)
  type Plot = { x: number; y: number; vertical?: boolean }
  const plotDims = useCallback((p: { vertical?: boolean } | null): [number, number] =>
    (() => {
      const w = info?.maxBoxWidth ?? 256
      const h = info?.maxBoxHeight ?? 128
      return p?.vertical ? [h, w] : [w, h]
    })(), [info?.maxBoxWidth, info?.maxBoxHeight])
  const plotRef = useRef<{ x: number; y: number; vertical?: boolean } | null>(null)
  plotRef.current = plot
  const [plotConfirmed, setPlotConfirmed] = useState(false)
  // Session flow: start → place (frame movable) → paint (locked) → back to start
  const [session, setSession] = useState<'start' | 'place' | 'paint'>('start')
  const resetToStart = useCallback(() => {
    setDraft(new Map())
    setPlotConfirmed(false)
    setSession('start')
    setPhase('idle')
    setPhaseError(null)
  }, [])
  const plotConfirmedRef = useRef(false)
  plotConfirmedRef.current = plotConfirmed
  const plotLocked = plotConfirmed || draft.size > 0

  const zoomToPlot = useCallback(() => {
    const canvasEl = canvasElRef.current
    const pl = plotRef.current
    if (!canvasEl || !pl) return
    const view = viewRef.current
    const [pw, ph] = plotDims(pl)
    const scale = Math.min(
      Math.min(40, (canvasEl.clientWidth * 0.8) / pw),
      Math.min(40, (canvasEl.clientHeight * 0.8) / ph),
    )
    view.scale = Math.max(minScaleRef.current, scale)
    view.offsetX = canvasEl.clientWidth / 2 - (pl.x + pw / 2) * view.scale
    view.offsetY = canvasEl.clientHeight / 2 - (pl.y + ph / 2) * view.scale
  }, [plotDims])
  useEffect(() => {
    if (plot && !plotLocked) zoomToPlot()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plot !== null, plotLocked])
  const plotLockedRef = useRef(false)
  plotLockedRef.current = plotLocked
  const movingPlotRef = useRef<{ dx: number; dy: number } | null>(null)
  const plotOverlayRef = useRef<HTMLDivElement | null>(null)
  const patternRef = useRef<CanvasPattern | null>(null)
  const sessionRef = useRef<'start' | 'place' | 'paint'>('start')
  sessionRef.current = session
  const minScaleRef = useRef<number>(0.06)
  const busyRef = useRef(false)
  const boxTooBigRef = useRef(false)
  boxTooBigRef.current = boxTooBig

  // stroke history for undo (snapshots, capped)
  const historyRef = useRef<Array<Map<number, number>>>([])
  const pushHistory = useCallback(() => {
    historyRef.current.push(new Map(draftRef.current))
    if (historyRef.current.length > 50) historyRef.current.shift()
  }, [])
  const undo = useCallback(() => {
    const prev = historyRef.current.pop()
    const nextSize = prev ? prev.size : draftRef.current.size
    if (prev) setDraft(prev)
    // undoing back to nothing returns the frame to movable mode
    if (nextSize === 0 && plotConfirmedRef.current) {
      setPlotConfirmed(false)
      setSession('place')
      zoomToPlot()
    }
  }, [])

  // Cmd/Ctrl+Z
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        const tag = (e.target instanceof HTMLElement ? e.target.tagName : '').toLowerCase()
        if (tag === 'input' || tag === 'textarea') return
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo])
  const [phase, setPhase] = useState<PaintPhase>('idle')
  const [phaseError, setPhaseError] = useState<string | null>(null)

  // --- refs (mutated inside pointer/rAF handlers, no re-render)
  const pixelsRef = useRef<Uint8ClampedArray>(new Uint8ClampedArray(PIXELS_LENGTH))
  const dirtyRef = useRef(true)
  const viewRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 })
  const drawingRef = useRef(false)
  const panningRef = useRef(false)
  const pointersRef = useRef(new Map<number, { x: number; y: number }>())
  const pinchActiveRef = useRef(false)
  // last pinch sample: finger distance + midpoint (pixel-velocity zoom model)
  const pinchPrevRef = useRef<{ dist: number; midX: number; midY: number } | null>(null)
  const strokePointsRef = useRef<Array<Point>>([])
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const canvasElRef = useRef<HTMLCanvasElement | null>(null)

  const wrapElRef = useRef<HTMLDivElement | null>(null)
  const seqRef = useRef(0)

  const busy = phase !== 'idle' && phase !== 'done' && phase !== 'error'
  busyRef.current = busy
  const draftCost = draft.size
  const cost = draftCost > 0 ? draftCost : liveCost

  /* ---------------- initial load + live updates ---------------- */

  /** Current wall color at a cell (from the live pixel buffer). */
  const wallColorAt = useCallback((x: number, y: number): number => {
    const px = pixelsRef.current
    const i = (y * CANVAS.w + x) * 4
    return (px[i] << 16) | (px[i + 1] << 8) | px[i + 2]
  }, [])

  const applyCells = useCallback((cells: Array<[number, number, number]>) => {
    const pixels = pixelsRef.current

    for (const [x, y, rgb] of cells) {
      if (x < 0 || y < 0 || x >= CANVAS.w || y >= CANVAS.h) continue

      const i = (y * CANVAS.w + x) * 4

      pixels[i] = (rgb >> 16) & 0xff
      pixels[i + 1] = (rgb >> 8) & 0xff
      pixels[i + 2] = rgb & 0xff
      pixels[i + 3] = 255
    }

    if (cells.length > 0) dirtyRef.current = true
  }, [])

  useEffect(() => {
    let disposed = false

    fetchCanvasPng(CANVAS.w, CANVAS.h)
      .then((data) => {
        if (disposed) return

        pixelsRef.current = data.length === PIXELS_LENGTH ? data : new Uint8ClampedArray(data)
        dirtyRef.current = true
        setLoaded(true)
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : String(err)))

    getInfo()
      .then((res) => {
        if (disposed) return
        if (res?.width && res?.height) setCanvasSize(res.width, res.height)
        setInfo(res)
      })
      .catch(() => setInfo(null)) // non-fatal: mint needed only at paint time

    const unsubscribe = subscribeDiffs(
      (msg) => {
        if (msg.type === 'diff') {
          seqRef.current = msg.seq
          setSeq(msg.seq)
          applyCells(msg.cells)
        } else if (msg.type === 'stats') {
          setPaintersOnline(msg.paintersOnline)
        }
      },
      (status) => setWsStatus(status),
    )

    // Polling fallback — also heals any diff missed between PNG snapshot and WS.
    const pollTimer = setInterval(() => {
      getCellsSince(seqRef.current)
        .then((res) => {
          seqRef.current = res.seq
          setSeq(res.seq)
          applyCells(res.cells)
        })
        .catch(() => undefined)
    }, 5000)

    return () => {
      disposed = true
      unsubscribe()
      clearInterval(pollTimer)
    }
  }, [applyCells])

  /* ---------------- rendering ---------------- */

  useEffect(() => {
    const offscreen = document.createElement('canvas')

    offscreen.width = CANVAS.w
    offscreen.height = CANVAS.h
    offscreenRef.current = offscreen

    let raf = 0

    const render = () => {
      raf = requestAnimationFrame(render)

      const canvasEl = canvasElRef.current
      const wrapEl = wrapElRef.current

      if (!canvasEl || !wrapEl || !offscreenRef.current) return

      const parentWidth = wrapEl.clientWidth
      const parentHeight = wrapEl.clientHeight

      if (canvasEl.width !== parentWidth || canvasEl.height !== parentHeight) {
        canvasEl.width = parentWidth
        canvasEl.height = parentHeight
        dirtyRef.current = true
      }

      if (dirtyRef.current) {
        const octx = offscreenRef.current.getContext('2d')

        if (octx) {
          const imageData = octx.createImageData(CANVAS.w, CANVAS.h)

          imageData.data.set(pixelsRef.current)
          octx.putImageData(imageData, 0, 0)
        }

        dirtyRef.current = false
      }

      const ctx = canvasEl.getContext('2d')

      if (!ctx) return

      const { scale, offsetX, offsetY } = viewRef.current
      const size = CANVAS.w * scale

      ctx.fillStyle = '#0a0a12'
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.imageSmoothingEnabled = false
      // patterned backdrop: everything not covered by the wall reads as "outside"
    if (!patternRef.current && ctx) {
      const pc = document.createElement('canvas')
      pc.width = 16
      pc.height = 16
      const pctx = pc.getContext('2d')
      if (pctx) {
        pctx.fillStyle = '#12121f'
        pctx.fillRect(0, 0, 16, 16)
        pctx.strokeStyle = 'rgba(255,255,255,0.09)'
        pctx.beginPath()
        pctx.moveTo(-4, 20)
        pctx.lineTo(20, -4)
        pctx.moveTo(-4, 4)
        pctx.lineTo(4, -4)
        pctx.moveTo(12, 20)
        pctx.lineTo(20, 12)
        pctx.stroke()
        patternRef.current = ctx.createPattern(pc, 'repeat')
      }
    }
    if (patternRef.current) {
      ctx.fillStyle = patternRef.current
      ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
    }
    ctx.drawImage(offscreenRef.current, offsetX, offsetY, CANVAS.w * scale, CANVAS.h * scale)

      // Grid when zoomed in enough
      if (scale >= 6) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.beginPath()

        for (let i = 0; i <= CANVAS.w; i += 8) {
          const gx = offsetX + i * scale
          ctx.moveTo(gx, offsetY)
          ctx.lineTo(gx, offsetY + CANVAS.h * scale)
        }
        for (let j = 0; j <= CANVAS.h; j += 8) {
          const gy = offsetY + j * scale
          ctx.moveTo(offsetX, gy)
          ctx.lineTo(offsetX + CANVAS.w * scale, gy)
        }

        ctx.stroke()
      }

      // Live stroke preview: accumulated draft at full opacity, grouped by
      // color; the in-progress stroke follows the pointer.
      const draftMap = draftRef.current
      const live = strokePointsRef.current

      if (draftMap.size > 0) {
        ctx.globalAlpha = 0.95
        const byColor = new Map<number, Array<{ x: number; y: number }>>()
        draftMap.forEach((c, idx) => {
          const arr = byColor.get(c) ?? []
          arr.push({ x: idx % CANVAS.w, y: Math.floor(idx / CANVAS.w) })
          byColor.set(c, arr)
        })
        byColor.forEach((cellsArr, c) => {
          ctx.fillStyle = colorToHex(c)
          fillCellRects(ctx, cellsArr, viewRef.current)
        })
        ctx.globalAlpha = 1
      }

      // The plot frame: fixed while drafting, draggable when empty.
      // Everything outside it is dimmed.
      {
        const pl = plotRef.current
        if (pl && tool !== 'pan' && sessionRef.current !== 'start' && !fullscreenRef.current) {
          const canvasElP = canvasElRef.current
          if (!canvasElP) return
          const canvasW = canvasElP.clientWidth
          const canvasH = canvasElP.clientHeight
          const view2 = viewRef.current
          const sx = view2.offsetX + pl.x * view2.scale
          const sy = view2.offsetY + pl.y * view2.scale
          const [pwF, phF] = plotDims(pl)
          const sw = pwF * view2.scale
          const sh = phF * view2.scale

          // gray-out outside the plot (darken + a faint lift so it reads on black)
          ctx.save()
          for (const fill of ['rgba(0,0,0,0.55)', 'rgba(255,255,255,0.05)']) {
            ctx.fillStyle = fill
            ctx.fillRect(0, 0, canvasW, sy)
            ctx.fillRect(0, sy + sh, canvasW, canvasH - sy - sh)
            ctx.fillRect(0, sy, sx, sh)
            ctx.fillRect(sx + sw, sy, canvasW - sx - sw, sh)
          }
          ctx.restore()

          // frame
          ctx.save()
          const locked = plotLockedRef.current
          ctx.lineWidth = 2
          if (locked) {
            ctx.strokeStyle = 'rgba(0,255,163,0.9)'
            ctx.setLineDash([])
          } else {
            ctx.strokeStyle = 'rgba(0,208,255,0.9)'
            ctx.setLineDash([8, 6])
            ctx.lineDashOffset = (Date.now() / 60) % 14
          }
          ctx.strokeRect(sx, sy, sw, sh)
          ctx.restore()

          // keep the MOOOXELS chip + confirm button right above the frame
          const overlay = plotOverlayRef.current
          if (overlay) {
            overlay.style.left = Math.max(6, Math.min(canvasW - 240, sx)) + 'px'
            overlay.style.top = Math.max(6, sy - 44) + 'px'
          }

          // hint while placeable
          if (!locked) {
            ctx.save()
            ctx.font = '12px sans-serif'
            ctx.fillStyle = 'rgba(200,200,221,0.9)'
            ctx.fillText('drag the frame to position it · ✓ to lock', sx + 8, sy - 6 > 12 ? sy - 6 : sy + sh + 14)
            ctx.restore()
          }
        }
      }
      if (live.length > 0 && drawingRef.current) {
        const { outline } = rasterizeStroke(live, brushSizeRef.current)
        const view = viewRef.current

        // never preview outside the plot frame
        const pl1 = plotRef.current
        if (pl1) {
          ctx.save()
          ctx.beginPath()
          const [pwC, phC] = plotDims(pl1)
          ctx.rect(
            view.offsetX + pl1.x * view.scale,
            view.offsetY + pl1.y * view.scale,
            pwC * view.scale,
            phC * view.scale,
          )
          ctx.clip()
        }

        ctx.globalAlpha = 0.6
        ctx.fillStyle = colorRef.current
        ctx.beginPath()
        outline.forEach((p, idx) => {
          const sx = view.offsetX + p.x * view.scale
          const sy = view.offsetY + p.y * view.scale

          if (idx === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        })
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1

        if (pl1) ctx.restore()
      }
    }

    raf = requestAnimationFrame(render)

    return () => cancelAnimationFrame(raf)
    // The rAF loop reads the latest values through refs below; deps are stable.
  }, [])

  // refs mirroring state for the rAF loop
  const brushSizeRef = useRef(brushSize)
  const colorRef = useRef(color)
  // eraser paints with the wall background (black) — it's still a paid write

  brushSizeRef.current = brushSize
  colorRef.current = tool === 'erase' ? '#000000' : color

  /* ---------------- viewport: zoom & pan ---------------- */

  useEffect(() => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()

      const view = viewRef.current

      if (event.ctrlKey || event.metaKey) {
        // pinch (trackpad) or ctrl+wheel: zoom at the cursor
        const rect = canvasEl.getBoundingClientRect()
        const mx = event.clientX - rect.left
        const my = event.clientY - rect.top
        const factor = Math.exp(-event.deltaY * 0.0015)
        const nextScale = Math.min(40, Math.max(minScaleRef.current, view.scale * factor))
        view.offsetX = mx - ((mx - view.offsetX) / view.scale) * nextScale
        view.offsetY = my - ((my - view.offsetY) / view.scale) * nextScale
        view.scale = nextScale
      } else {
        // plain wheel / two-finger scroll: pan
        view.offsetX -= event.deltaX
        view.offsetY -= event.deltaY
      }
    }

    // Attach at window level (gated to the canvas) so trackpad pinch over the
    // page chrome doesn't zoom the whole page — the canvas alone handles it.
    const onWheelWin = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null
      if (target !== canvasEl && !(target && canvasEl.contains(target))) return
      onWheel(event)
    }
    window.addEventListener('wheel', onWheelWin, { passive: false })

    // Safari/macOS trackpad pinch arrives as gesture* events, not wheel —
    // intercept them so the page itself doesn't zoom.
    const zoomAt = (clientX: number, clientY: number, factor: number) => {
      const rect = canvasEl.getBoundingClientRect()
      const mx = clientX - rect.left
      const my = clientY - rect.top
      const view = viewRef.current
      const nextScale = Math.min(40, Math.max(0.5, view.scale * factor))
      view.offsetX = mx - ((mx - view.offsetX) / view.scale) * nextScale
      view.offsetY = my - ((my - view.offsetY) / view.scale) * nextScale
      view.scale = nextScale
    }
    const onGestureStart = (e: Event) => e.preventDefault()
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      const ge = e as WheelEvent & { scale?: number; clientX?: number; clientY?: number }
      if (ge.scale && ge.scale > 0) zoomAt(ge.clientX ?? 0, ge.clientY ?? 0, ge.scale)
    }
    const gate = (h: (e: Event) => void) => (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target !== canvasEl && !(target && canvasEl.contains(target))) return
      h(e)
    }
    const onGestureStartG = gate(onGestureStart)
    const onGestureChangeG = gate(onGestureChange)
    window.addEventListener('gesturestart', onGestureStartG as EventListener, { passive: false })
    window.addEventListener('gesturechange', onGestureChangeG as EventListener, { passive: false })
    window.addEventListener('gestureend', onGestureStartG as EventListener, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheelWin)
      window.removeEventListener('gesturestart', onGestureStartG as EventListener)
      window.removeEventListener('gesturechange', onGestureChangeG as EventListener)
      window.removeEventListener('gestureend', onGestureStartG as EventListener)
    }
    // NOTE: canvas mounts only once past the network gate — re-run when that
    // flips, or the listeners never attach (trackpad pinch/wheel pan dead).
  }, [onSolana])

  // zoom-out floor: at least the whole wall fits
  const minScale = useCallback(() => {
    const canvasEl = canvasElRef.current
    if (!canvasEl) return 0.06
    return Math.min(canvasEl.clientWidth / (CANVAS.w * 1.05), canvasEl.clientHeight / (CANVAS.h * 1.05))
  }, [])

  minScaleRef.current = minScale()

  const zoomBy = useCallback((factor: number) => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    const view = viewRef.current
    const mx = canvasEl.clientWidth / 2
    const my = canvasEl.clientHeight / 2
    const nextScale = Math.min(40, Math.max(minScale(), view.scale * factor))

    view.offsetX = mx - ((mx - view.offsetX) / view.scale) * nextScale
    view.offsetY = my - ((my - view.offsetY) / view.scale) * nextScale
    view.scale = nextScale
  }, [minScale])

  const resetView = useCallback(() => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    const scale = Math.min(canvasEl.clientWidth / (CANVAS.w * 1.02), canvasEl.clientHeight / (CANVAS.h * 1.05))

    viewRef.current = {
      scale,
      offsetX: (canvasEl.clientWidth - CANVAS.w * scale) / 2,
      offsetY: (canvasEl.clientHeight - CANVAS.h * scale) / 2,
    }
  }, [])

  // fullscreen = clean wall view: nothing overlaid, wall fit to view
  const [isFs, setIsFs] = useState(false)
  // ESC during placement/painting behaves like ✕ cancel → back to Start
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (document.fullscreenElement) return // ESC exits fullscreen first
      if (busyRef.current) return // never mid-transaction
      if (sessionRef.current === 'start') return
      resetToStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetToStart])
  const fullscreenRef = useRef(false)
  useEffect(() => {
    const onChange = () => {
      const on = !!document.fullscreenElement
      setIsFs(on)
      fullscreenRef.current = on
      if (on) resetView()
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [resetView])

  useEffect(() => {
    const canvasEl = canvasElRef.current

    if (!canvasEl) return

    const observer = new ResizeObserver(() => {
      if (viewRef.current.scale === 1 && viewRef.current.offsetX === 0) resetView()
    })

    observer.observe(canvasEl)

    if (canvasEl.clientWidth > 0) resetView()

    return () => observer.disconnect()
  }, [resetView])

  /* ---------------- pointer input ---------------- */

  const screenToCanvas = useCallback((clientX: number, clientY: number): Point => {
    const canvasEl = canvasElRef.current as HTMLCanvasElement | null

    if (!canvasEl) return { x: 0, y: 0 }

    const rect = canvasEl.getBoundingClientRect()
    const view = viewRef.current

    return {
      x: (clientX - rect.left - view.offsetX) / view.scale,
      y: (clientY - rect.top - view.offsetY) / view.scale,
    }
  }, [])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      // Multi-touch bookkeeping: two fingers = pinch-zoom + pan, never draw.
      const pointers = pointersRef.current
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

      if (pointers.size >= 2) {
        // second finger down: cancel any in-progress stroke — the pinch
        // gesture (@use-gesture) owns two-finger input from here.
        drawingRef.current = false
        strokePointsRef.current = []
        setLiveCost(0)
        panningRef.current = false
        pinchActiveRef.current = true
        const [fa, fb] = Array.from(pointers.values())
        pinchPrevRef.current = { dist: Math.hypot(fa.x - fb.x, fa.y - fb.y), midX: (fa.x + fb.x) / 2, midY: (fa.y + fb.y) / 2 }
        return
      }
      if (pointers.size > 2 || pinchActiveRef.current) return

      if (tool === 'text') {
        if (event.button !== 0 || busy || !loaded) return
        if (!plotLockedRef.current) return
        const text = label.trim()
        if (!text) return
        const at = screenToCanvas(event.clientX, event.clientY)
        const fontPx = Math.max(8, brushSize * 6)
        const rawCells = rasterizeText(text, at.x, at.y, fontPx)
        const pl = plotRef.current
        const cells = pl
          ? rawCells.filter((c) => {
              const [pwT, phT] = plotDims(pl)
              return c.x >= pl.x && c.x < pl.x + pwT && c.y >= pl.y && c.y < pl.y + phT
            })
          : rawCells
        const colorNum = hexToColor(color)
        const changing = cells.filter((c) => wallColorAt(c.x, c.y) !== colorNum)
        if (changing.length === 0) return
        pushHistory()
        setDraft((prev) => {
          const next = new Map(prev)
          for (const c of changing) next.set(c.y * CANVAS.w + c.x, colorNum)
          return next
        })
        return
      }

      // Before confirmation the frame is freely draggable by grabbing
      // anywhere INSIDE it (drawing is disabled until locked).
      if (!plotLockedRef.current && plotRef.current) {
        const canvasEl0 = canvasElRef.current
        if (canvasEl0) {
          const rect0 = canvasEl0.getBoundingClientRect()
          const view0 = viewRef.current
          const px = event.clientX - rect0.left
          const py = event.clientY - rect0.top
          const cx0 = (px - view0.offsetX) / view0.scale
          const cy0 = (py - view0.offsetY) / view0.scale
          const p0 = plotRef.current
          const [pwI, phI] = plotDims(p0)
          const inside = cx0 >= p0.x - 8 && cx0 <= p0.x + pwI + 8 && cy0 >= p0.y - 8 && cy0 <= p0.y + phI + 8
          if (inside) {
            movingPlotRef.current = { dx: cx0 - p0.x, dy: cy0 - p0.y }
            event.currentTarget.setPointerCapture(event.pointerId)
            return
          }
        }
      }

      const wantPan = tool === 'pan' || event.button === 1 || event.button === 2

      if (wantPan) {
        panningRef.current = true
        event.currentTarget.setPointerCapture(event.pointerId)

        return
      }

      if (event.button !== 0 || busy || !loaded) return
      if (!plotLockedRef.current) return // frame not confirmed yet

      drawingRef.current = true
      strokePointsRef.current = [screenToCanvas(event.clientX, event.clientY)]
      setPhase('idle')
      setPhaseError(null)
      setLiveCost(0)
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [busy, color, label, loaded, screenToCanvas, tool],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      const pointers = pointersRef.current

      if (pointers.has(event.pointerId)) {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
      }

      // two-finger pinch: ZOOM BY PIXELS MOVED, not finger ratio —
      // spreading +100px ≈ ×1.42 zoom regardless of how close fingers started.
      const pp = pinchPrevRef.current
      if (pinchActiveRef.current && pp && pointers.size >= 2) {
        const [a, b] = Array.from(pointers.values())
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2
        const canvasEl = canvasElRef.current
        if (canvasEl) {
          const dPx = dist - pp.dist
          // k=0.0035: gentle, controllable — small pinches zoom proportionally
          const factor = Math.exp(dPx * 0.0035)
          const view = viewRef.current
          const target = Math.min(40, Math.max(minScaleRef.current, view.scale * factor))
          const nextScale = Math.min(view.scale * 1.05, Math.max(view.scale / 1.05, target))
          const rect = canvasEl.getBoundingClientRect()
          const mx = midX - rect.left
          const my = midY - rect.top
          view.offsetX = mx - ((mx - view.offsetX) / view.scale) * nextScale
          view.offsetY = my - ((my - view.offsetY) / view.scale) * nextScale
          view.scale = nextScale
        }
        // two-finger pan by midpoint delta
        const view = viewRef.current
        view.offsetX += midX - pp.midX
        view.offsetY += midY - pp.midY
        pinchPrevRef.current = { dist, midX, midY }
        return
      }
      if (pinchActiveRef.current && pointers.size >= 2) return

      if (movingPlotRef.current) {
        const canvasEl1 = canvasElRef.current
        if (canvasEl1) {
          const rect1 = canvasEl1.getBoundingClientRect()
          const view1 = viewRef.current
          const cx1 = (event.clientX - rect1.left - view1.offsetX) / view1.scale
          const cy1 = (event.clientY - rect1.top - view1.offsetY) / view1.scale
          const pM = plotRef.current
          const [pwM, phM] = plotDims(pM)
          const nx = Math.max(0, Math.min(CANVAS.w - pwM, Math.round(cx1 - movingPlotRef.current.dx)))
          const ny = Math.max(0, Math.min(CANVAS.h - phM, Math.round(cy1 - movingPlotRef.current.dy)))
          setPlot({ x: nx, y: ny, vertical: pM?.vertical })
        }
        return
      }

      if (panningRef.current) {
        const view = viewRef.current

        view.offsetX += event.movementX
        view.offsetY += event.movementY

        return
      }

      if (!drawingRef.current) return

      const point = screenToCanvas(event.clientX, event.clientY)
      const points = strokePointsRef.current
      const last = points[points.length - 1]

      if (last && Math.hypot(point.x - last.x, point.y - last.y) < 0.75) return

      points.push(point)
      setLiveCost(rasterizeStroke(points, brushSize).cells.length)
    },
    [brushSize, screenToCanvas],
  )

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      // multi-touch teardown
      pointersRef.current.delete(event.pointerId)
      if (pointersRef.current.size < 2) { pinchActiveRef.current = false; pinchPrevRef.current = null }

      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // pointer wasn't captured (e.g. second finger of a pinch) — fine
      }

      if (movingPlotRef.current) {
        movingPlotRef.current = null
        return
      }

      if (pinchActiveRef.current || pointersRef.current.size > 0) return

      if (panningRef.current) {
        panningRef.current = false

        return
      }

      if (!drawingRef.current) return

      drawingRef.current = false

      const { cells } = rasterizeStroke(strokePointsRef.current, brushSize)
      const colorNum = hexToColor(tool === 'erase' ? '#000000' : color)

      setLiveCost(0)

      if (cells.length === 0) {
        strokePointsRef.current = []

        return
      }

      // no-op writes are FREE: only cells that change the wall cost MOOOXELS
      // (erasing an already-black pixel, repainting the same color).
      const plS = plotRef.current
      const [pwS, phS] = plotDims(plS)
      const inFrame = (c: { x: number; y: number }) =>
        !plS || (c.x >= plS.x && c.x < plS.x + pwS && c.y >= plS.y && c.y < plS.y + phS)
      const changing = cells.filter((c) => inFrame(c) && wallColorAt(c.x, c.y) !== colorNum)
      if (changing.length > 0) {
        pushHistory()
        setDraft((prev) => {
          const next = new Map(prev)
          for (const c of changing) next.set(c.y * CANVAS.w + c.x, colorNum)
          return next
        })
      }
      strokePointsRef.current = []
    },
    [brushSize, color, pushHistory, tool, wallColorAt],
  )

  /* ---------------- paint flow ---------------- */

  const paint = useCallback(async () => {
    if (draft.size === 0 || !solanaAccount || !provider || !connection) return

    const cellsPayload: Array<Cell> = Array.from(draft.entries()).map(([idx, c]) => ({
      x: idx % CANVAS.w,
      y: Math.floor(idx / CANVAS.w),
      color: c,
    }))
    const amount = cellsPayload.length

    try {
      // 0. Pre-check: the wallet must actually hold enough MOOOXELS — a burn
      // from a missing/empty token account dies with a cryptic simulation error.
      setPhase('quoting')
      setPhaseError(null)
      const canvasInfo0 = info ?? (await getInfo())
      const mint0 = new PublicKey(canvasInfo0.mint)
      // Read the ATA specifically — it's the exact account the burn debits;
      // summing every token account can hide an unfunded ATA.
      const ata0 = getAssociatedTokenAddressSync(mint0, new PublicKey(solanaAccount))
      const ataInfo = await connection.getParsedAccountInfo(ata0)
      let held = 0
      const ataData = ataInfo.value?.data as
        | { parsed?: { info?: { tokenAmount?: { uiAmount?: number | null } } } }
        | Buffer
        | undefined
      if (ataData && !Buffer.isBuffer(ataData) && ataData.parsed) {
        held = ataData.parsed.info?.tokenAmount?.uiAmount ?? 0
      }
      // fee check: the burn debits a little SOL from the wallet; an empty SOL
      // balance is the classic "no record of a prior credit" simulation error.
      const lamports = await connection.getBalance(new PublicKey(solanaAccount))
      if (lamports < 5000) {
        setPhase('error')
        setPhaseError(
          'This wallet has no devnet SOL for the transaction fee. Open faucet.solana.com, ' +
            'paste your address, and try again (your MOOOXELS are fine).',
        )
        return
      }

      if (held < amount) {
        setPhase('error')
        setPhaseError(
          `This wallet holds ${Math.floor(held)} MOOOXELS but the draft needs ${amount}. ` +
            'Claim a code with THIS wallet first (see the balance above the frame).',
        )
        return
      }

      // 1. Quote: cost is the covered-cell count (1 MOOOXELS per pixel).
      setPhase('quoting')
      setPhaseError(null)

      const canvasInfo = info ?? (await getInfo())
      const mint = new PublicKey(canvasInfo.mint)

      // 2. Build burn tx: BurnChecked(N) + memo graffiti:v1:<pubkey>:<ts>
      setPhase('awaiting wallet')

      const owner = new PublicKey(solanaAccount)
      const ata = getAssociatedTokenAddressSync(mint, owner)
      const memo = `graffiti:v1:${solanaAccount}:${Math.floor(Date.now() / 1000)}`
      const memoIx = new TransactionInstruction({
        programId: SPL_MEMO_PROGRAM_ID,
        keys: [{ pubkey: owner, isSigner: true, isWritable: false }],
        data: Buffer.from(memo, 'utf-8'),
      })
      const burnIx = createBurnCheckedInstruction(ata, mint, owner, amount, 0, [])
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      const transaction = new Transaction({ feePayer: owner, blockhash, lastValidBlockHeight }).add(burnIx, memoIx)

      // 3. Sign & send via the wallet provider.
      const signature = await provider.sendTransaction(transaction, connection)

      // 4. Confirm on-chain.
      setPhase('confirming')
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed')

      // 5. Hand the proof to the backend, which broadcasts the diff.
      setPhase('painting')
      const res: DrawResponse = await postDraw({ txSignature: signature, walletPubkey: solanaAccount, cells: cellsPayload })

      if ('ok' in res && res.ok === false) {
        setPhase('error')
        setPhaseError((res as { reason?: string }).reason ?? 'draw rejected')
        return
      }

      setSession('start')
      setPlotConfirmed(false)
      seqRef.current = res.seq
      setSeq(res.seq)
      setDraft(new Map())
      setPhase('done')
      setTimeout(() => setPhase('idle'), 2500)
    } catch (err: unknown) {
      void postClientError({
        message: err instanceof Error ? err.message : String(err),
        wallet: solanaAccount ?? undefined,
        detail: JSON.stringify({ amount, cells: cellsPayload.length, mint: info?.mint }),
      })
      setPhase('error')
      setPhaseError(err instanceof Error ? err.message : String(err))
    }
  }, [connection, draft, info, provider, solanaAccount])

  /* ---------------- derived UI bits ---------------- */

  const wsDotColor = wsStatus === 'connected' ? '#00ffa3' : '#ffb800'
  const paintDisabled = !connected || draft.size === 0 || busy || boxTooBig

  // Welcome gate: painting requires the Solana network — show a panel while on EVM chains
  if (!onSolana) {
    return (
      <div style={{ ...styles.page, height: 'auto' }}>
        <div
          style={{
            ...styles.panel,
            maxWidth: 460,
            margin: '10vh auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 40 }}>🖍</span>
          <h2 style={{ margin: 0, color: '#fff', letterSpacing: 1 }}>GRAFFITI WALL</h2>
          <p style={{ color: '#b8b8cc', margin: 0, lineHeight: 1.5 }}>
            Welcome! This wall is painted with <strong style={{ color: '#00ffa3' }}>MOOOXELS</strong>, a
            Solana token — every painted cell burns 1 MOOOXELS.
            <br />
            You&apos;re currently on{' '}
            <strong style={{ color: '#fff' }}>{getChainInfo(chainId).name.toUpperCase()}</strong>. Select the{' '}
            <strong style={{ color: '#00ffa3' }}>Solana</strong> network to start painting.
          </p>
          <button
            style={{ ...styles.primaryButton, minWidth: 240 }}
            disabled={switching}
            onClick={() => void switchToSolana()}
          >
            {switching ? 'Switching…' : '→ Switch to Solana (devnet)'}
          </button>
          <span style={{ color: '#66667f', fontSize: 12 }}>
            or pick Solana from the network selector in the header
          </span>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>🖍 Graffiti Wall</span>
        <span style={styles.tag}>
          {info ? `${info.width}×${info.height}` : '…'} · 1 MOOOXELS per pixel · {info ? info.network : '…'}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ ...styles.tag, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ ...styles.dot, background: wsDotColor, boxShadow: `0 0 8px ${wsDotColor}` }} />
          {wsStatus === 'connected' ? `live · ${paintersOnline ?? '…'} painting` : 'reconnecting…'} · seq {seq}
        </span>
      </header>

      <div
        style={{
          ...styles.main,
          ...(narrow
            ? { flexDirection: 'column' as const, position: 'relative' as const, minHeight: 0, flex: '1 1 auto' }
            : {}),
        }}
      >
        <div
          ref={wrapElRef}
          style={{
            ...styles.canvasWrap,
            ...(narrow ? { width: '100%', height: 'auto', minHeight: '46vh', flex: '1 1 auto' } : {}),
          }}
        >

          {session === 'start' && !isFs && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 7,
                display: 'flex',
                ...(narrow
                  ? { alignItems: 'flex-end', justifyContent: 'stretch', padding: 8 }
                  : { alignItems: 'center', justifyContent: 'center', background: 'rgba(5,5,10,0.62)', backdropFilter: 'blur(2px)' }),
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  ...styles.panel,
                  pointerEvents: 'auto',
                  ...(narrow
                    ? { position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 'auto', minWidth: 0, padding: '6px 8px', gap: 6, background: 'rgba(16,16,28,0.92)' }
                    : {}),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  alignItems: 'center',
                  minWidth: 280,
                  textAlign: 'center',
                }}
              >
                {!narrow && <span style={{ fontSize: 38 }}>🖍</span>}
                {!narrow && (
                  <>
                    <h2 style={{ margin: 0, color: '#fff', letterSpacing: 2 }}>GRAFFITI WALL</h2>
                    <p style={{ margin: 0, color: '#8a8aa3', fontSize: 12, lineHeight: 1.5 }}>
                      4096×2048 shared wall · every pixel burns 1 MOOOXELS
                    </p>
                  </>
                )}
                <button
                  style={{ ...styles.primaryButton, ...(narrow ? { padding: '6px 10px', fontSize: 12 } : {}) }}
                  onClick={() => {
                    setSession('place')
                    zoomToPlot()
                  }}
                >
                  ✏ {narrow ? 'DRAW' : 'START DRAWING'}
                </button>
                <div style={{ display: 'flex', gap: 8, width: narrow ? 'auto' : '100%' }}>
                  <button
                    style={{ ...styles.button, flex: narrow ? undefined : 1, ...(narrow ? { padding: '6px 8px', fontSize: 12 } : {}) }}
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = `${API_BASE}/canvas.png`
                      a.download = 'graffiti-wall.png'
                      a.click()
                    }}
                  >
                    ⬇ {narrow ? 'img' : 'image'}
                  </button>
                  <button
                    style={{ ...styles.button, flex: narrow ? undefined : 1, ...(narrow ? { padding: '6px 8px', fontSize: 12 } : {}) }}
                    onClick={() => {
                      // fullscreen the CANVAS only (like the image export) — ESC exits
                      const wrap = wrapElRef.current
                      if (!wrap) return
                      if (document.fullscreenElement) void document.exitFullscreen()
                      else void wrap.requestFullscreen().catch(() => undefined)
                    }}
                  >
                    ⛶ {narrow ? 'full' : 'fullscreen'}
                  </button>
                </div>
                {(phase === 'done' || phase === 'error') && (
                  <p style={{ margin: 0, fontSize: 12, color: phase === 'error' ? '#ff5577' : '#00ffa3' }}>
                    {phase === 'done' ? '✓ your pixels are on the wall' : phaseError}
                  </p>
                )}
              </div>
            </div>
          )}
          <div
            ref={plotOverlayRef}
            style={{ position: 'absolute', zIndex: 6, pointerEvents: 'none', display: 'flex', gap: 8, alignItems: 'center' }}
          >
            {connected && session !== 'start' && !isFs && (
              <div
                style={{
                  borderRadius: 999,
                  border: '1px solid #00ffa3',
                  background: 'linear-gradient(135deg, rgba(0,255,163,0.18), rgba(0,208,255,0.18)), rgba(21,21,36,0.92)',
                  boxShadow: '0 0 14px rgba(0,255,163,0.45), inset 0 0 8px rgba(0,255,163,0.15)',
                  padding: '7px 15px',
                  fontSize: 14,
                  color: '#00ffa3',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                }}
              >
                MOOOXELS left {balance === null ? '…' : Math.max(0, Math.floor(balance - draftCost - liveCost))}
              </div>
            )}
            {!plotLocked && session !== 'start' && !isFs && (
              <button
                style={{ ...styles.button, pointerEvents: 'auto', borderRadius: 999, borderColor: '#2a2a40' }}
                onClick={() => {
                  setPlot((p) => {
                    if (!p) return p
                    const vert = !p.vertical
                    const pw = vert ? 128 : 256
                    const ph = vert ? 256 : 128
                    return {
                      x: Math.max(0, Math.min(CANVAS.w - pw, p.x)),
                      y: Math.max(0, Math.min(CANVAS.h - ph, p.y)),
                      vertical: vert,
                    }
                  })
                }}
              >
                ⟳ rotate
              </button>
            )}
            {!plotLocked && session !== 'start' && !isFs && (
              <button
                style={{
                  ...styles.button,
                  pointerEvents: 'auto',
                  borderRadius: 999,
                  border: '1px solid #00ffa3',
                  background: 'linear-gradient(135deg, rgba(0,255,163,0.18), rgba(0,208,255,0.18)), rgba(21,21,36,0.92)',
                  boxShadow: '0 0 14px rgba(0,255,163,0.45), inset 0 0 8px rgba(0,255,163,0.15)',
                  color: '#00ffa3',
                  fontWeight: 700,
                }}
                onClick={() => {
                  setPlotConfirmed(true)
                  setSession('paint')
                  zoomToPlot()
                }}
              >
                ✓ draw here
              </button>
            )}
          </div>
          {!isFs && (toolsVisible ? null : (
            <button
              onClick={() => setToolsVisible(true)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 5,
                ...styles.button,
                borderRadius: 999,
                border: '1px solid #00ffa3',
                background: 'linear-gradient(135deg, rgba(0,255,163,0.18), rgba(0,208,255,0.18)), rgba(21,21,36,0.92)',
                boxShadow: '0 0 14px rgba(0,255,163,0.45), inset 0 0 8px rgba(0,255,163,0.15)',
                color: '#00ffa3',
                fontWeight: 700,
                padding: '8px 16px',
              }}
            >
              <span style={{ filter: 'drop-shadow(0 0 6px #00ffa3)' }}>🧰</span> tools
            </button>
          ))}
          <canvas
            ref={canvasElRef}
            style={{ ...styles.canvas, cursor: tool === 'pan' ? 'grab' : tool === 'erase' ? 'cell' : tool === 'text' ? 'text' : 'crosshair' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* zoom controls */}
          <div style={{ position: 'absolute', left: 12, bottom: 12, display: 'flex', gap: 6, ...(isFs ? { display: 'none' } : {}) }}>
            <button style={styles.button} onClick={() => zoomBy(1.25)}>
              ＋
            </button>
            <button style={styles.button} onClick={() => zoomBy(0.8)}>
              －
            </button>
            <button style={styles.button} onClick={resetView}>
              fit
            </button>
            <button
              style={{ ...styles.button, borderColor: '#2a2a40' }}
              onClick={zoomToPlot}
              aria-label="zoom to frame"
            >
              ⌖ frame
            </button>
            <button
              style={{ ...styles.button, borderColor: tool === 'draw' ? '#00ffa3' : '#2a2a40',
                boxShadow: tool === 'draw' ? '0 0 10px rgba(0,255,163,0.35)' : 'none' }}
              onClick={() => setTool('draw')}
            >
              ✏ draw
            </button>
            <button
              style={{ ...styles.button, borderColor: tool === 'pan' ? '#00ffa3' : '#2a2a40',
              boxShadow: tool === 'pan' ? '0 0 10px rgba(0,255,163,0.35)' : 'none' }}
              onClick={() => setTool('pan')}
            >
              ✋ pan
            </button>
            <button
              style={{
                ...styles.button,
                borderColor: tool === 'text' ? '#00ffa3' : '#2a2a40',
                color: tool === 'text' ? '#00ffa3' : undefined,
                boxShadow: tool === 'text' ? '0 0 10px rgba(0,255,163,0.35)' : 'none',
              }}
              onClick={() => setTool('text')}
            >
              T text
            </button>
            <button
              style={{
                ...styles.button,
                borderColor: tool === 'erase' ? '#ff5577' : '#2a2a40',
                color: tool === 'erase' ? '#ff5577' : undefined,
                boxShadow: tool === 'erase' ? '0 0 10px rgba(255,85,119,0.35)' : 'none',
              }}
              onClick={() => setTool('erase')}
            >
              🧽 erase
            </button>
          </div>
          {loadError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(6,6,9,0.9)',
                color: '#ff5c8a',
                fontSize: 14,
                padding: 24,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 40 }}>🧱</div>
                <p>Could not load the wall from {API_BASE}</p>
                <p style={{ color: '#8a8aa3' }}>{loadError}</p>
              </div>
            </div>
          )}
        </div>

        {toolsVisible && (
          <aside
            style={{
              ...styles.sidebar,
              ...(narrow
                ? {
                    position: 'absolute' as const,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    maxHeight: '72vh',
                    overflowY: 'auto' as const,
                    overscrollBehavior: 'contain' as const,
                    WebkitOverflowScrolling: 'touch' as never,
                    touchAction: 'pan-y' as const,
                    zIndex: 8,
                    borderLeft: 'none',
                    borderTop: '1px solid #2a2a40',
                    borderRadius: '14px 14px 0 0',
                    background: 'rgba(16,16,28,0.96)',
                    backdropFilter: 'blur(8px)',
                    width: '100%',
                  }
                : {}),
            }}
          >
            {narrow && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '2px 0 8px' }}>
                <div style={{ width: 44, height: 4, borderRadius: 2, background: '#3a3a55' }} />
                <span style={{ fontSize: 10, color: '#8a8aa3' }}>scroll for more</span>
              </div>
            )}
            <button
              style={{
                ...styles.button,
                width: '100%',
                borderRadius: 999,
                border: '1px solid #00ffa3',
                background: 'linear-gradient(135deg, rgba(0,255,163,0.18), rgba(0,208,255,0.18)), rgba(21,21,36,0.92)',
                boxShadow: '0 0 14px rgba(0,255,163,0.45), inset 0 0 8px rgba(0,255,163,0.15)',
                color: '#00ffa3',
                fontWeight: 700,
              }}
              onClick={() => setToolsVisible(false)}
            >
              ⌄ hide tools
            </button>
          {tool === 'text' && (
            <div>
              <p style={styles.sectionTitle}>Label</p>
              <input
                type="text"
                value={label}
                maxLength={24}
                placeholder="type text…"
                onChange={(e) => setLabel(e.target.value)}
                style={{
                  ...styles.button,
                  width: '100%',
                  background: '#0d0d18',
                  textAlign: 'left',
                  userSelect: 'text',
                  WebkitUserSelect: 'text',
                }}
              />
              <p style={{ fontSize: 11, color: '#8a8aa3', margin: '6px 0 0' }}>
                size follows the brush ({Math.max(8, brushSize * 6)}px) — tap the wall to stamp, tap again to re-stamp
              </p>
            </div>
          )}
          <div>
            <p style={styles.sectionTitle}>Color</p>
            <div style={swatchGridStyle}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  aria-label={`color ${c}`}
                  onClick={() => setColor(c)}
                  style={{
                    ...styles.swatch,
                    background: c,
                    borderColor: color === c ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: 44, height: 32, background: 'none', border: 'none', cursor: 'pointer' }}
              />
              <span style={{ color: '#8a8aa3', fontSize: 12 }}>{color.toUpperCase()}</span>
            </div>
          </div>

          <div>
            <p style={styles.sectionTitle}>
              Brush · {brushSize}px
            </p>
            <input
              type="range"
              min={MIN_BRUSH}
              max={MAX_BRUSH}
              step={1}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#00ffa3' }}
            />
          </div>

          <div style={styles.costBox}>
            {plotLocked ? (
              <p style={{ margin: '0 0 6px', fontSize: 11, color: '#00ffa3' }}>
                📍 frame locked — undo everything to move it
              </p>
            ) : (
              <p style={{ margin: '0 0 6px', fontSize: 11, color: '#8a8aa3' }}>
                📍 drag the frame to position it, then ✓ draw here
              </p>
            )}
            <p style={{ ...styles.sectionTitle, marginBottom: 6 }}>
              {draftCost > 0 ? 'Your draft' : 'Drawing'}
            </p>
            <div style={styles.costValue}>
              {cost} <span style={{ fontSize: 13, color: '#8a8aa3' }}>MOOOXELS</span>
            </div>
            <p style={{ fontSize: 11, color: '#8a8aa3', margin: '4px 0 0' }}>
              {draftCost > 0 ? 'distinct pixels — one burn commits all' : 'pixels covered so far'}
            </p>
          </div>

          {!connected ? (
            <button style={styles.primaryButton} onClick={openSolanaWalletModal}>
              CONNECT WALLET TO PAINT
            </button>
          ) : (
            <button
              style={{ ...styles.primaryButton, opacity: paintDisabled ? 0.4 : 1 }}
              disabled={paintDisabled}
              onClick={paint}
            >
              {draftCost > 0 ? `COMMIT · BURN ${cost} MOOOXELS` : 'DRAW SOMETHING ✏'}
            </button>
          )}

          {session !== 'start' && !busy && (
            <button
              style={{ ...styles.button, width: '100%', borderColor: '#ff557755', color: '#ff5577' }}
              onClick={resetToStart}
            >
              ✕ cancel
            </button>
          )}

          {(draftCost > 0 || plotConfirmed) && !busy && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{ ...styles.button, flex: 1 }}
                onClick={undo}
                disabled={historyRef.current.length === 0}
              >
                ↩ undo
              </button>
              <button
                style={{ ...styles.button, flex: 1, borderColor: '#ff557755', color: '#ff5577' }}
                onClick={() => {
                  pushHistory()
                  setDraft(new Map())
                  setPlotConfirmed(false)
                  setSession('place')
                  zoomToPlot()
                }}
              >
                🗑 clear all
              </button>
            </div>
          )}
          {boxTooBig && (
            <div style={{ ...styles.costBox, borderColor: '#ff5577' }}>
              <p style={{ margin: 0, color: '#ff5577', fontSize: 12, lineHeight: 1.4 }}>
                drawing {draftBox?.w}×{draftBox?.h} exceeds the max area (256×128) — undo or clear and
                keep it smaller
              </p>
            </div>
          )}

          {(busy || phase === 'done' || phase === 'error') && (
            <div
              style={{
                ...styles.costBox,
                borderColor: phase === 'error' ? '#ff5c8a' : '#00ffa3',
                color: phase === 'error' ? '#ff5c8a' : '#00ffa3',
                fontSize: 12,
              }}
            >
              <strong>{PHASE_LABEL[phase]}</strong>
              {phaseError && <p style={{ color: '#ff9cb8', margin: '6px 0 0' }}>{phaseError}</p>}
            </div>
          )}

          <div style={{ marginTop: 'auto', fontSize: 11, color: '#5b5b72', lineHeight: 1.6 }}>
            pan: two fingers / pan tool · eraser paints black (1 MOOOXELS/cell)
            <br />
            every painted pixel burns 1 MOOOXELS (SPL)
            <br />
            network: {info?.network ?? 'devnet'}
          </div>
        </aside>
        )}
      </div>

      {(toolsVisible || busy || phase === 'done' || phase === 'error') && (
        <footer style={styles.footer}>
          <span>{PHASE_LABEL[phase] || 'draw on the wall — cost updates live'}</span>
        </footer>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const swatchGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: 6,
  marginTop: 8,
}

function fillCellRects(
  ctx: CanvasRenderingContext2D,
  cells: Array<{ x: number; y: number }>,
  view: { scale: number; offsetX: number; offsetY: number },
): void {
  ctx.beginPath()

  for (const { x, y } of cells) {
    ctx.rect(view.offsetX + x * view.scale, view.offsetY + y * view.scale, view.scale, view.scale)
  }

  ctx.fill()
}
