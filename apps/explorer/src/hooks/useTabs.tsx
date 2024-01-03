import React, { useCallback } from 'react'
import styled from 'styled-components'

import useSafeState from 'hooks/useSafeState'
import { MEDIA } from 'const'

const TabsWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-flow: row nowrap;
  width: 100%;
  justify-content: center;
  border-bottom: 0.1rem solid var(--color-text-secondary);
  align-items: center;

  @media ${MEDIA.mobile} {
    margin: 0 auto;
  }

  .countContainer {
    display: flex;
    flex-flow: row nowrap;
    height: 6.4rem;
    width: 100%;
    margin: 0 0 -0.1rem;
    align-items: center;

    > button {
      font-weight: var(--font-weight-bold);
      font-size: 1.5rem;
      color: var(--color-text-secondary);
      letter-spacing: 0;
      text-align: center;
      background: transparent;
      height: 100%;
      outline: 0;
      text-transform: uppercase;
      display: flex;
      flex: 1 1 25%;
      width: 100%;
      justify-content: center;
      transition: border 0.2s ease-in-out;
      align-items: center;
      border-bottom: 0.3rem solid transparent;

      > i {
        font-weight: inherit;
        font-size: 1.1rem;
        color: var(--color-background-pageWrapper);
        letter-spacing: -0.046rem;
        text-align: center;
        background: var(--color-text-secondary);
        border-radius: 6rem;
        padding: 0 0.75rem;
        box-sizing: border-box;
        line-height: 1.8rem;
        font-style: normal;
        display: inline-block;
        height: 1.8rem;
        margin: 0 0 0 0.5rem;
      }

      @media ${MEDIA.mobile} {
        flex: 1;
        font-size: 1.2rem;
        min-height: 5.4rem;
        > i {
          font-size: 0.9rem;
          height: 1.3rem;
          line-height: 1.36rem;
        }
      }
      @media ${MEDIA.xSmallDown} {
        flex-flow: column nowrap;
        > i {
          margin: 0.3rem auto;
        }
      }
    }

    > button.selected {
      border-bottom: 0.3rem solid var(--color-text-active);
      color: var(--color-text-active);
    }

    > button.selected > i {
      background: var(--color-text-active);
    }
  }
`

export interface TabData<T extends string> {
  type: T
  count?: string | number
}

interface TabsProps<T extends string> {
  className?: string
  tabsList?: TabData<T>[]
  selectedTab: T
  setSelectedTabFactory: (type: T) => (event: React.SyntheticEvent<HTMLButtonElement | HTMLFormElement>) => void
}

interface UseTabsReturn<T extends string> {
  selectedTab: T
  tabsProps: Pick<TabsProps<T>, 'tabsList' | 'selectedTab' | 'setSelectedTabFactory'>
}

export function useTabs<T extends string>(defaultTab: T, tabsList: TabData<T>[] = []): UseTabsReturn<T> {
  const [selectedTab, setSelectedTab] = useSafeState<T>(defaultTab)
  const setSelectedTabFactory = useCallback(
    (type: T): (() => void) =>
      (): void =>
        setSelectedTab(type),
    [setSelectedTab],
  )

  return {
    selectedTab,
    tabsProps: {
      selectedTab,
      tabsList,
      setSelectedTabFactory,
    },
  }
}

// can pass {..tabProps} from useTabs
// or override individual props on <Tabs {...tabProps} selectedTab="activ"/>
// not a React.FC to allow for generic Props
export const Tabs = <T extends string>({
  children,
  className,
  tabsList = [],
  selectedTab,
  setSelectedTabFactory,
}: React.PropsWithChildren<TabsProps<T>>): React.ReactElement | null => {
  return (
    <TabsWrapper className={className}>
      <div className="countContainer">
        {children ||
          tabsList.map((tab, index) => (
            <button
              key={index}
              type="button"
              className={tab.type === selectedTab ? 'selected' : ''}
              onClick={setSelectedTabFactory(tab.type)}
            >
              {tab.type} {tab.count && <i>{tab.count}</i>}
            </button>
          ))}
      </div>
    </TabsWrapper>
  )
}
