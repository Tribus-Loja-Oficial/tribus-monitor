#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

function parseArgs(argv) {
  const args = {
    repoKey: '',
    repoName: '',
    reports: [],
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
    if (current === '--report' && next) {
      args.reports.push(next)
      i += 1
    }
  }

  if (!args.repoKey || !args.repoName || args.reports.length === 0) {
    throw new Error(
      'Usage: node scripts/publish-coverage.mjs --repo-key <key> --repo-name <name> --report <path> [--report <path>...]'
    )
  }

  return args
}

function emptyTotals() {
  return {
    lines: { covered: 0, total: 0 },
    functions: { covered: 0, total: 0 },
    branches: { covered: 0, total: 0 },
    statements: { covered: 0, total: 0 },
  }
}

async function readReport(path) {
  const content = await readFile(path, 'utf8')
  const parsed = JSON.parse(content)
  const coverageMap = parsed.coverageMap
  if (!coverageMap || typeof coverageMap !== 'object') {
    throw new Error(`Invalid vitest report (missing coverageMap): ${path}`)
  }

  const totals = emptyTotals()

  for (const file of Object.values(coverageMap)) {
    if (!file || typeof file !== 'object') continue
    const entry = file

    const statementCounts = entry.s ?? {}
    const statementKeys = Object.keys(statementCounts)
    totals.statements.total += statementKeys.length
    totals.statements.covered += statementKeys.reduce(
      (acc, key) => acc + (Number(statementCounts[key]) > 0 ? 1 : 0),
      0
    )

    const functionCounts = entry.f ?? {}
    const functionKeys = Object.keys(functionCounts)
    totals.functions.total += functionKeys.length
    totals.functions.covered += functionKeys.reduce(
      (acc, key) => acc + (Number(functionCounts[key]) > 0 ? 1 : 0),
      0
    )

    const branchCounts = entry.b ?? {}
    for (const branchValues of Object.values(branchCounts)) {
      if (!Array.isArray(branchValues)) continue
      totals.branches.total += branchValues.length
      totals.branches.covered += branchValues.reduce(
        (acc, hits) => acc + (Number(hits) > 0 ? 1 : 0),
        0
      )
    }

    const statementMap = entry.statementMap ?? {}
    const lineHits = new Map()
    for (const [statementId, loc] of Object.entries(statementMap)) {
      const line = loc?.start?.line
      if (typeof line !== 'number') continue
      const hits = Number(statementCounts[statementId] ?? 0)
      lineHits.set(line, (lineHits.get(line) ?? 0) + hits)
    }
    totals.lines.total += lineHits.size
    totals.lines.covered += Array.from(lineHits.values()).reduce(
      (acc, hits) => acc + (Number(hits) > 0 ? 1 : 0),
      0
    )
  }

  return totals
}

function mergeTotals(totals) {
  const base = emptyTotals()

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
  const { repoKey, repoName, reports } = parseArgs(process.argv.slice(2))
  const apiBaseUrl = process.env.MONITOR_API_URL
  const token = process.env.MONITOR_COVERAGE_TOKEN
  if (!apiBaseUrl || !token) {
    throw new Error('Missing MONITOR_API_URL or MONITOR_COVERAGE_TOKEN.')
  }

  const totals = await Promise.all(reports.map((path) => readReport(path)))
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
