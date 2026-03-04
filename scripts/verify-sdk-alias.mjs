import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const viteConfigPath = path.join(rootDir, 'vite.config.ts')
const shimPath = "./src/azuroSdkSocialAaConnectorShim.ts"

const source = fs.readFileSync(viteConfigPath, 'utf8')

const hasAliasKey = source.includes("'@azuro-org/sdk-social-aa-connector'")
const hasShimTarget = source.includes(shimPath)

if (!hasAliasKey || !hasShimTarget) {
  console.error('Alias guard failed.')
  console.error("Expected '@azuro-org/sdk-social-aa-connector' to point to src/azuroSdkSocialAaConnectorShim.ts.")
  process.exit(1)
}

console.log('Alias guard passed.')
