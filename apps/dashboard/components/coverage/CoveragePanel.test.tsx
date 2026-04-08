import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CoverageRepoSnapshot, CoverageSnapshot } from '../../lib/coverage'
import { CoveragePanel } from './CoveragePanel'

const KEYS = ['tribus-storefront', 'tribus-ops', 'tribus-monitor', 'real-state'] as const

function coverageWith(rows: Partial<CoverageRepoSnapshot>[]): CoverageSnapshot {
  return {
    repos: KEYS.map((key, i) => ({
      key,
      name: `Repo ${i}`,
      lines: null,
      functions: null,
      branches: null,
      statements: null,
      updatedAt: null,
      sourceUrl: null,
      ...rows[i],
    })),
  }
}

describe('CoveragePanel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-08T15:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders Portuguese copy with accents', () => {
    render(<CoveragePanel coverage={coverageWith([])} />)
    expect(screen.getByText(/funções/)).toBeTruthy()
    expect(screen.getByText(/repositórios monitorados/)).toBeTruthy()
    expect(screen.getByText(/repositórios Tribus/)).toBeTruthy()
  })

  it('shows calendar time and relative há … for updatedAt', () => {
    render(<CoveragePanel coverage={coverageWith([{ updatedAt: '2026-04-08T14:00:00.000Z' }])} />)
    expect(screen.getByText(/há 1 h/)).toBeTruthy()
    const rel = screen.getByText(/há 1 h/)
    expect(rel.closest('article')?.textContent).toMatch(/Atualizado:/)
    expect(rel.closest('article')?.textContent).toMatch(/04\/2026/)
  })

  it('renders fonte link when sourceUrl exists', () => {
    render(
      <CoveragePanel coverage={coverageWith([{ sourceUrl: 'https://github.com/o/r/actions' }])} />
    )
    const link = screen.getByRole('link', { name: 'fonte' })
    expect(link.getAttribute('href')).toBe('https://github.com/o/r/actions')
  })

  it('applies bar tones and N/A for null metrics', () => {
    const data: CoverageSnapshot = {
      repos: [
        {
          key: 'tribus-storefront',
          name: 'A',
          lines: 95,
          functions: 85,
          branches: 75,
          statements: 55,
          updatedAt: null,
          sourceUrl: null,
        },
        {
          key: 'tribus-ops',
          name: 'B',
          lines: 49,
          functions: 49,
          branches: 49,
          statements: 49,
          updatedAt: null,
          sourceUrl: null,
        },
        {
          key: 'tribus-monitor',
          name: 'C',
          lines: null,
          functions: null,
          branches: null,
          statements: null,
          updatedAt: null,
          sourceUrl: null,
        },
        {
          key: 'real-state',
          name: 'D',
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
          updatedAt: null,
          sourceUrl: null,
        },
      ],
    }
    const { container } = render(<CoveragePanel coverage={data} />)
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-emerald-500').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-lime-500').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-amber-500').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-orange-500').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-rose-500').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.bg-slate-300').length).toBeGreaterThan(0)
  })
})
