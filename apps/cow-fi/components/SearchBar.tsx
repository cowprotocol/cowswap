import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'
import { Article } from 'services/cms'
import SVG from 'react-inlinesvg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import IMG_ICON_SEARCH from '@cowprotocol/assets/images/icon-search.svg'
import { highlightQuery } from '../util/textHighlighting'

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
  padding: 0 10px 54px 0;

  /* Firefox scrollbar styling */
  @supports (scrollbar-width: thin) {
    scrollbar-width: thin;
    scrollbar-color: ${Color.neutral70} ${Color.neutral90};
  }

  @supports (-webkit-appearance: none) {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background-color: ${Color.neutral90};
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${Color.neutral70};
      border-radius: 10px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: ${Color.neutral50};
    }

    &::-webkit-scrollbar-button {
      display: none;
    }

    &::-webkit-scrollbar-corner {
      background-color: transparent;
    }
  }

  @supports (-webkit-overflow-scrolling: touch) {
    -webkit-overflow-scrolling: touch; /* Enables momentum scrolling on iOS */

    &::-webkit-scrollbar {
      -webkit-appearance: none;
      width: 7px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: ${Color.neutral70};
      -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
    }
  }
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
  overflow: hidden;
  line-height: 1.5;

  /* Add prefixed properties for broader browser support */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  /* Standard properties for future browser support */
  line-clamp: 2;
  box-orient: vertical;
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
  // Cache for memoized phrases to avoid recomputation
  const phrasesCache = useRef<Record<string, string[]>>({})
  const MAX_CACHE_ENTRIES = 100 // Limit cache size

  // Helper to manage cache size
  const addToCache = (key: string, value: string[]) => {
    // If cache is full, remove oldest entry
    const cacheKeys = Object.keys(phrasesCache.current)
    if (cacheKeys.length >= MAX_CACHE_ENTRIES) {
      delete phrasesCache.current[cacheKeys[0]]
    }
    phrasesCache.current[key] = value
  }

  // Constants for optimization
  const MAX_PHRASE_LENGTH = 4 // Limit phrases to 4 words maximum
  const DEBOUNCE_DELAY = 150 // ms

  // Debounced query state for performance
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce the search input to reduce processing frequency
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, DEBOUNCE_DELAY)

    return () => clearTimeout(timer)
  }, [query])

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
    if (debouncedQuery.trim()) {
      const searchTerm = debouncedQuery.toLowerCase()

      // TODO: Performance consideration
      // This multi-criteria search implementation works well for moderate datasets,
      // but may become expensive for large article collections.
      // If scaling is anticipated, consider implementing:
      // 1. An indexing-based approach (e.g., Elasticlunr, Fuse.js)
      // 2. Server-side search with pagination
      const filtered = (articles || []).filter((article) => {
        const title = article.attributes?.title?.toLowerCase() || ''
        const description = article.attributes?.description?.toLowerCase() || ''
        const slug = article.attributes?.slug?.toLowerCase() || ''

        // Track if we've found a match to avoid redundant checks
        let foundMatch = false

        // 1. Check if the entire search term is contained in the title, description, or slug
        if (title.includes(searchTerm) || description.includes(searchTerm) || slug.includes(searchTerm)) {
          foundMatch = true
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
          foundMatch = true
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
              foundMatch = true
              return true
            }
          }
        }

        // 4. Check if the entire search term is a prefix of any phrase in the content
        // Only perform expensive phrase checking if other checks fail and the content is not too long
        if (!foundMatch) {
          // Lazy evaluation - only generate phrases if needed
          const titlePhrases = title.length < 1000 ? findPhrases(title) : []
          const descriptionPhrases = description.length < 1000 ? findPhrases(description) : []
          const slugPhrases = findPhrases(slug) // Slugs are typically short

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
  }, [debouncedQuery, articles])

  // Optimized helper function to find phrases in a text
  const findPhrases = (text: string): string[] => {
    // Return empty array for empty text
    if (!text || text.length === 0) return []

    // Check cache first
    if (phrasesCache.current[text]) {
      return phrasesCache.current[text]
    }

    const words = text.split(/\s+/).filter(Boolean)
    const phrases: string[] = []

    // Generate phrases with limited length
    for (let i = 0; i < words.length; i++) {
      let phrase = words[i]
      phrases.push(phrase)

      // Limit to MAX_PHRASE_LENGTH consecutive words
      const maxJ = Math.min(i + MAX_PHRASE_LENGTH - 1, words.length - 1)
      for (let j = i + 1; j <= maxJ; j++) {
        phrase += ' ' + words[j]
        phrases.push(phrase)
      }
    }

    // Store in cache for future use
    addToCache(text, phrases)

    return phrases
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
