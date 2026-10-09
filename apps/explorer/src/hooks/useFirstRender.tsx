import { useEffect, useState } from 'react'

export default function useFirstRender(): boolean {
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    setIsFirstRender(false)
  }, [])

  return isFirstRender
}
