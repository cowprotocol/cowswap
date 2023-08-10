import { useEffect } from 'react'

import { useAppDispatch } from 'legacy/state/hooks'

import useParsedQueryString from './useParsedQueryString'

import { updateUserExpertMode } from '../state/user/reducer'

export default function ApeModeQueryParamReader(): null {
  useApeModeQueryParamReader()
  return null
}

function useApeModeQueryParamReader() {
  const dispatch = useAppDispatch()
  const { ape } = useParsedQueryString()

  useEffect(() => {
    if (typeof ape !== 'string') return
    if (ape === '' || ape.toLowerCase() === 'true') {
      dispatch(updateUserExpertMode({ userExpertMode: true }))
    }
  })
}
