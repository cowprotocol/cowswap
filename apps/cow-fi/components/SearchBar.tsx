import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'
import { Article } from 'services/cms'
import SVG from 'react-inlinesvg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import IMG_ICON_SEARCH from '@cowprotocol/assets/images/icon-search.svg'

const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 970px;
  margin: 0 auto;
  position: relative;

  ${Media.upToMedium()} {
    padding: 0 16px;
  }
`

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const SearchIcon = styled.div`
  position: absolute;
  left: 24px;
  width: 24px;
  height: 24px;
  color: ${Color.neutral70};

  ${Media.upToMedium()} {
    left: 16px;
  }
`

const Input = styled.input`
  padding: 16px 64px 16px 64px;
  min-height: 56px;
  border: 2px solid transparent;
  font-size: 21px;
  color: ${Color.neutral40};
  width: 100%;
  background: ${Color.neutral90};
  border-radius: 56px;
  appearance: none;
  font-weight: ${Font.weight.medium};
  transition: border 0.2s ease-in-out;

  ${Media.upToMedium()} {
    font-size: 18px;
    padding: 16px 50px 16px 50px;
  }

  &:focus {
    outline: none;
    border: 2px solid ${Color.neutral50};
  }

  &::placeholder {
    color: inherit;
    transition: color 0.2s ease-in-out;
  }

  &:focus::placeholder {
    color: transparent;
  }
`

const SearchResults = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  width: 100%;
  max-width: 970px;
  max-height: 300px;
  overflow: hidden;
  background: ${Color.neutral98};
  border-radius: 24px;
  padding: 10px 0 10px 10px;
  border: 1px solid ${Color.neutral80};
  font-size: 15px;
  z-index: 10;

  ${Media.upToMedium()} {
    left: 16px;
    max-width: calc(100% - 32px);
  }
`

const SearchResultsInner = styled.div`
  max-height: 280px;
  overflow-y: auto;
  padding-right: 10px;
`

const ResultItem = styled.a<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  text-decoration: none;
  color: ${Color.neutral0};
  line-height: 1.2;
  padding: 10px;
  background: ${({ isSelected }) => (isSelected ? Color.neutral80 : 'transparent')};
  border-radius: ${({ isSelected }) => (isSelected ? '24px' : '0')};

  &:hover {
    background: ${Color.neutral80};
    border-radius: 24px;
  }

  &:active {
    color: ${Color.neutral0};
  }
`

const ResultTitle = styled.div`
  font-weight: ${Font.weight.medium};
  margin-bottom: 4px;
  white-space: pre-wrap;
`

const ResultDescription = styled.div`
  font-size: 12px;
  color: ${Color.neutral40};
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const HighlightedText = styled.span`
  background: yellow;
`

const SearchResultsInfo = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  color: ${Color.neutral50};
  padding: 10px;
