const { execSync } = require('child_process')

// Define the list of projects in your workspace
const projects = ['src/libs/abis']

// Install dependencies for each project
projects.forEach((project) => {
  const command = `cd ${project} && yarn`
  console.log(`[scripts:postinstall] Installing dependencies for ${project}: ${command}`)
  execSync(command)
})
