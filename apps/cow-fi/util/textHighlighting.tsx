import React from 'react'
import styled from 'styled-components/macro'

const HighlightedText = styled.span`
  background: yellow;
`

/**
 * Checks if a word starts with a search term
 * @param word The word to check
 * @param searchTerm The search term to look for
 * @returns True if the word starts with the search term
 */
export const wordStartsWith = (word: string, searchTerm: string): boolean => {
  return word.toLowerCase().startsWith(searchTerm.toLowerCase())
}

/**
 * Checks if a word exactly matches a search term
 * @param word The word to check
 * @param searchTerm The search term to look for
 * @returns True if the word exactly matches the search term
 */
export const wordExactlyMatches = (word: string, searchTerm: string): boolean => {
  return word.toLowerCase() === searchTerm.toLowerCase()
}

/**
 * Highlights a substring within a word
 * @param word The original word
 * @param startIndex The start index of the highlight
 * @param endIndex The end index of the highlight
 * @param key React key for the component
 * @returns React elements with highlighted substring
 */
export const highlightSubstring = (
  word: string,
  startIndex: number,
  endIndex: number,
  key: number | string,
): React.ReactNode => {
  if (startIndex < 0 || endIndex > word.length || startIndex >= endIndex) {
    return <span key={key}>{word}</span> // Safety check
  }

  return (
    <span key={key}>
      {startIndex > 0 && word.substring(0, startIndex)}
      <HighlightedText>{word.substring(startIndex, endIndex)}</HighlightedText>
      {endIndex < word.length && word.substring(endIndex)}
    </span>
  )
}

/**
 * Processes a single word for highlighting based on search criteria
 * @param word The word to process
 * @param searchWords Array of search terms
 * @param isLastWordSearch Whether to check for prefix matching with the last search word
 * @param key React key for the component
 * @returns React elements with appropriate highlighting
 */
export const processWordForHighlighting = (
  word: string,
  searchWords: string[],
  isLastWordSearch: boolean,
  key: number | string,
): React.ReactNode => {
  // If it's just whitespace, return it as is
  if (word.trim() === '') {
    return <span key={key}>{word}</span>
  }

  const lowerWord = word.toLowerCase()

  // For multi-word searches with a last word to check for prefix
  if (isLastWordSearch) {
    const lastWord = searchWords[searchWords.length - 1]

    // Check if the word starts with the last search word
    if (wordStartsWith(word, lastWord)) {
      return highlightSubstring(word, 0, lastWord.length, key)
    }

    // Check if any of the previous words match exactly
    for (let i = 0; i < searchWords.length - 1; i++) {
      if (wordExactlyMatches(word, searchWords[i])) {
        return <HighlightedText key={key}>{word}</HighlightedText>
      }
    }
  }
  // For single-word searches
  else if (searchWords.length === 1) {
    const searchTerm = searchWords[0]

    // If the word includes the search term
    if (lowerWord.includes(searchTerm)) {
      const pos = lowerWord.indexOf(searchTerm)
      return highlightSubstring(word, pos, pos + searchTerm.length, key)
    }
  }

  // Return the word as is if it doesn't match
  return <span key={key}>{word}</span>
}

/**
 * Highlights search query terms within a text
 * @param text The text to highlight within
 * @param query The search query
 * @returns React elements with highlighted search terms
 */
export const highlightQuery = (text: string, query: string): React.ReactNode => {
  // Handle empty queries or text
  if (!query.trim() || !text) return text

  const searchTerm = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Split search into words
  const searchWords = searchTerm.split(/\s+/).filter(Boolean)

  // If it's a multi-word search
  if (searchWords.length > 1) {
    // Check if the entire search term exists in the text
    if (textLower.includes(searchTerm)) {
      const pos = textLower.indexOf(searchTerm)
      return highlightSubstring(text, pos, pos + searchTerm.length, 'full-match')
    }

    // Split by whitespace but keep the separators
    const words = text.split(/(\s+)/)

    // Process each word
    return words.map((word, index) => processWordForHighlighting(word, searchWords, true, index))
  }

  // For single-word searches
  const words = text.split(/(\s+)/)
  return words.map((word, index) => processWordForHighlighting(word, searchWords, false, index))
}
