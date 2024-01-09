import { useEffect, useRef } from 'react'

const useScrollIntoView = <T extends HTMLElement>(
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'nearest' },
): React.RefObject<T> => {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current && ref.current.scrollIntoView(options)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return ref
}

export default useScrollIntoView
