export interface CoverageRepoSnapshot {
  key: 'tribus-storefront' | 'tribus-ops' | 'tribus-monitor'
  name: string
  lines: number | null
  functions: number | null
  branches: number | null
  statements: number | null
  updatedAt: string | null
  sourceUrl: string | null
}

export interface CoverageSnapshot {
  repos: CoverageRepoSnapshot[]
}

export const DEFAULT_REPOS: CoverageRepoSnapshot[] = [
  {
    key: 'tribus-storefront',
    name: 'Tribus Storefront',
    lines: null,
    functions: null,
    branches: null,
    statements: null,
    updatedAt: null,
    sourceUrl: null,
  },
  {
    key: 'tribus-ops',
    name: 'Tribus Ops',
    lines: null,
    functions: null,
    branches: null,
    statements: null,
    updatedAt: null,
    sourceUrl: null,
  },
  {
    key: 'tribus-monitor',
    name: 'Tribus Monitor',
    lines: null,
    functions: null,
    branches: null,
    statements: null,
    updatedAt: null,
    sourceUrl: null,
  },
]

function asPercentOrNull(input: unknown): number | null {
  if (typeof input !== 'number' || !Number.isFinite(input)) return null
  if (input < 0 || input > 100) return null
  return Math.round(input * 100) / 100
}

function asStringOrNull(input: unknown): string | null {
  return typeof input === 'string' && input.length > 0 ? input : null
}

function parseRepo(raw: unknown): CoverageRepoSnapshot | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as Record<string, unknown>
  const key = item.key ?? item.repoKey
  if (key !== 'tribus-storefront' && key !== 'tribus-ops' && key !== 'tribus-monitor') return null

  return {
    key,
    name:
      typeof item.name === 'string' && item.name.length > 0
        ? item.name
        : typeof item.repoName === 'string' && item.repoName.length > 0
          ? item.repoName
          : key,
    lines: asPercentOrNull(item.lines),
    functions: asPercentOrNull(item.functions),
    branches: asPercentOrNull(item.branches),
    statements: asPercentOrNull(item.statements),
    updatedAt: asStringOrNull(item.updatedAt),
    sourceUrl: asStringOrNull(item.sourceUrl) ?? asStringOrNull(item.runUrl),
  }
}

export function normalizeCoverageSnapshot(rawRows: unknown): CoverageSnapshot {
  const rows = Array.isArray(rawRows)
    ? rawRows.map(parseRepo).filter((repo): repo is CoverageRepoSnapshot => repo !== null)
    : []
  if (rows.length === 0) return { repos: DEFAULT_REPOS }

  const indexed = new Map(rows.map((repo) => [repo.key, repo]))
  return {
    repos: DEFAULT_REPOS.map((base) => indexed.get(base.key) ?? base),
  }
}
