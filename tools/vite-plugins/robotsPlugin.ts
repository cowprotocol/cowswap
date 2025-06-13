import * as fs from 'fs'
import * as fsp from 'fs/promises'
import * as path from 'path'

import type { Plugin, ResolvedConfig } from 'vite'

type Options = {
  robotsDir?: string
  outputRobotsFileName?: string
  publicPath?: string
}

const DEFAULT_OPTIONS: Required<Options> = {
  robotsDir: '',
  outputRobotsFileName: 'robots.txt',
  publicPath: 'public',
}

export function robotsPlugin(_options: Options = DEFAULT_OPTIONS): Plugin {
  let rootConfig: ResolvedConfig

  const options = { ...DEFAULT_OPTIONS, ..._options }

  return {
    name: 'vite-robots-plugin',
    enforce: 'pre',
    apply: 'build',
    configResolved(c: ResolvedConfig) {
      rootConfig = c
    },
    async buildStart() {
      const localRobotsFileName = `.robots.${rootConfig.mode}.txt.local`
      const robotsDir = path.resolve(rootConfig.root, options.robotsDir)
      const robotsFileName = fs.existsSync(path.resolve(robotsDir, localRobotsFileName))
        ? localRobotsFileName
        : `.robots.${rootConfig.mode}.txt`
      const robotsPath = path.resolve(robotsDir, robotsFileName)

      const robotsOutputPath = path.resolve(options.publicPath, options.outputRobotsFileName)

      await fsp.copyFile(robotsPath, robotsOutputPath)
    },
  }
}
