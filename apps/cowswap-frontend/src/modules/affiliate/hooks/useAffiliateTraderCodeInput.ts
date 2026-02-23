import { useAtomValue, useSetAtom } from 'jotai'
import { type FormEvent, useCallback, useState } from 'react'

import { useAffiliateTraderCodeFromUrl } from './useAffiliateTraderCodeFromUrl'

import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export interface UseAffiliateTraderCodeInputResult {
  codeInput: string
  savedCode?: string
  error?: string
  setError(error?: string): void
  onChange(event: FormEvent<HTMLInputElement>): void
  onEdit(): void
  onRemove(): void
}

export function useAffiliateTraderCodeInput(): UseAffiliateTraderCodeInputResult {
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)

  const [codeInput, setCodeInput] = useState<string>(savedCode ?? '')
  const [error, setErrorState] = useState<string | undefined>(undefined)

  useAffiliateTraderCodeFromUrl({ savedCode, setError: setErrorState, setCodeInput })

  const setError = useCallback((nextError?: string): void => {
    setErrorState(nextError)
  }, [])

  const onChange = useCallback((event: FormEvent<HTMLInputElement>): void => {
    setCodeInput(event.currentTarget.value.trim().toUpperCase())
    setErrorState(undefined)
  }, [])

  const onEdit = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput(savedCode ?? '')
    setErrorState(undefined)
  }, [savedCode, setSavedCode])

  const onRemove = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput('')
    setErrorState(undefined)
  }, [setSavedCode])

  return {
    codeInput,
    savedCode,
    error,
    setError,
    onChange,
    onEdit,
    onRemove,
  }
}
