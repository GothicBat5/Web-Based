import { readFile, writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

async function fetchLatestModels () {
  const response = await fetch('https://docs.claude.com/en/docs/about-claude/models/overview')
  const html = await response.text()
  const modelTypes = ['sonnet', 'haiku', 'opus']
  const models = {}

  function compareModelVersions (a, b) {
    const segmentsOf = str => {
      const parts = str.split('-')
      return parts.map(s => {
        if (!s.match(/^\d+$/)) return s
        const num = parseInt(s, 10)
        const isDate = s.length === 8
        return { num, isDate }
      })
    }

    const sa = segmentsOf(a)
    const sb = segmentsOf(b)
    const len = Math.max(sa.length, sb.length)

    for (let i = 0; i < len; i++) {
      const va = sa[i]
      const vb = sb[i]

      // Missing segment is lowest priority
      if (!va) return -1
      if (!vb) return 1

      // String segments: lexicographic comparison
      if (typeof va === 'string' && typeof vb === 'string') {
        if (va < vb) return -1
        if (va > vb) return 1
        continue
      }

      // Mixed string/number: shouldn't happen, but treat strings as lower
      if (typeof va === 'string') return -1
      if (typeof vb === 'string') return 1

      // Both are numbers: version number beats date, then compare numerically
      if (!va.isDate && vb.isDate) return 1 // version > date
      if (va.isDate && !vb.isDate) return -1 // date < version

      if (va.num < vb.num) return -1
      if (va.num > vb.num) return 1
    }
    return 0
  }

  for (const modelType of modelTypes) {

    const anthropicPattern = new RegExp(`claude-${modelType}-\\d+(?:-\\d+)?(?:-\\d{8})?`, 'g')
    const bedrockPattern = new RegExp(`anthropic\\.claude-${modelType}-\\d+(?:-\\d+)?(?:-\\d{8})?(?:-v1(?::0)?)?`, 'g')
    const anthropicMatches = html.match(anthropicPattern)
    const bedrockMatches = html.match(bedrockPattern)

    function isSquashedVersion (match, allMatches) {
      const parts = match.split('-')
      for (const part of parts) {
        if (/^\d+$/.test(part) && part.length !== 8) {
          const n = parseInt(part, 10)
          // Two-digit numbers (10-99) that are not dates are suspicious as mushed versions
          if (n >= 10 && n <= 99) {

            const s = part
            for (let splitPos = 1; splitPos < s.length; splitPos++) {
              const a = s.substring(0, splitPos)
              const b = s.substring(splitPos)
              const splitVersion = match.replace(part, `${a}-${b}`)
              if (allMatches.includes(splitVersion)) {
                return true
              }
            }
          }
        }
      }
      return false
    }

    const filteredAnthropic = anthropicMatches
      ? [...new Set(anthropicMatches)].filter(m => !isSquashedVersion(m, anthropicMatches))
      : null
    const filteredBedrock = bedrockMatches
      ? [...new Set(bedrockMatches)].filter(m => !isSquashedVersion(m, bedrockMatches))
      : null

    if (filteredAnthropic && filteredBedrock) {
  
      const latestAnthropic = [...filteredAnthropic].sort(compareModelVersions).at(-1)
      const latestBedrock = [...filteredBedrock].sort(compareModelVersions).at(-1)
     
      let normalizedBedrock = latestBedrock
      if (normalizedBedrock.endsWith('-v1')) {
        normalizedBedrock = `${normalizedBedrock}:0`
      } else if (!/-v\d+:\d+$/.test(normalizedBedrock)) {
        normalizedBedrock = `${normalizedBedrock}-v1:0`
      }
      models[modelType] = {
        anthropic: latestAnthropic,

        bedrock: `global.${normalizedBedrock}`
      }
    } else {
      console.warn(`Warning: Could not find ${modelType} model identifiers in the documentation`)
    }
  }

  if (Object.keys(models).length === 0) {
    throw new Error('Could not find any Claude model identifiers in the documentation')
  }

  return models
}

async function updateFile (filePath, updates) {
  const content = await readFile(filePath, 'utf-8')
  let updatedContent = content

  for (const { search, replace } of updates) {
    updatedContent = updatedContent.replace(search, replace)
  }

  if (content !== updatedContent) {
    await writeFile(filePath, updatedContent, 'utf-8')
    return true
  }

  return false
}

async function main () {
  try {
    console.log('Fetching latest Anthropic model identifiers...')
    const models = await fetchLatestModels()

    // Display found models
    for (const [modelType, modelIds] of Object.entries(models)) {
      console.log(`Latest ${modelType} models:`)
      console.log(`  Anthropic API: ${modelIds.anthropic}`)
      console.log(`  Bedrock: ${modelIds.bedrock}`)
    }

    let hasChanges = false

    const defaultModel = models.opus || models.sonnet || models.haiku
    if (!defaultModel) {
      throw new Error('No models found to set as default')
    }

    // Update action.cjs
    console.log('\nUpdating action.cjs...')
    const actionUpdated = await updateFile(
      join(rootDir, 'action.cjs'),
      [
        {
          search: /anthropic_models: 'claude-(?:sonnet|haiku|opus)-\d+(?:-\d+)?(?:-\d{8})?'/,
          replace: `anthropic_models: '${defaultModel.anthropic}'`
        },
        {
          search: /bedrock_models: 'global\.anthropic\.claude-(?:sonnet|haiku|opus)-\d+(?:-\d+)?(?:-\d{8})?-v1(?::0)?'/,
          replace: `bedrock_models: '${defaultModel.bedrock}'`
        }
      ]
    )
    if (actionUpdated) {
      console.log('✓ Updated action.cjs')
      hasChanges = true
    } else {
      console.log('- No changes needed in action.cjs')
    }

    // Update anthropicExplainPatch.js
    console.log('\nUpdating anthropicExplainPatch.js...')
    const anthropicUpdated = await updateFile(
      join(rootDir, 'src/anthropicExplainPatch.js'),
      [
        {
          search: /models = \['claude-(?:sonnet|haiku|opus)-\d+(?:-\d+)?(?:-\d{8})?'\]/,
          replace: `models = ['${defaultModel.anthropic}']`
        }
      ]
    )
    if (anthropicUpdated) {
      console.log('✓ Updated anthropicExplainPatch.js')
      hasChanges = true
    } else {
      console.log('- No changes needed in anthropicExplainPatch.js')
    }
    console.log('\nUpdating bedrockExplainPatch.js...')

    const bedrockContent = await readFile(join(rootDir, 'src/bedrockExplainPatch.js'), 'utf-8')

    const bedrockUpdates = [
      {
        search: /models = \['(?:global\.)?anthropic\.claude-(?:3-7-sonnet-\d{8}|(?:sonnet|haiku|opus)-\d+(?:-\d+)?(?:-\d{8})?)-v1(?::0)?'\]/,
        replace: `models = ['${defaultModel.bedrock}']`
      }
    ]

    for (const [, modelIds] of Object.entries(models)) {
      if (!bedrockContent.includes(`'${modelIds.bedrock}': anthropicCountTokens`)) {
        // Find the last anthropic model entry and add after it
        bedrockUpdates.push({
          search: /('(?:global\.)?anthropic\.claude-(?:sonnet|haiku|opus)-\d+(?:-\d+)?(?:-\d{8})?-v1(?::0)?': anthropicCountTokens,)\n/,
          replace: `$1\n  '${modelIds.bedrock}': anthropicCountTokens,\n`
        })
      }
    }

    const bedrockUpdated = await updateFile(
      join(rootDir, 'src/bedrockExplainPatch.js'),
      bedrockUpdates
    )
    if (bedrockUpdated) {
      console.log('✓ Updated bedrockExplainPatch.js')
      if (bedrockUpdates.length > 1) {
        console.log(`  - Added ${bedrockUpdates.length - 1} model(s) to COUNT_TOKENS_HASHFUN`)
      }
      hasChanges = true
    } else {
      console.log('- No changes needed in bedrockExplainPatch.js')
    }

    if (hasChanges) {
      console.log('\n✓ Model identifiers updated successfully')
      process.exit(0)
    } else {
      console.log('\n✓ All model identifiers are already up to date')
      process.exit(1) // Exit with code 1 to signal no changes
    }
  } catch (error) {
    console.error('Error updating models:', error)
    process.exit(1)
  }
}

main()
