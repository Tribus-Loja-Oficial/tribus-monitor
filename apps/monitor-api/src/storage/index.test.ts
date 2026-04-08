import { describe, expect, it } from 'vitest'
import { createRepositories } from './index'

describe('createRepositories', () => {
  it('returns in-memory when DB binding missing', () => {
    const repos = createRepositories(undefined)
    expect(repos.serviceStates).toBeDefined()
  })

  it('returns in-memory when DB is not a D1-like object', () => {
    const repos = createRepositories({ DB: {} })
    expect(repos.serviceStates).toBeDefined()
  })
})
