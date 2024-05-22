import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Font, Color, Media } from '@cowprotocol/ui'
import { Article } from 'services/cms'

// const SearchBar = styled.input`
//   padding: 16px 24px;
//   min-height: 56px;
//   border: 2px solid transparent;
//   font-size: 21px;
//   color: ${Color.neutral60};
//   margin: 16px 0;
//   max-width: 970px;
//   width: 100%;
//   background: ${Color.neutral90};
//   border-radius: 56px;
//   appearance: none;
//   font-weight: ${Font.weight.medium};
//   transition: border 0.2s ease-in-out;

//   &:focus {
//     outline: none;
//     border: 2px solid ${Color.neutral50};
//   }

//   &::placeholder {
//     color: inherit;
//     transition: color 0.2s ease-in-out;
//   }

//   &:focus::placeholder {
//     color: transparent;
//   }
// `

const SearchBarContainer = styled.div`
  width: 100%;
  max-width: 970px;
  margin: 16px 0;
`

const Input = styled.input`
  padding: 16px 24px;
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
  margin-top: 16px;
  width: 100%;
  max-width: 970px;
  background: ${Color.neutral90};
  border-radius: 16px;
  padding: 16px;
`

const ResultItem = styled.a`
  display: block;
  padding: 8px 16px;
  text-decoration: none;
  color: ${Color.neutral0};
  border-bottom: 1px solid ${Color.neutral80};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${Color.neutral80};
  }
`

interface SearchBarProps {
  articles: Article[]
}

export const SearchBar: React.FC<SearchBarProps> = ({ articles }) => {
  const [query, setQuery] = useState('')
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])

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

  return (
    <SearchBarContainer>
      <Input type="text" placeholder="Search any topic..." value={query} onChange={(e) => setQuery(e.target.value)} />
      {filteredArticles.length > 0 && (
        <SearchResults>
          {filteredArticles.map((article) => (
            <ResultItem key={article.id} href={`learn/${article.attributes?.slug}`}>
              {article.attributes?.title}
            </ResultItem>
          ))}
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}
