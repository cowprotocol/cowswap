import { useCallback, useEffect, useRef, useState } from 'react'

import { normalizeError } from '@cowprotocol/common-utils'

import { loadArtwork } from './artwork.utils'
import { SAMPLES } from './solverLogoTool.constants'
import { LogoAsset, SampleKey } from './solverLogoTool.types'

interface SourceController extends SourceState {
  loadFile(file: File | SampleKey): Promise<void>
  loadSample(sample: SampleKey): Promise<void>
  setError(error: string): void
  setSolverName(name: string): void
}
interface SourceState {
  asset: LogoAsset | null
  sampleKey: SampleKey | null
  solverName: string
  loading: boolean
  error: string
}

export function useLogoSource(): SourceController {
  const [source, setSource] = useState<SourceState>({
    asset: null,
    sampleKey: 'fibrous',
    solverName: 'Fibrous',
    loading: true,
    error: '',
  })
  const lifecycle = useRef({ id: 0, disposed: false, asset: null as LogoAsset | null })
  const loadFile = useCallback(async (input: File | SampleKey): Promise<void> => {
    const request = lifecycle.current,
      id = ++request.id
    const current = (): boolean => !request.disposed && id === request.id
    setSource((previous) => ({ ...previous, loading: true, error: '' }))
    try {
      const file = typeof input === 'string' ? await sampleFile(input) : input
      const asset = await loadArtwork(file)
      if (!current()) {
        asset.dispose()
        return
      }
      request.asset?.dispose()
      request.asset = asset
      const sampleKey = typeof input === 'string' ? input : null
      const solverName = sampleKey
        ? SAMPLES[sampleKey].name
        : file.name
            .replace(/\.[^.]+$/, '')
            .replace(/[-_]+/g, ' ')
            .slice(0, 60)
      setSource({ asset, sampleKey, solverName, loading: false, error: '' })
    } catch (err: unknown) {
      const error = normalizeError(err)
      if (current()) setSource((previous) => ({ ...previous, error: error.message, loading: false }))
    }
  }, [])
  useEffect(() => {
    const request = lifecycle.current
    request.disposed = false
    void loadFile('fibrous')
    return (): void => {
      request.disposed = true
      request.id++
      request.asset?.dispose()
      request.asset = null
    }
  }, [loadFile])
  return {
    ...source,
    loadFile,
    loadSample: loadFile,
    setError: (error): void => setSource((previous) => ({ ...previous, error })),
    setSolverName: (solverName): void => setSource((previous) => ({ ...previous, solverName })),
  }
}

async function sampleFile(sample: SampleKey): Promise<File> {
  const source = SAMPLES[sample],
    response = await fetch(source.url)
  if (!response.ok) throw new Error('The example could not be loaded. You can still upload your own logo.')
  return new File([await response.blob()], source.file, {
    type: source.file.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
  })
}
