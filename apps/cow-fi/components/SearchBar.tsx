import React, { useState, useEffect, useRef, useTransition } from 'react'
import styled from 'styled-components/macro'
import { Font, Color, Media } from '@cowprotocol/ui'
import { useMediaQuery, useOnClickOutside, useDebounce } from '@cowprotocol/common-hooks'
import { Article } from 'services/cms'
import SVG from 'react-inlinesvg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import IMG_ICON_SEARCH from '@cowprotocol/assets/images/icon-search.svg'
import { highlightQuery } from '../util/textHighlighting'
import { searchArticlesAction } from '../app/actions'

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

// Added loading indicator styles
const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Color.neutral50};
  padding: 10px;

  &::after {
    content: '';
    width: 16px;
    height: 16px;
    margin-left: 8px;
    border: 2px solid ${Color.neutral80};
    border-top-color: ${Color.neutral50};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

// Added error message styles
const ErrorMessage = styled(SearchResultsInfo)`
  color: #e74c3c;
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

// Constants for optimization
const DEBOUNCE_DELAY = 300 // ms
const PAGE_SIZE = 100 // Number of results per page

interface SearchBarProps {
  articles: Article[] // This is still needed for initial rendering
}

// Custom hook for keyboard navigation
const useKeyboardNavigation = (
  isActive: boolean,
  itemsLength: number,
  onSelect: (index: number) => void,
  onEscape: () => void,
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    if (!isActive) {
      setSelectedIndex(-1)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prevIndex) => (prevIndex + 1) % Math.max(1, itemsLength))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prevIndex) => (prevIndex - 1 + itemsLength) % Math.max(1, itemsLength))
          break
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < itemsLength) {
            onSelect(selectedIndex)
          }
          break
        case 'Escape':
          onEscape()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, itemsLength, onSelect, onEscape])

  return selectedIndex
}

export const SearchBar: React.FC<SearchBarProps> = ({ articles }) => {
  const [query, setQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreResults, setHasMoreResults] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isMediumUp = !useMediaQuery(Media.upToMedium(false))

  // Use custom debounce hook
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY)

  // Handle selection for keyboard navigation
  const handleSelect = (index: number) => {
    if (index >= 0 && index < filteredArticles.length) {
      const selectedArticle = filteredArticles[index]
      window.location.href = `/learn/${selectedArticle.attributes?.slug}?ref=learn_search`
    }
  }

  // Handle escape key
  const handleEscape = () => {
    setIsFocused(false)
    setQuery('')
    setFilteredArticles([])
    inputRef.current?.blur()
  }

  // Use custom keyboard navigation hook
  const highlightedIndex = useKeyboardNavigation(isFocused, filteredArticles.length, handleSelect, handleEscape)

  // Server-side search using the searchArticlesAction
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setCurrentPage(0) // Reset to first page on new search
      setError(null) // Clear any previous errors

      startTransition(async () => {
        try {
          const result = await searchArticlesAction(debouncedQuery, 0, PAGE_SIZE)
          if (result.success && result.data) {
            setFilteredArticles(result.data.data)
            setTotalResults(result.data.meta.pagination.total)
            setHasMoreResults(result.data.meta.pagination.pageCount > 1)
          } else {
            console.error('Search failed:', result.error)
            setError('Unable to complete search. Please try again.')
            setFilteredArticles([])
            setTotalResults(0)
            setHasMoreResults(false)
          }
        } catch (error) {
          console.error('Error searching articles:', error)
          setError('An error occurred while searching. Please try again.')
          setFilteredArticles([])
          setTotalResults(0)
          setHasMoreResults(false)
        }
      })
    } else {
      setFilteredArticles([])
      setTotalResults(0)
      setHasMoreResults(false)
      setError(null)
    }
  }, [debouncedQuery])

  // Function to load more results
  const loadMoreResults = async () => {
    if (debouncedQuery.trim() && hasMoreResults && !isLoadingMore) {
      const nextPage = currentPage + 1
      setIsLoadingMore(true)

      try {
        const result = await searchArticlesAction(debouncedQuery, nextPage, PAGE_SIZE)
        if (result.success && result.data) {
          setFilteredArticles((prevArticles) => [...prevArticles, ...result.data.data])
          setCurrentPage(nextPage)
          setHasMoreResults(nextPage < result.data.meta.pagination.pageCount - 1)
        } else {
          setError('Unable to load more results. Please try again.')
        }
      } catch (error) {
        console.error('Error loading more results:', error)
        setError('Failed to load additional results. Please try again.')
      } finally {
        setIsLoadingMore(false)
      }
    }
  }

  // Scroll to highlighted result
  useEffect(() => {
    if (highlightedIndex >= 0 && resultsRef.current) {
      const highlightedElement = resultsRef.current.children[highlightedIndex + 1] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  const handleClear = () => {
    setQuery('')
    setFilteredArticles([])
    setTotalResults(0)
    setHasMoreResults(false)
    setError(null)
    // Refocus input after clearing
    inputRef.current?.focus()
  }

  // Handle clicks outside using the useOnClickOutside hook
  const handleClickOutside = () => {
    if (isMediumUp) {
      // Close search results when clicking outside on medium screens and up
      setIsFocused(false)
    }
  }

  useOnClickOutside([searchContainerRef], handleClickOutside)

  // Keep results visible if there's a query, even when input loses focus
  const shouldShowResults =
    (isFocused && (filteredArticles.length > 0 || isPending || error)) ||
    (!isMediumUp && query.trim() && filteredArticles.length > 0)

  return (
    <SearchBarContainer ref={searchContainerRef}>
      <InputContainer>
        <SearchIcon>
          <SVG src={IMG_ICON_SEARCH} />
        </SearchIcon>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Hi, how can we help you?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          aria-label="Search articles"
          aria-controls="search-results"
          aria-expanded={!!shouldShowResults}
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `result-${highlightedIndex}` : undefined}
          role="combobox"
        />
        {query && (
          <CloseIcon
            onClick={handleClear}
            aria-label="Clear search"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClear()
              }
            }}
          >
            <SVG src={IMG_ICON_X} />
          </CloseIcon>
        )}
      </InputContainer>

      {shouldShowResults && (
        <SearchResults id="search-results" role="listbox" aria-label="Search results">
          <SearchResultsInner ref={resultsRef}>
            {isPending ? (
              <LoadingIndicator>Searching...</LoadingIndicator>
            ) : error ? (
              <ErrorMessage role="alert">{error}</ErrorMessage>
            ) : filteredArticles.length === 0 ? (
              <SearchResultsInfo>No results found</SearchResultsInfo>
            ) : (
              <>
                <SearchResultsInfo>
                  {totalResults > 0 ? `Found ${totalResults} results` : 'Search results'}
                </SearchResultsInfo>
                {filteredArticles.map((article, index) => (
                  <ResultItem
                    key={article.id}
                    href={`/learn/${article.attributes?.slug}?ref=learn_search`}
                    isSelected={index === highlightedIndex}
                    id={`result-${index}`}
                    role="option"
                    aria-selected={index === highlightedIndex}
                  >
                    <ResultTitle>{highlightQuery(article.attributes?.title || 'No title', debouncedQuery)}</ResultTitle>
                    <ResultDescription>
                      {highlightQuery(article.attributes?.description || 'No description', debouncedQuery)}
                    </ResultDescription>
                  </ResultItem>
                ))}
                {hasMoreResults && (
                  <ResultItem
                    as="button"
                    onClick={loadMoreResults}
                    isSelected={filteredArticles.length === highlightedIndex}
                    style={{ width: '100%', cursor: 'pointer', border: 'none', textAlign: 'center' }}
                    id={`result-${filteredArticles.length}`}
                    role="option"
                    aria-selected={filteredArticles.length === highlightedIndex}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <ResultTitle>Loading more results...</ResultTitle>
                    ) : (
                      <ResultTitle>Load more results</ResultTitle>
                    )}
                  </ResultItem>
                )}
              </>
            )}
          </SearchResultsInner>
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}
