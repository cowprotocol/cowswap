import { useState, useEffect, PropsWithChildren } from 'react'

type Props = {
  waitBeforeShow?: number
}

export const Delayed = ({ children, waitBeforeShow = 1500 }: PropsWithChildren<Props>) => {
  const [isShown, setIsShown] = useState(false)

  console.log('DELAYED RENDER: ', children)
  console.log('waitBeforeShow: ', waitBeforeShow)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(true)
    }, waitBeforeShow)
    return () => clearTimeout(timer)
  }, [waitBeforeShow])

  return isShown ? <>{children}</> : null
}

export default Delayed
