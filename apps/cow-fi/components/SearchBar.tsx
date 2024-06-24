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
  color: ${Color.neutral50};
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
  align-items: center;
  justify-content: flex-start;
  flex-flow: row wrap;
  white-space: pre;
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
      const filtered = (articles || []).filter((article) =>
        article.attributes?.title?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredArticles(filtered)
    } else {
      setFilteredArticles([])
    }
  }, [query, articles])

  const highlightQuery = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        <span key={index}>{part}</span>
      )
    )
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
                {highlightQuery(article.attributes?.title || '', query)}
              </ResultItem>
            ))}
          </SearchResultsInner>
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}
