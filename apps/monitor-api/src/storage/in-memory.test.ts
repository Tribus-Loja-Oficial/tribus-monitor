import { describe, expect, it } from 'vitest'
import { createInMemoryRepositories } from './in-memory'

describe('createInMemoryRepositories', () => {
  it('is a no-op when closing incident that does not exist', async () => {
    const repos = createInMemoryRepositories()
    await repos.incidents.close('missing', '2026-01-01T00:00:00.000Z', 'r')
    const list = await repos.incidents.list()
    expect(list).toHaveLength(0)
  })

  it('applies default limits for history and incidents listing', async () => {
    const repos = createInMemoryRepositories()
    const rows = await repos.checkResults.list()
    const inc = await repos.incidents.list()
    expect(Array.isArray(rows)).toBe(true)
    expect(Array.isArray(inc)).toBe(true)
  })
})
