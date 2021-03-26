import { useEffect, useState } from 'react'

export default function useFetchFile(filePath: string) {
  const [file, setFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFile = async () => {
      await fetch(filePath)
        .then(res => res.text())
        .then(text => {
          setFile(text)
        })
        .catch(res => {
          setError(`Error fetching file ${filePath} - status: ${res.statusText}`)
        })
    }

    fetchFile()
  }, [filePath])

  return { file, error }
}
