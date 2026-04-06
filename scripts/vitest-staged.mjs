import { execSync, spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const WORKSPACES = [
  { prefix: 'packages/core/', name: '@tribus-monitor/core' },
  { prefix: 'apps/monitor-api/', name: '@tribus-monitor/monitor-api' },
  { prefix: 'apps/check-runner/', name: '@tribus-monitor/check-runner' },
  { prefix: 'apps/dashboard/', name: '@tribus-monitor/dashboard' },
]

let gitRoot
let out
try {
  gitRoot = execSync('git rev-parse --show-toplevel', {
    encoding: 'utf8',
    cwd: root,
  }).trim()
  out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
    cwd: root,
  })
} catch {
  process.exit(1)
}

const isTestableSource = /\.(ts|tsx|js|mjs)$/
const staged = out
  .split(/\r?\n/)
  .map((f) => f.trim())
  .filter(Boolean)
  .map((f) => path.relative(root, path.resolve(gitRoot, f)).replace(/\\/g, '/'))
  .filter((f) => !f.startsWith('../') && f !== '..' && isTestableSource.test(f))

if (staged.length === 0) {
  process.exit(0)
}

const filesByWorkspace = new Map()
for (const workspace of WORKSPACES) {
  filesByWorkspace.set(workspace.name, [])
}

for (const file of staged) {
  const workspace = WORKSPACES.find((w) => file.startsWith(w.prefix))
  if (!workspace) continue
  const workspaceRelative = file.slice(workspace.prefix.length)
  if (!workspaceRelative) continue
  filesByWorkspace.get(workspace.name).push(workspaceRelative)
}

let hasFailures = false
for (const workspace of WORKSPACES) {
  const files = filesByWorkspace.get(workspace.name)
  if (!files || files.length === 0) continue

  const result = spawnSync(
    'npm',
    ['exec', '-w', workspace.name, 'vitest', 'related', '--run', '--passWithNoTests', ...files],
    {
      cwd: root,
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32',
    }
  )

  if ((result.status ?? 1) !== 0) {
    hasFailures = true
  }
}

process.exit(hasFailures ? 1 : 0)