`

const CloseIcon = styled.div`
  --size: 32px;
  position: absolute;
  top: 50%;
  right: 24px;
  transform: translateY(-50%);
  cursor: pointer;
  background: ${Color.neutral90};
  color: ${Color.neutral60};
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);

  ${Media.upToMedium()} {
    --size: 28px;
    right: 28px;
  }

  &:hover {
    background: ${Color.neutral80};
  }

  > svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`

interface SearchBarProps {
  articles: Article[]
}

export const SearchBar: React.FC<SearchBarProps> = ({ articles }) => {
  const [query, setQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocused(false)
        setQuery('')
        setFilteredArticles([])
        inputRef.current?.blur() // Remove focus from the input
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFocused) {
        if (e.key === 'ArrowDown') {
          setHighlightedIndex((prevIndex) => (prevIndex + 1) % filteredArticles.length)
        } else if (e.key === 'ArrowUp') {
          setHighlightedIndex((prevIndex) => (prevIndex - 1 + filteredArticles.length) % filteredArticles.length)
        } else if (e.key === 'Enter') {
          if (highlightedIndex >= 0 && highlightedIndex < filteredArticles.length) {
            const selectedArticle = filteredArticles[highlightedIndex]
            window.location.href = `/learn/${selectedArticle.attributes?.slug}`
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFocused, highlightedIndex, filteredArticles])

  useEffect(() => {
    if (query.trim()) {
      const searchTerm = query.toLowerCase()

      const filtered = (articles || []).filter((article) => {
        const title = article.attributes?.title?.toLowerCase() || ''
        const description = article.attributes?.description?.toLowerCase() || ''
        const slug = article.attributes?.slug?.toLowerCase() || ''

        // 1. Check if the entire search term is contained in the title, description, or slug
        if (title.includes(searchTerm) || description.includes(searchTerm) || slug.includes(searchTerm)) {
          return true
        }

        // 2. Check if the search term is a prefix of any word in the title, description, or slug
        const titleWords = title.split(/\s+/).filter(Boolean)
        const descriptionWords = description.split(/\s+/).filter(Boolean)
        const slugWords = slug.split(/[-\s]+/).filter(Boolean)

        if (
          titleWords.some((word) => word.startsWith(searchTerm)) ||
          descriptionWords.some((word) => word.startsWith(searchTerm)) ||
          slugWords.some((word) => word.startsWith(searchTerm))
        ) {
          return true
        }

        // 3. For multi-word search terms, check if all words except the last one are found,
        // and the last word is a prefix of any word
        const searchWords = searchTerm.split(/\s+/).filter(Boolean)
        if (searchWords.length > 1) {
          const lastWord = searchWords[searchWords.length - 1]
          const previousWords = searchWords.slice(0, -1)

          // Check if all previous words are found in the content
          const allPreviousWordsFound = previousWords.every(
            (word) => title.includes(word) || description.includes(word) || slug.includes(word),
          )

          if (allPreviousWordsFound && lastWord.length > 0) {
            // Check if the last word is a prefix of any word
            const lastWordIsPrefix =
              titleWords.some((word) => word.startsWith(lastWord)) ||
              descriptionWords.some((word) => word.startsWith(lastWord)) ||
              slugWords.some((word) => word.startsWith(lastWord))

            if (lastWordIsPrefix) {
              return true
            }
          }

          // 4. Check if the entire search term is a prefix of any phrase in the content
          const titlePhrases = findPhrases(title)
          const descriptionPhrases = findPhrases(description)
          const slugPhrases = findPhrases(slug)

          if (
            titlePhrases.some((phrase) => phrase.startsWith(searchTerm)) ||
            descriptionPhrases.some((phrase) => phrase.startsWith(searchTerm)) ||
            slugPhrases.some((phrase) => phrase.startsWith(searchTerm))
          ) {
            return true
          }
        }

        return false
      })

      setFilteredArticles(filtered)
    } else {
      setFilteredArticles([])
    }
  }, [query, articles])

  // Helper function to find all possible phrases in a text
  const findPhrases = (text: string): string[] => {
    const words = text.split(/\s+/)
    const phrases: string[] = []

    // Generate all possible phrases (combinations of consecutive words)
    for (let i = 0; i < words.length; i++) {
      let phrase = words[i]
      phrases.push(phrase)

      for (let j = i + 1; j < words.length; j++) {
        phrase += ' ' + words[j]
        phrases.push(phrase)
      }
    }

    return phrases
  }

  const highlightQuery = (text: string, query: string) => {
    if (!query.trim()) return text

    const searchTerm = query.toLowerCase()
    const textLower = text.toLowerCase()

    // For multi-word searches, we need to handle each word separately
    const searchWords = searchTerm.split(/\s+/).filter(Boolean)

    // If it's a multi-word search
    if (searchWords.length > 1) {
      // Check if the entire search term exists in the text
      if (textLower.includes(searchTerm)) {
        const pos = textLower.indexOf(searchTerm)
        return (
          <>
            {text.substring(0, pos)}
            <HighlightedText>{text.substring(pos, pos + searchTerm.length)}</HighlightedText>
            {text.substring(pos + searchTerm.length)}
          </>
        )
      }

      // Handle the last word as a prefix match
      const lastWord = searchWords[searchWords.length - 1]
      const words = text.split(/(\s+)/) // Split by whitespace but keep the separators

      return words.map((word, index) => {
        const lowerWord = word.toLowerCase()

        // If it's just whitespace, return it as is
        if (word.trim() === '') {
          return <span key={index}>{word}</span>
        }

        // Check if the word starts with the last search word
        if (lowerWord.startsWith(lastWord)) {
          return (
            <span key={index}>
              <HighlightedText>{word.substring(0, lastWord.length)}</HighlightedText>
              {word.substring(lastWord.length)}
            </span>
          )
        }

        // Check if any of the previous words match exactly
        for (let i = 0; i < searchWords.length - 1; i++) {
          if (lowerWord === searchWords[i]) {
            return <HighlightedText key={index}>{word}</HighlightedText>
          }
        }

        // Return the word as is if it doesn't match
        return <span key={index}>{word}</span>
      })
    }

    // For single-word searches (original logic)
    const words = text.split(/(\s+)/) // Split by whitespace but keep the separators

    return words.map((word, index) => {
      const lowerWord = word.toLowerCase()

      // If it's just whitespace, return it as is
      if (word.trim() === '') {
        return <span key={index}>{word}</span>
      }

      // If the word includes the search term or starts with it
      if (lowerWord.includes(searchTerm) || lowerWord.startsWith(searchTerm)) {
        // Find the position of the search term
        const pos = lowerWord.indexOf(searchTerm)

        if (pos === 0) {
          // If the word starts with the search term
          return (
            <span key={index}>
              <HighlightedText>{word.substring(0, searchTerm.length)}</HighlightedText>
              {word.substring(searchTerm.length)}
            </span>
          )
        } else {
          // If the search term is in the middle of the word
          return (
            <span key={index}>
              {word.substring(0, pos)}
              <HighlightedText>{word.substring(pos, pos + searchTerm.length)}</HighlightedText>
              {word.substring(pos + searchTerm.length)}
            </span>
          )
        }
      }

      // Return the word as is if it doesn't match
      return <span key={index}>{word}</span>
    })
  }

  const handleClear = () => {
    setQuery('')
    setFilteredArticles([])
    setHighlightedIndex(-1)
  }

  return (
    <SearchBarContainer>
      <InputContainer>
        <SearchIcon>
          <SVG src={IMG_ICON_SEARCH} title="Search" />
        </SearchIcon>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Hi, how can we help you?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {query && (
          <CloseIcon onClick={handleClear}>
            <SVG src={IMG_ICON_X} title="Close search" />
          </CloseIcon>
        )}
      </InputContainer>
      {isFocused && filteredArticles.length > 0 && (
        <SearchResults>
          <SearchResultsInfo>
            {filteredArticles.length} result{filteredArticles.length > 1 ? 's' : ''}
          </SearchResultsInfo>
          <SearchResultsInner>
            {filteredArticles.map((article, index) => (
              <ResultItem
                key={article.id}
                href={`/learn/${article.attributes?.slug}`}
                isSelected={index === highlightedIndex}
              >
                <ResultTitle>{highlightQuery(article.attributes?.title || '', query)}</ResultTitle>
                {article.attributes?.description && (
                  <ResultDescription>{highlightQuery(article.attributes?.description || '', query)}</ResultDescription>
                )}
              </ResultItem>
            ))}
          </SearchResultsInner>
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}
