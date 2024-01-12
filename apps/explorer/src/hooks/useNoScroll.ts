import { useEffect } from 'react'

const useNoScroll = (scrollCondition: boolean): void => {
  useEffect((): (() => void) | void => {
    if (typeof document === 'undefined') return

    const noScrollActive = document.body.classList.contains('noScroll')

    if (noScrollActive && !scrollCondition) {
      document.body.classList.remove('noScroll')
    } else if (!noScrollActive && scrollCondition) {
      document.body.classList.add('noScroll')
    }

    return (): void => document.body.classList.remove('noScroll')
  }, [scrollCondition])
}

export default useNoScroll
