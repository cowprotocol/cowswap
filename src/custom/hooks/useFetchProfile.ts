import { useActiveWeb3React } from 'hooks/web3'
import { useEffect, useState } from 'react'
import { getProfileData } from 'api/cow'
import { ProfileData } from 'api/cow/api'

type FetchProfileState = {
  profileData: ProfileData | null
  error: string
  isLoading: boolean
}

const emptyState: FetchProfileState = {
  profileData: null,
  error: '',
  isLoading: false,
}

const FETCH_INTERVAL_IN_MINUTES = 5

export default function useFetchProfile(): FetchProfileState {
  const { account, chainId } = useActiveWeb3React()
  const [profile, setProfile] = useState<FetchProfileState>(emptyState)

  useEffect(() => {
    async function fetchAndSetProfileData() {
      try {
        if (chainId && account) {
          setProfile((profile) => ({ ...profile, isLoading: true, error: '' }))
          const profileData = await getProfileData(chainId, account)
          setProfile((profile) => ({ ...profile, isLoading: false, profileData }))
        } else {
          setProfile(emptyState)
        }
      } catch (error) {
        console.error(error)
        setProfile((profile) => ({
          ...profile,
          isLoading: false,
          error: 'There was an error while fetching the profile data',
        }))
      }
    }

    const intervalId = setInterval(fetchAndSetProfileData, FETCH_INTERVAL_IN_MINUTES * 60_000)

    fetchAndSetProfileData()
    return () => clearInterval(intervalId)
  }, [account, chainId])

  return profile
}
