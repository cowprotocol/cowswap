import { getJestProjects } from '@nx/jest'

const jestConfig = {
  projects: getJestProjects(),
}

export default jestConfig
