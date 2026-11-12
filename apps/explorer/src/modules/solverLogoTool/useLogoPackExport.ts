import { useEffect, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { createAiPack } from './aiPack.utils'
import { drawArtwork } from './artwork.utils'
import { createCanvas } from './canvas.utils'
import { createLogoPack, downloadPack } from './export.utils'
import { LogoAsset, LogoSnapshot, LogoTransform } from './solverLogoTool.types'

interface ExportState {
  source: LogoAsset | null
  kind: PackKind | null
  message: string
}
interface PackController {
  exporting: PackKind | null
  status: string
  exportPack(kind: PackKind): Promise<void>
}
type PackKind = 'logo' | 'ai'
interface Source {
  asset: LogoAsset | null
  solverName: string
  loading: boolean
  setError(error: string): void
}

export function useLogoPackExport(source: Source, transform: LogoTransform): PackController {
  const [state, setState] = useState<ExportState>({ source: null, kind: null, message: '' })
  const lifecycle = useRef({ mounted: false, busy: false })
  useEffect(() => {
    const session = lifecycle.current
    session.mounted = true
    return (): void => {
      session.mounted = false
    }
  }, [])
  const exportPack = async (kind: PackKind): Promise<void> => {
    const session = lifecycle.current
    if (!source.asset || session.busy || source.loading) return
    const snapshot: LogoSnapshot = {
      name: source.solverName.trim() || 'Solver',
      asset: source.asset,
      state: { ...transform },
      artwork: createCanvas(),
    }
    drawArtwork(snapshot.artwork, snapshot.asset, snapshot.state)
    session.busy = true
    source.setError('')
    setState({ source: snapshot.asset, kind, message: '' })
    try {
      const pack = await (kind === 'ai' ? createAiPack(snapshot) : createLogoPack(snapshot))
      downloadPack(pack)
      const message =
        'Downloaded ' + pack.filename + (kind === 'ai' ? '. Attach it to your chat, then paste the prompt.' : '')
      if (session.mounted) setState({ source: snapshot.asset, kind: null, message })
    } catch (err: unknown) {
      const error = normalizeError(err)
      if (session.mounted) {
        source.setError('Could not create the pack. ' + error.message + ' Your logo and adjustments are still here.')
        setState({ source: snapshot.asset, kind: null, message: '' })
      }
    } finally {
      session.busy = false
    }
  }
  return { exporting: state.kind, status: state.source === source.asset ? state.message : '', exportPack }
}
