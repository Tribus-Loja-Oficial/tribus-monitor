'use client'

import type { ReactNode } from 'react'
import { MonitorDialogsProvider } from '../components/ui/MonitorDialogs'

export function Providers({ children }: { children: ReactNode }) {
  return <MonitorDialogsProvider>{children}</MonitorDialogsProvider>
}
