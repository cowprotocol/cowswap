import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { Article } from 'services/cms'

import SVG from 'react-inlinesvg'
import IMG_ICON_X from '@cowprotocol/assets/images/x.svg'

const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 970px;
  margin: 16px 0;
  position: relative;

  ${Media.upToMedium()} {
    padding: 0 16px;
  }
`

const Input = styled.input`
  padding: 16px 64px 16px 24px;
  min-height: 56px;
  border: 2px solid transparent;
  font-size: 21px;
  color: ${Color.neutral60};
  width: 100%;
  background: ${Color.neutral90};
  border-radius: 56px;
  appearance: none;
  font-weight: ${Font.weight.medium};
  transition: border 0.2s ease-in-out;

  ${Media.upToMedium()} {
    font-size: 18px;
    padding: 16px 50px 16px 24px;
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

const ResultItem = styled.a`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-flow: row wrap;
  text-decoration: none;
  color: ${Color.neutral0};
  line-height: 1.2;
  padding: 10px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${Color.neutral80};
    border-radius: 24px;
  }

  &:active {
    color: ${Color.neutral0};
  }
`

const HighlightedText = styled.span`
  background-color: yellow;
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

  useEffect(() => {
    if (query.trim()) {
      const filtered = articles.filter((article) =>
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
      part.toLowerCase() === query.toLowerCase() ? <HighlightedText key={index}>{part}</HighlightedText> : part
    )
  }

  const handleClear = () => {
    setQuery('')
    setFilteredArticles([])
  }

  return (
    <SearchBarContainer>
      <Input
        type="text"
        placeholder="Search any topic..."
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
      {isFocused && filteredArticles.length > 0 && (
        <SearchResults>
          <SearchResultsInfo>
            {filteredArticles.length} result{filteredArticles.length > 1 ? 's' : ''}
          </SearchResultsInfo>
          <SearchResultsInner>
            {filteredArticles.map((article) => (
              <ResultItem key={article.id} href={`learn/${article.attributes?.slug}`}>
                {highlightQuery(article.attributes?.title || '', query)}
              </ResultItem>
            ))}
          </SearchResultsInner>
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}
