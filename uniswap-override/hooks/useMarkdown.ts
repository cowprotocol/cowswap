import { useEffect, useState } from 'react'

export default function useMarkdown(file: string) {
  const [content, setContent] = useState('')

  useEffect(() => {
    const fetchContent = async () => {
      await fetch(file)
        .then((res) => res.text())
        .then((text) => {
          setContent(text)
        })
        .catch((error) => {
          console.log(`Error fetching markdown content file ${file}: `, error)
          return null
        })
    }

    fetchContent()
  }, [file])

  return content
}
