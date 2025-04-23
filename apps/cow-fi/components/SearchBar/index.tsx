import IMG_ICON_SEARCH from '@cowprotocol/assets/images/icon-search.svg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'
import { useDebounce, useMediaQuery, useOnClickOutside } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import SVG from 'react-inlinesvg'
import { Article } from 'services/cms'
import { searchArticlesAction } from '../../app/actions'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { highlightQuery } from '@/util/textHighlighting'
import { DEBOUNCE_DELAY, MIN_SEARCH_LENGTH, PAGE_SIZE } from './const'
import {
  CloseIcon,
  ErrorMessage,
  Input,
  InputContainer,
  LoadingIndicator,
  ResultDescription,
  ResultItem,
  ResultTitle,
  SearchBarContainer,
  SearchIcon,
  SearchResults,
  SearchResultsInfo,
  SearchResultsInner,
} from './styled'

interface SearchBarProps {}

export const SearchBar: React.FC<SearchBarProps> = () => {
  const [query, setQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreResults, setHasMoreResults] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMinLengthMessage, setShowMinLengthMessage] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isMediumUp = useMediaQuery(Media.MediumAndUp(false))
  const router = useRouter()

  // Use custom debounce hook
  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY)

  // Function to reset search results state
  const resetSearchResults = (errorMessage: string | null = null) => {
    setFilteredArticles([])
    setTotalResults(0)
    setHasMoreResults(false)
    setError(errorMessage)
  }

  // Handle selection for keyboard navigation
  const handleSelect = (index: number) => {
    if (index >= 0 && index < filteredArticles.length) {
      const selectedArticle = filteredArticles[index]
      router.push(`/learn/${selectedArticle.attributes?.slug}?ref=learn_search`)
    }
  }

  // Handle escape key
  const handleEscape = () => {
    setIsFocused(false)
    setQuery('')
    resetSearchResults(null)
    inputRef.current?.blur()
  }

  // Use custom keyboard navigation hook with improved focus management
  const highlightedIndex = useKeyboardNavigation(
    isFocused,
    filteredArticles.length,
    handleSelect,
    handleEscape,
    searchContainerRef,
  )

  // Server-side search using the searchArticlesAction
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim()

    if (trimmedQuery.length === 0) {
      setShowMinLengthMessage(false)
      resetSearchResults(null)
      return
    }

    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setShowMinLengthMessage(true)
      resetSearchResults(null)
      return
    }

    setShowMinLengthMessage(false)
    setCurrentPage(0) // Reset to first page on new search
    setError(null) // Clear any previous errors

    startTransition(async () => {
      try {
        const result = await searchArticlesAction({ searchTerm: trimmedQuery, page: 0, pageSize: PAGE_SIZE })
        if (result.success && result.data) {
          setFilteredArticles(result.data.data)
          setTotalResults(result.data.meta.pagination.total)
          setHasMoreResults(result.data.meta.pagination.pageCount > 1)
        } else {
          console.error('Search failed:', result.error)
          resetSearchResults('Unable to complete search. Please try again.')
        }
      } catch (error) {
        console.error('Error searching articles:', error)
        resetSearchResults('An error occurred while searching. Please try again.')
      }
    })
  }, [debouncedQuery])

  // Function to load more results - memoized to prevent unnecessary recreations
  const loadMoreResults = useCallback(async () => {
    if (debouncedQuery.trim().length >= MIN_SEARCH_LENGTH && hasMoreResults && !isLoadingMore) {
      const nextPage = currentPage + 1
      setIsLoadingMore(true)

      try {
        const result = await searchArticlesAction({ searchTerm: debouncedQuery, page: nextPage, pageSize: PAGE_SIZE })
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
  }, [debouncedQuery, currentPage, hasMoreResults, isLoadingMore])

  // Scroll to highlighted result and ensure it's visible
  useEffect(() => {
    if (highlightedIndex >= 0 && resultsRef.current) {
      const highlightedElement = resultsRef.current.children[highlightedIndex + 1] as HTMLElement
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        highlightedElement.focus() // Ensure the highlighted item receives focus for screen readers
      }
    }
  }, [highlightedIndex])

  // Memoized clear handler to prevent unnecessary recreations
  const handleClear = useCallback(() => {
    setQuery('')
    resetSearchResults(null)
    setShowMinLengthMessage(false)
    // Refocus input after clearing
    inputRef.current?.focus()
  }, [])

  // Handle clicks outside using the useOnClickOutside hook
  const handleClickOutside = useCallback(() => {
    if (isMediumUp) {
      // Close search results when clicking outside on medium screens and up
      setIsFocused(false)
    }
  }, [isMediumUp])

  useOnClickOutside([searchContainerRef], handleClickOutside)

  // Keep results visible if there's a query, even when input loses focus - memoized for performance
  const shouldShowResults = useMemo(
    () =>
      (isFocused &&
        (filteredArticles.length > 0 ||
          isPending ||
          error ||
          showMinLengthMessage ||
          debouncedQuery.trim().length >= MIN_SEARCH_LENGTH)) ||
      (!isMediumUp &&
        query.trim() &&
        (filteredArticles.length > 0 || showMinLengthMessage || debouncedQuery.trim().length >= MIN_SEARCH_LENGTH)),
    [isFocused, filteredArticles.length, isPending, error, showMinLengthMessage, isMediumUp, query, debouncedQuery],
  )

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
            ) : showMinLengthMessage ? (
              <SearchResultsInfo>Please enter at least {MIN_SEARCH_LENGTH} characters to search</SearchResultsInfo>
            ) : filteredArticles.length === 0 ? (
              <SearchResultsInfo>No results found for "{debouncedQuery}"</SearchResultsInfo>
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
                    tabIndex={index === highlightedIndex ? 0 : -1}
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
                    tabIndex={filteredArticles.length === highlightedIndex ? 0 : -1}
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
