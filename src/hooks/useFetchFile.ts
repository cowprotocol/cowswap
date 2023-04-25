import { useEffect, useState } from 'react'

function getErrorMessage(filePath: string, res: Response): string {
  return `Error fetching file ${filePath} - status: ${res.statusText}`
}

export default function useFetchFile(filePath: string) {
  const [file, setFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFile = async () => {
      await fetch(filePath)
        .then(async (res) => {
          if (res.ok) {
            const fileContent = await res.text()
            setFile(fileContent)
          } else {
            setError(getErrorMessage(filePath, res))
          }
        })
        .catch((res) => {
          setError(`Error fetching file ${filePath} - status: ${res.statusText}`)
        })
    }

    fetchFile()
  }, [filePath])

  return { file, error }
}
