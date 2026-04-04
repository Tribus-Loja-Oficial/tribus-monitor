import type { StorageRepositories } from '../types'
import { createInMemoryRepositories } from './in-memory'

/**
 * D1-ready adapter entry point.
 *
 * This first version intentionally falls back to in-memory repositories when
 * D1 bindings are absent. SQL-backed repositories can be plugged here without
 * changing service or route layers.
 */
export function createD1Repositories(_dbBinding: unknown): StorageRepositories {
  void _dbBinding
  return createInMemoryRepositories()
}
