import React, { useRef, useEffect, AnchorHTMLAttributes } from 'react'

interface FileSaverLinkProps {
  data?: string | (() => string)
  options?: BlobPropertyBag
  filename: string
}

export const FileDownloaderLink: React.FC<FileSaverLinkProps & AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  data: _data,
  options,
  filename,
  ...anchorProps
}) => {
  const lastObjectURL = useRef('')
  const lastDataUsed = useRef('')

  useEffect(
    () => (): void => {
      // on unmount release ObjectURL if any
      if (lastObjectURL.current) URL.revokeObjectURL(lastObjectURL.current)
    },
    [],
  )

  // only create download onClick because
  // creating and retaining BLob and ObjectURL can be expensive on each render
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
    const data = typeof _data === 'function' ? _data() : _data
    // no data
    if (!data) {
      // prevent invalid file download
      e.preventDefault()
      return
    }
    // data didn't change, reusing already set ObjectURL
    if (lastDataUsed.current === data) return
    lastDataUsed.current = data

    // new data, need new ObjectURL
    // release old if was set previously
    if (lastObjectURL.current) URL.revokeObjectURL(lastObjectURL.current)

    const blob = new Blob([data], options)
    e.currentTarget.href = lastObjectURL.current = URL.createObjectURL(blob)
  }

  return <a href={lastObjectURL.current} download={filename} onClick={handleClick} {...anchorProps} />
}
