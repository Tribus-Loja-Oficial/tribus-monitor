import { Suspense } from 'react'
import { fetchDashboardData } from '../lib/monitor-api'
import { DashboardClient } from '../components/dashboard/DashboardClient'
import { DashboardUnavailable } from '../components/dashboard/DashboardUnavailable'

async function DashboardContent() {
  try {
    const initialData = await fetchDashboardData()
    return <DashboardClient initialData={initialData} />
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error'
    return <DashboardUnavailable reason={reason} />
  }
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
