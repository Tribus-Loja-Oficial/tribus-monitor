#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

function parseArgs(argv) {
  const args = {
    repoKey: '',
    repoName: '',
    summaries: [],
  }

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i]
    const next = argv[i + 1]
    if (current === '--repo-key' && next) {
      args.repoKey = next
      i += 1
      continue
    }
    if (current === '--repo-name' && next) {
      args.repoName = next
      i += 1
      continue
    }
    if (current === '--summary' && next) {
      args.summaries.push(next)
      i += 1
    }
  }

  if (!args.repoKey || !args.repoName || args.summaries.length === 0) {
    throw new Error(
      'Usage: node scripts/publish-coverage.mjs --repo-key <key> --repo-name <name> --summary <path> [--summary <path>...]'
    )
  }

  return args
}

async function readSummary(path) {
  const content = await readFile(path, 'utf8')
  const parsed = JSON.parse(content)
  return parsed.total
}

function mergeTotals(totals) {
  const base = {
    lines: { covered: 0, total: 0 },
    functions: { covered: 0, total: 0 },
    branches: { covered: 0, total: 0 },
    statements: { covered: 0, total: 0 },
  }

  for (const item of totals) {
    for (const key of Object.keys(base)) {
      const metric = item[key]
      if (!metric || typeof metric.covered !== 'number' || typeof metric.total !== 'number')
        continue
      base[key].covered += metric.covered
      base[key].total += metric.total
    }
  }

  return base
}

function pct(covered, total) {
  if (!total) return 0
  return Math.round((covered / total) * 10000) / 100
}

async function main() {
  const { repoKey, repoName, summaries } = parseArgs(process.argv.slice(2))
  const apiBaseUrl = process.env.MONITOR_API_URL
  const token = process.env.MONITOR_COVERAGE_TOKEN
  if (!apiBaseUrl || !token) {
    throw new Error('Missing MONITOR_API_URL or MONITOR_COVERAGE_TOKEN.')
  }

  const totals = await Promise.all(summaries.map((path) => readSummary(path)))
  const merged = mergeTotals(totals)

  const runUrl =
    process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : null

  const payload = {
    repoKey,
    repoName,
    lines: pct(merged.lines.covered, merged.lines.total),
    functions: pct(merged.functions.covered, merged.functions.total),
    branches: pct(merged.branches.covered, merged.branches.total),
    statements: pct(merged.statements.covered, merged.statements.total),
    commitSha: process.env.GITHUB_SHA ?? null,
    runUrl,
    updatedAt: new Date().toISOString(),
  }

  const response = await fetch(`${apiBaseUrl}/coverage`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Coverage publish failed (${response.status}): ${text}`)
  }

  console.log(JSON.stringify({ event: 'coverage_published', repoKey, payload }))
}

void main()
