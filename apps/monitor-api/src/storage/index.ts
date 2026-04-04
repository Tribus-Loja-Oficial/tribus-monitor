import type { MonitorEnv, StorageRepositories } from '../types'
import { createD1Repositories } from './d1-repositories'
import { createInMemoryRepositories } from './in-memory'

export function createRepositories(bindings?: MonitorEnv): StorageRepositories {
  if (bindings?.DB) return createD1Repositories(bindings.DB)
  return createInMemoryRepositories()
}
