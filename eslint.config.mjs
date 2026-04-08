import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-config-prettier'

const tsconfigRootDir = path.dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: ['**/dist/**', '**/.next/**', '**/coverage/**', '**/node_modules/**'],
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Packages with `include: ["src/**/*"]` only; dashboard uses `**/*.ts` so vitest.config is already in-project
        projectService: {
          allowDefaultProject: [
            'apps/check-runner/vitest.config.ts',
            'apps/monitor-api/vitest.config.ts',
            'packages/core/vitest.config.ts',
          ],
        },
        tsconfigRootDir,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  prettier,
]
