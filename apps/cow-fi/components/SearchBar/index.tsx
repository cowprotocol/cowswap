import React, { useState, useEffect, useRef, useTransition } from 'react'
import { useMediaQuery, useOnClickOutside, useDebounce } from '@cowprotocol/common-hooks'
import { Article } from 'services/cms'
import SVG from 'react-inlinesvg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import IMG_ICON_SEARCH from '@cowprotocol/assets/images/icon-search.svg'
import { highlightQuery } from '../../util/textHighlighting'
import { searchArticlesAction } from '../../app/actions'
import {
  SearchBarContainer,
  InputContainer,
  SearchIcon,
  Input,
  SearchResults,
  SearchResultsInner,
  ResultItem,
  ResultTitle,
  ResultDescription,
  SearchResultsInfo,
  LoadingIndicator,
  ErrorMessage,
  CloseIcon,
  DEBOUNCE_DELAY,
  PAGE_SIZE,
} from './styled'
import { Media } from '@cowprotocol/ui'

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

interface SearchBarProps {
  articles: Article[] // This is still needed for initial rendering
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
  const isMediumUp = useMediaQuery(Media.MediumAndUp(false))

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
